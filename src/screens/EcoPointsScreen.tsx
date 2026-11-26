import React from 'react'
import {
  assetPathPrefix,
  CARD_THEME_GRADIENTS,
  PointHistoryEntry,
  UmkmVoucher,
} from '../data/lulusinData'

interface EcoPointsScreenProps {
  ecoPoints: number
  vouchers: UmkmVoucher[]
  history: PointHistoryEntry[]
  onRedeem: (voucher: UmkmVoucher) => void
  onBack: () => void
  onSeeAllUmkm: () => void
}

const LEVEL_SIZE = 500

export const EcoPointsScreen: React.FC<EcoPointsScreenProps> = ({
  ecoPoints,
  vouchers,
  history,
  onRedeem,
  onBack,
  onSeeAllUmkm,
}) => {
  const level = Math.floor(ecoPoints / LEVEL_SIZE) + 1
  const toNext = LEVEL_SIZE * level - ecoPoints
  const progress = ((ecoPoints % LEVEL_SIZE) / LEVEL_SIZE) * 100
  const levelNames = ['Tunas Hijau', 'Perintis Daur', 'Penjaga Bumi', 'Pahlawan Hijau', 'Legenda Eco']
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)]

  const ways = [
    { icon: '76e8e', bg: 'bg-[#FFE1EB]', label: 'Donasikan barang', pts: '+100' },
    { icon: '04c59', bg: 'bg-[#ECE2FF]', label: 'Tukar barang', pts: '+50' },
    { icon: 'b8f0a', bg: 'bg-[#DCF2E1]', label: 'Jual / sewakan sampai selesai', pts: '+20' },
    { icon: '05a34', bg: 'bg-[#DCE8FF]', label: 'Beri ulasan transaksi', pts: '+5' },
  ]

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="size-[38px] rounded-full bg-white border border-[#EBDDC2] hover:bg-[#FDF4E3] flex items-center justify-center"
        >
          <img src={`${assetPathPrefix}/90b47.svg`} alt="" className="block" />
        </button>
        <h1 className="font-['Poppins:Bold'] text-[24px] text-[#1f1f1f]">
          Eco-Points
        </h1>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-5">
          {/* Balance Card */}
          <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#1F7C46] to-[#0F4F2B] p-6 text-white">
            <div className="pointer-events-none absolute -top-16 -right-10 size-[220px] rounded-full bg-white/[0.06]" />
            <div className="pointer-events-none absolute top-4 right-6 size-[110px] rounded-full bg-white/[0.06]" />
            <img
              src={`${assetPathPrefix}/4793e.svg`}
              alt=""
              className="absolute top-5 right-9 block"
            />
            <p className="relative font-['Poppins:Regular'] text-[13px] text-[#cfe8d6]">
              Saldo kamu
            </p>
            <p className="relative mt-1 flex items-baseline gap-2.5">
              <span className="font-['Poppins:Bold'] text-[48px] sm:text-[58px] leading-none">
                {ecoPoints.toLocaleString('id-ID')}
              </span>
              <span className="font-['Poppins:Bold'] text-[20px] text-[#cfe8d6]">
                poin
              </span>
            </p>
            <p className="relative mt-2 font-['Poppins:Regular'] text-[12.5px] text-[#cfe8d6]">
              ≈ Rp{(ecoPoints * 10).toLocaleString('id-ID')} di UMKM mitra
            </p>
            <div className="relative mt-5 h-[8px] rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#F5A314] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="relative mt-2.5 flex items-center justify-between gap-2">
              <span className="font-['Poppins:Bold'] text-[12.5px]">
                Level {level} · {levelName}
              </span>
              <span className="font-['Poppins:Regular'] text-[12px] text-[#cfe8d6]">
                {toNext} lagi ke Level {level + 1}
              </span>
            </div>
          </section>

          {/* How to earn */}
          <section className="rounded-[20px] bg-white border border-[#EBDDC2] p-5">
            <h2 className="font-['Poppins:Bold'] text-[16px] text-[#1f1f1f]">
              Cara dapat poin
            </h2>
            <ul className="mt-4 space-y-3.5">
              {ways.map((w) => (
                <li key={w.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className={`size-[40px] rounded-[10px] flex items-center justify-center ${w.bg}`}>
                      <img src={`${assetPathPrefix}/${w.icon}.svg`} alt="" className="block" />
                    </span>
                    <span className="font-['Poppins:Regular'] text-[13.5px] text-[#1f1f1f]">
                      {w.label}
                    </span>
                  </div>
                  <span className="font-['Poppins:Bold'] text-[15px] text-[#17683a]">
                    {w.pts}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
              Poin masuk setelah kedua pihak konfirmasi transaksi selesai.
            </p>
          </section>

          {/* History */}
          <section className="rounded-[20px] bg-white border border-[#EBDDC2] p-5">
            <h2 className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f]">
              Riwayat poin
            </h2>
            <ul className="mt-3 divide-y divide-[#EBDDC2]">
              {history.map((h) => (
                <li key={h.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] truncate">
                      {h.title}
                    </span>
                    <span className="font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63] shrink-0">
                      {h.date}
                    </span>
                  </div>
                  <span
                    className={`font-['Poppins:Bold'] text-[14px] ${
                      h.delta >= 0 ? 'text-[#17683a]' : 'text-[#e5484d]'
                    }`}
                  >
                    {h.delta >= 0 ? `+${h.delta}` : `−${Math.abs(h.delta)}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Vouchers */}
        <section className="lg:col-span-7 rounded-[20px] bg-white border border-[#EBDDC2] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-['Poppins:Bold'] text-[16px] text-[#1f1f1f]">
              Tukar poin di UMKM mitra
            </h2>
            <button
              type="button"
              onClick={onSeeAllUmkm}
              className="font-['Poppins:Bold'] text-[12.5px] text-[#17683a] hover:underline"
            >
              Lihat semua
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            {vouchers.map((v) => {
              const affordable = ecoPoints >= v.pointsCost
              return (
                <div
                  key={v.id}
                  className="rounded-[16px] bg-[#FFFDF8] border border-[#EBDDC2] p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`relative size-[64px] rounded-[14px] overflow-hidden flex items-center justify-center shrink-0 ${CARD_THEME_GRADIENTS[v.theme]}`}
                    >
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
                      <img src={v.iconAsset} alt="" className="relative block" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-['Poppins:Bold'] text-[14.5px] text-[#1f1f1f] truncate">
                        {v.name}
                      </p>
                      <p className="font-['Poppins:Regular'] text-[12.5px] text-[#6e6a63] truncate">
                        {v.offer}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 font-['Poppins:Bold'] text-[12.5px] text-[#17683a]">
                        <img src={`${assetPathPrefix}/a9490.svg`} alt="" className="block" />
                        {v.pointsCost} poin
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => onRedeem(v)}
                    className={`h-[32px] px-5 rounded-full font-['Poppins:Bold'] text-[12px] shrink-0 transition-colors ${
                      affordable
                        ? 'bg-[#F5A314] hover:bg-[#e5960d] text-[#1f1f1f]'
                        : 'bg-[#EEEAE3] text-[#a39c8f] cursor-not-allowed'
                    }`}
                  >
                    Tukar
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-[14px] bg-[#E2F1E5] p-4 flex items-start gap-3">
            <img src={`${assetPathPrefix}/84b2a.svg`} alt="" className="block mt-0.5 shrink-0" />
            <div>
              <p className="font-['Poppins:Bold'] text-[12.5px] text-[#0f4f2b]">
                Tunjukkan kode voucher ke kasir UMKM mitra.
              </p>
              <p className="font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
                Voucher berlaku 7 hari setelah ditukar.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
