/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_MIDTRANS_CLIENT_KEY?: string
  /** 'sandbox' (uji coba, bawaan) atau 'production' */
  readonly VITE_MIDTRANS_ENV?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
