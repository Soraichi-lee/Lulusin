import type { RealtimeChannel } from '@supabase/supabase-js'
import type {
  ChatMessage,
  ChatThread,
  ProductItem,
  SellerInfo,
} from '../data/lulusinData'
import { supabase } from './supabase'

// ------------------------------------------------------------------ util
export type KtmStatus = 'none' | 'pending' | 'verified' | 'rejected'

export interface Profile {
  id: string
  fullName: string
  facultyProdi: string
  ktmStatus: KtmStatus
  isAdmin: boolean
}

const client = () => {
  if (!supabase) throw new Error('Backend belum dikonfigurasi.')
  return supabase
}

/** Terjemahan pesan galat yang paling sering muncul. */
const friendly = (message: string): string => {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email atau kata sandi salah.'
  if (m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek kotak masuk emailmu.'
  if (m.includes('user already registered')) return 'Email ini sudah terdaftar. Silakan masuk.'
  if (m.includes('rate limit'))
    return 'Terlalu banyak email terkirim. Tunggu sekitar 1 jam, atau matikan "Confirm email" di pengaturan Auth Supabase saat uji coba.'
  if (m.includes('password should be at least')) return 'Kata sandi terlalu pendek (minimal 6 karakter).'
  if (m.includes('row-level security') || m.includes('violates row-level'))
    return 'Akunmu belum terverifikasi KTM, jadi aksi ini belum diizinkan.'
  if (m.includes('failed to fetch') || m.includes('network'))
    return 'Tidak dapat terhubung ke server. Periksa koneksi internetmu.'
  return message
}

const errorOf = (e: unknown): string =>
  friendly(e instanceof Error ? e.message : String(e))

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> =>
  (await fetch(dataUrl)).blob()

const newId = () => crypto.randomUUID()

const clock = (iso: string): string => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
}

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?'

const AVATAR_COLORS = ['#2F5FD6', '#17683A', '#D23A70', '#6E45D3', '#B26A00', '#0F8A8A']
const avatarColorFor = (id: string): string => {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const sellerFromProfile = (p: Profile): SellerInfo => ({
  id: p.id,
  name: p.fullName || 'Mahasiswa',
  initials: initialsOf(p.fullName),
  avatarBg: avatarColorFor(p.id),
  faculty: p.facultyProdi,
  rating: 'Baru',
  transactionsCount: 0,
  verifiedKtm: p.ktmStatus === 'verified',
})

// ------------------------------------------------------------------ auth
export async function signUp(input: {
  email: string
  password: string
  fullName: string
  facultyProdi: string
}): Promise<{ error?: string; needsEmailConfirm?: boolean }> {
  try {
    const { data, error } = await client().auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: { full_name: input.fullName.trim(), faculty_prodi: input.facultyProdi },
      },
    })
    if (error) return { error: friendly(error.message) }
    return { needsEmailConfirm: !data.session }
  } catch (e) {
    return { error: errorOf(e) }
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ error?: string; userId?: string }> {
  try {
    const { data, error } = await client().auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) return { error: friendly(error.message) }
    return { userId: data.user?.id }
  } catch (e) {
    return { error: errorOf(e) }
  }
}

export async function signOut(): Promise<void> {
  try {
    await client().auth.signOut()
  } catch {
    /* abaikan */
  }
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await client()
      .from('profiles')
      .select('id, full_name, faculty_prodi, ktm_status, is_admin')
      .eq('id', userId)
      .maybeSingle()
    if (error || !data) return null
    return {
      id: data.id,
      fullName: data.full_name,
      facultyProdi: data.faculty_prodi,
      ktmStatus: data.ktm_status as KtmStatus,
      isAdmin: data.is_admin,
    }
  } catch {
    return null
  }
}

// ------------------------------------------------------------------ KTM
export async function submitKtm(
  nim: string,
  photoDataUrl: string,
): Promise<{ error?: string }> {
  try {
    const sb = client()
    const { data: userRes } = await sb.auth.getUser()
    const user = userRes.user
    if (!user) return { error: 'Kamu belum masuk. Silakan masuk dulu.' }

    const path = `${user.id}/ktm-${Date.now()}.jpg`
    const blob = await dataUrlToBlob(photoDataUrl)
    const up = await sb.storage
      .from('ktm')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
    if (up.error) return { error: friendly(up.error.message) }

    const { error } = await sb.rpc('submit_ktm', { p_nim: nim.trim(), p_path: path })
    if (error) {
      await sb.storage.from('ktm').remove([path])
      return { error: friendly(error.message) }
    }
    return {}
  } catch (e) {
    return { error: errorOf(e) }
  }
}

/** NIM yang pernah dikirim pengguna saat verifikasi (kosong bila belum ada). */
export async function fetchMyKtmNim(userId: string): Promise<string> {
  try {
    const { data } = await client()
      .from('ktm_submissions')
      .select('nim')
      .eq('user_id', userId)
      .maybeSingle()
    return (data?.nim as string | undefined) ?? ''
  } catch {
    return ''
  }
}

// -------------------------------------------------------------- products
async function uploadProductPhotos(
  userId: string,
  photos: string[],
): Promise<string[]> {
  const sb = client()
  const urls: string[] = []
  for (const src of photos) {
    if (!src.startsWith('data:')) {
      urls.push(src) // sudah berupa URL
      continue
    }
    const path = `${userId}/${newId()}.jpg`
    const blob = await dataUrlToBlob(src)
    const up = await sb.storage
      .from('product-photos')
      .upload(path, blob, { contentType: 'image/jpeg' })
    if (up.error) throw new Error(up.error.message)
    urls.push(sb.storage.from('product-photos').getPublicUrl(path).data.publicUrl)
  }
  return urls
}

export async function createProduct(
  item: ProductItem,
  owner: Profile,
): Promise<{ product?: ProductItem; error?: string }> {
  try {
    const photos = item.photos?.length
      ? await uploadProductPhotos(owner.id, item.photos)
      : undefined
    const product: ProductItem = {
      ...item,
      id: `p-${newId()}`,
      photos,
      seller: sellerFromProfile(owner),
    }
    const { error } = await client()
      .from('products')
      .insert({ id: product.id, owner_id: owner.id, data: product })
    if (error) return { error: friendly(error.message) }
    return { product }
  } catch (e) {
    return { error: errorOf(e) }
  }
}

export async function fetchProducts(): Promise<ProductItem[]> {
  try {
    const { data, error } = await client()
      .from('products')
      .select('data')
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return data.map((r) => r.data as ProductItem)
  } catch {
    return []
  }
}

// ------------------------------------------------------------------ chat
interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  body: string | null
  image_path: string | null
  created_at: string
}

async function signedUrlMap(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths)]
  if (unique.length === 0) return {}
  const { data } = await client()
    .storage.from('chat-images')
    .createSignedUrls(unique, 60 * 60)
  const map: Record<string, string> = {}
  for (const r of data ?? []) if (r.path && r.signedUrl) map[r.path] = r.signedUrl
  return map
}

export const toChatMessage = (
  row: MessageRow,
  me: string,
  urls: Record<string, string>,
): ChatMessage => ({
  id: row.id,
  sender: row.sender_id === me ? 'me' : 'them',
  text: row.body ?? undefined,
  imageUrl: row.image_path ? urls[row.image_path] : undefined,
  time: clock(row.created_at),
})

export async function fetchThreads(me: string): Promise<ChatThread[]> {
  try {
    const sb = client()
    const { data: convs, error } = await sb
      .from('conversations')
      .select('id, product_id, buyer_id, seller_id, created_at')
      .order('created_at', { ascending: false })
    if (error || !convs || convs.length === 0) return []

    const convIds = convs.map((c) => c.id)
    const partnerIds = [
      ...new Set(convs.map((c) => (c.buyer_id === me ? c.seller_id : c.buyer_id))),
    ]

    const [{ data: msgs }, { data: profs }] = await Promise.all([
      sb
        .from('messages')
        .select('id, conversation_id, sender_id, body, image_path, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: true }),
      sb
        .from('profiles')
        .select('id, full_name, faculty_prodi, ktm_status, is_admin')
        .in('id', partnerIds),
    ])

    const rows = (msgs ?? []) as MessageRow[]
    const urls = await signedUrlMap(
      rows.filter((r) => r.image_path).map((r) => r.image_path as string),
    )
    const profileById = new Map<string, Profile>()
    for (const p of profs ?? []) {
      profileById.set(p.id as string, {
        id: p.id as string,
        fullName: p.full_name as string,
        facultyProdi: p.faculty_prodi as string,
        ktmStatus: p.ktm_status as KtmStatus,
        isAdmin: p.is_admin as boolean,
      })
    }

    return convs.map((c) => {
      const partnerId = c.buyer_id === me ? c.seller_id : c.buyer_id
      const partner: Profile = profileById.get(partnerId) ?? {
        id: partnerId,
        fullName: 'Mahasiswa',
        facultyProdi: '',
        ktmStatus: 'none',
        isAdmin: false,
      }
      const messages = rows
        .filter((r) => r.conversation_id === c.id)
        .map((r) => toChatMessage(r, me, urls))
      const own = rows.filter((r) => r.conversation_id === c.id)
      const last = own[own.length - 1]
      return {
        id: `c-${c.id}`,
        partner: sellerFromProfile(partner),
        onlineStatus: partner.facultyProdi,
        unreadCount: 0,
        lastTime: last ? clock(last.created_at) : clock(c.created_at),
        attachedProductId: c.product_id,
        messages,
      } satisfies ChatThread
    })
  } catch {
    return []
  }
}

/** Mencari atau membuat percakapan pembeli ↔ penjual untuk satu barang. */
export async function openConversation(
  productId: string,
  sellerId: string,
): Promise<{ id?: string; error?: string }> {
  try {
    const sb = client()
    const { data: userRes } = await sb.auth.getUser()
    const user = userRes.user
    if (!user) return { error: 'Kamu belum masuk.' }
    if (user.id === sellerId) return { error: 'Ini barangmu sendiri.' }

    const existing = await sb
      .from('conversations')
      .select('id')
      .eq('product_id', productId)
      .eq('buyer_id', user.id)
      .maybeSingle()
    if (existing.data) return { id: existing.data.id as string }

    const ins = await sb
      .from('conversations')
      .insert({ product_id: productId, seller_id: sellerId })
      .select('id')
      .single()
    if (ins.error) return { error: friendly(ins.error.message) }
    return { id: ins.data.id as string }
  } catch (e) {
    return { error: errorOf(e) }
  }
}

export async function sendChatMessage(
  conversationId: string,
  body: string,
  imageDataUrl?: string,
): Promise<{ row?: MessageRow; error?: string }> {
  try {
    const sb = client()
    let imagePath: string | null = null
    if (imageDataUrl) {
      imagePath = `${conversationId}/${newId()}.jpg`
      const up = await sb.storage
        .from('chat-images')
        .upload(imagePath, await dataUrlToBlob(imageDataUrl), {
          contentType: 'image/jpeg',
        })
      if (up.error) return { error: friendly(up.error.message) }
    }
    const { data, error } = await sb
      .from('messages')
      .insert({
        conversation_id: conversationId,
        body: body || null,
        image_path: imagePath,
      })
      .select('id, conversation_id, sender_id, body, image_path, created_at')
      .single()
    if (error) return { error: friendly(error.message) }
    return { row: data as MessageRow }
  } catch (e) {
    return { error: errorOf(e) }
  }
}

/** Mengubah baris pesan realtime menjadi ChatMessage (menyertakan URL gambar). */
export async function hydrateMessage(
  row: MessageRow,
  me: string,
): Promise<ChatMessage> {
  const urls = row.image_path ? await signedUrlMap([row.image_path]) : {}
  return toChatMessage(row, me, urls)
}

export function subscribeChat(handlers: {
  onMessage: (row: MessageRow) => void
  onConversation: () => void
}): () => void {
  const sb = client()
  const channel: RealtimeChannel = sb
    .channel(`lulusin-chat-${newId()}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => handlers.onMessage(payload.new as MessageRow),
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'conversations' },
      () => handlers.onConversation(),
    )
    .subscribe()
  return () => {
    void sb.removeChannel(channel)
  }
}

export type { MessageRow }