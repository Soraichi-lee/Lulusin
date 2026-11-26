import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Klien Supabase. Bernilai null bila VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * belum diisi — aplikasi lalu berjalan dalam mode demo (data lokal saja).
 */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null

export const isBackendEnabled = supabase !== null
