// Supabase Edge Function: membuat pesanan sorot + token pembayaran Midtrans Snap.
// Harga dihitung DI SINI (server), bukan dipercaya dari browser.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PRICES: Record<number, number> = { 1: 2000, 3: 5000, 7: 10000 }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')
    if (!serverKey) {
      return json({ error: 'Pembayaran belum dikonfigurasi di server.' }, 500)
    }
    const isProduction = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true'

    // 1. Siapa yang memanggil?
    const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const admin = createClient(supabaseUrl, serviceKey)
    const { data: userRes, error: userErr } = await admin.auth.getUser(jwt)
    if (userErr || !userRes.user) return json({ error: 'Silakan masuk dulu.' }, 401)
    const user = userRes.user

    // 2. Validasi input
    const body = await req.json().catch(() => null)
    const productId = body?.productId
    const days = Number(body?.days)
    const amount = PRICES[days]
    if (typeof productId !== 'string' || !amount) {
      return json({ error: 'Data pesanan tidak valid.' }, 400)
    }

    // 3. Hanya pemilik barang, dan akun harus sudah terverifikasi KTM
    const { data: product } = await admin
      .from('products')
      .select('id, owner_id')
      .eq('id', productId)
      .maybeSingle()
    if (!product || product.owner_id !== user.id) {
      return json({ error: 'Kamu hanya bisa menyorot barang milikmu sendiri.' }, 403)
    }
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, ktm_status')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.ktm_status !== 'verified') {
      return json({ error: 'Akunmu harus terverifikasi KTM dulu.' }, 403)
    }

    // 4. Buat pesanan (status: menunggu)
    const { data: order, error: orderErr } = await admin
      .from('highlight_orders')
      .insert({ user_id: user.id, product_id: productId, days, amount })
      .select('id')
      .single()
    if (orderErr || !order) return json({ error: 'Gagal membuat pesanan.' }, 500)

    // 5. Minta token pembayaran ke Midtrans Snap
    const base = isProduction
      ? 'https://app.midtrans.com'
      : 'https://app.sandbox.midtrans.com'
    const midtransOrderId = `HL-${order.id}`

    const res = await fetch(`${base}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Basic ' + btoa(`${serverKey}:`),
      },
      body: JSON.stringify({
        transaction_details: { order_id: midtransOrderId, gross_amount: amount },
        item_details: [
          {
            id: productId.slice(0, 50),
            price: amount,
            quantity: 1,
            name: `Sorot barang ${days} hari`,
          },
        ],
        customer_details: {
          first_name: (profile?.full_name || 'Pengguna Lulusin').slice(0, 50),
          email: user.email,
        },
      }),
    })
    const snap = await res.json().catch(() => ({}))

    if (!res.ok || !snap.token) {
      await admin.from('highlight_orders').update({ status: 'failed' }).eq('id', order.id)
      const detail = Array.isArray(snap.error_messages)
        ? snap.error_messages.join(', ')
        : 'Midtrans menolak permintaan.'
      return json({ error: `Gagal membuat pembayaran: ${detail}` }, 502)
    }

    await admin.from('highlight_orders').update({ snap_token: snap.token }).eq('id', order.id)
    return json({ token: snap.token, orderId: order.id })
  } catch (e) {
    console.error('create-highlight-order error', e)
    return json({ error: 'Terjadi kesalahan di server.' }, 500)
  }
})
