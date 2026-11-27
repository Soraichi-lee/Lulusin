// Memuat Midtrans Snap (jendela bayar) dan membukanya dengan token dari server.

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void
          onPending?: (result: unknown) => void
          onError?: (result: unknown) => void
          onClose?: () => void
        },
      ) => void
    }
  }
}

const isProduction = import.meta.env.VITE_MIDTRANS_ENV === 'production'
const SNAP_SRC = isProduction
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

let loading: Promise<void> | null = null

function loadSnap(): Promise<void> {
  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY
  if (!clientKey) {
    return Promise.reject(
      new Error('Client Key Midtrans belum diisi (VITE_MIDTRANS_CLIENT_KEY).'),
    )
  }
  if (window.snap) return Promise.resolve()
  if (loading) return loading

  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SNAP_SRC
    script.setAttribute('data-client-key', clientKey)
    script.onload = () => resolve()
    script.onerror = () => {
      loading = null
      script.remove()
      reject(new Error('Gagal memuat jendela pembayaran. Periksa koneksi internetmu.'))
    }
    document.head.appendChild(script)
  })
  return loading
}

export type SnapOutcome = 'success' | 'pending' | 'closed'

/** Membuka jendela bayar. Selesai saat pengguna membayar, menunda, atau menutupnya. */
export async function payWithSnap(token: string): Promise<SnapOutcome> {
  await loadSnap()
  return new Promise<SnapOutcome>((resolve, reject) => {
    if (!window.snap) {
      reject(new Error('Jendela pembayaran tidak tersedia.'))
      return
    }
    window.snap.pay(token, {
      onSuccess: () => resolve('success'),
      onPending: () => resolve('pending'),
      onError: () => reject(new Error('Pembayaran gagal. Silakan coba lagi.')),
      onClose: () => resolve('closed'),
    })
  })
}
