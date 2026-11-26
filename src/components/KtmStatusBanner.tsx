import React from 'react'
import type { KtmStatus } from '../lib/api'

interface KtmStatusBannerProps {
  status: KtmStatus
  onOpenVerification: () => void
}

const CONTENT: Record<
  Exclude<KtmStatus, 'verified'>,
  { icon: string; title: string; body: string; action?: string; tone: string }
> = {
  none: {
    icon: '🪪',
    title: 'Akunmu belum terverifikasi',
    body: 'Kirim foto KTM agar bisa memasang barang dan chat dengan penjual.',
    action: 'Verifikasi sekarang',
    tone: 'bg-[#FFF4D6] border-[#F0D58A] text-[#7a5a00]',
  },
  pending: {
    icon: '⏳',
    title: 'KTM-mu sedang ditinjau',
    body: 'Petugas sedang memeriksa fotonya. Halaman ini diperbarui otomatis saat selesai.',
    tone: 'bg-[#E7EEFC] border-[#BFD0F5] text-[#254fb8]',
  },
  rejected: {
    icon: '⚠️',
    title: 'Verifikasi KTM ditolak',
    body: 'Foto belum bisa dipakai. Pastikan KTM terlihat utuh dan tulisannya jelas, lalu kirim ulang.',
    action: 'Kirim ulang foto',
    tone: 'bg-[#FDE6EC] border-[#F4B6C6] text-[#a02049]',
  },
}

/** Spanduk status verifikasi KTM. Tidak tampil bila akun sudah terverifikasi. */
export const KtmStatusBanner: React.FC<KtmStatusBannerProps> = ({
  status,
  onOpenVerification,
}) => {
  if (status === 'verified') return null
  const c = CONTENT[status]
  return (
    <div
      role="status"
      className={`mx-auto mt-3 w-[min(1180px,calc(100%-24px))] rounded-[14px] border px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 ${c.tone}`}
    >
      <span aria-hidden="true" className="text-[18px] leading-none">
        {c.icon}
      </span>
      <div className="flex-1 min-w-[200px]">
        <p className="font-['Poppins:Bold'] text-[13.5px] leading-tight">{c.title}</p>
        <p className="font-['Poppins:Regular'] text-[12.5px] leading-snug opacity-90">
          {c.body}
        </p>
      </div>
      {c.action && (
        <button
          type="button"
          onClick={onOpenVerification}
          className="shrink-0 h-[34px] px-4 rounded-full bg-white/80 hover:bg-white font-['Poppins:Bold'] text-[12.5px] transition-colors"
        >
          {c.action}
        </button>
      )}
    </div>
  )
}