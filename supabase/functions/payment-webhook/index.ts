// Supabase Edge Function: menerima notifikasi pembayaran dari Midtrans.
// WAJIB di-deploy dengan "Verify JWT" dimatikan (Midtrans tidak membawa token login).
// Keamanan: tanda tangan notifikasi dicek, lalu status dikonfirmasi ulang ke API Midtrans.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

const sha512 = async (text: string) =>
  toHex(await crypto.subtle.digest('SHA-512', new TextEncoder().encode(text)))

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')
  if (!serverKey) return new Response('Not configured', { status: 500 })
  const isProduction = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true'

  let n: Record<string, string>
  try {
    n = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  // 1. Tanda tangan: sha512(order_id + status_code + gross_amount + server_key)
  const expected = await sha512(
    `${n.order_id}${n.status_code}${n.gross_amount}${serverKey}`,
  )
  if (!n.signature_key || expected !== n.signature_key) {
    return new Response('Invalid signature', { status: 401 })
  }

  // 2. Hanya pesanan kita (HL-<uuid>). Notifikasi uji dari dashboard diabaikan.
  const orderUuid = String(n.order_id ?? '').replace(/^HL-/, '')
  if (!String(n.order_id).startsWith('HL-') || !UUID_RE.test(orderUuid)) {
    return new Response('Ignored', { status: 200 })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: order } = await admin
    .from('highlight_orders')
    .select('id, amount, status')
    .eq('id', orderUuid)
    .maybeSingle()
  if (!order) return new Response('Ignored', { status: 200 })

  // 3. Nominal harus sama dengan pesanan
  if (Number(n.gross_amount) !== order.amount) {
    console.error('Nominal tidak cocok', n.order_id, n.gross_amount, order.amount)
    return new Response('Amount mismatch', { status: 400 })
  }

  // 4. Konfirmasi status langsung ke Midtrans (lebih tepercaya daripada isi notifikasi)
  const apiBase = isProduction ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'
  const statusRes = await fetch(`${apiBase}/v2/${encodeURIComponent(n.order_id)}/status`, {
    headers: { Accept: 'application/json', Authorization: 'Basic ' + btoa(`${serverKey}:`) },
  })
  if (!statusRes.ok) return new Response('Status check failed', { status: 502 }) // Midtrans akan mencoba lagi
  const st = await statusRes.json()

  const ts: string = st.transaction_status
  const fraud: string | undefined = st.fraud_status

  if (st.payment_type) {
    await admin.from('highlight_orders').update({ payment_type: st.payment_type }).eq('id', order.id)
  }

  if (ts === 'settlement' || (ts === 'capture' && fraud === 'accept')) {
    const { error } = await admin.rpc('activate_highlight', { p_order: order.id })
    if (error) {
      console.error('activate_highlight gagal', error)
      return new Response('Activation failed', { status: 500 })
    }
  } else if (ts === 'expire') {
    if (order.status === 'pending') {
      await admin.from('highlight_orders').update({ status: 'expired' }).eq('id', order.id)
    }
  } else if (ts === 'deny' || ts === 'cancel' || ts === 'failure') {
    if (order.status === 'pending') {
      await admin.from('highlight_orders').update({ status: 'failed' }).eq('id', order.id)
    }
  }
  // 'pending' (menunggu pembayaran): tidak ada yang diubah.

  return new Response('OK', { status: 200 })
})
