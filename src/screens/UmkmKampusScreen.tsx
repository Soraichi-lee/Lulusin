import React, { useState } from 'react'
import {
  assetPathPrefix,
  CARD_THEME_GRADIENTS,
  UmkmPartner,
} from '../data/lulusinData'

interface UmkmKampusScreenProps {
  partners: UmkmPartner[]
  onRedeemPromo: () => void
  onPartnerClick: (partner: UmkmPartner) => void
  onRegisterPartner: () => void
}

const CATEGORIES: {
  id: UmkmPartner['category']
  icon: string
  theme: 'pink' | 'orange' | 'blue' | 'teal'
}[] = [
  { id: 'Makanan', icon: '0ce62', theme: 'pink' },
  { id: 'Minuman', icon: '9dd7c', theme: 'orange' },
  { id: 'Print & ATK', icon: '90c4e', theme: 'blue' },
  { id: 'Laundry', icon: '2bd30', theme: 'teal' },
]

export const UmkmKampusScreen: React.FC<UmkmKampusScreenProps> = ({
  partners,
  onRedeemPromo,
  onPartnerClick,
  onRegisterPartner,
}) => {
  const [activeCat, setActiveCat] = useState<UmkmPartner['category'] | null>(
    null,
  )
  const [sortNearest, setSortNearest] = useState(false)

  let list = activeCat ? partners.filter((p) => p.category === activeCat) : partners
  if (sortNearest) list = [...list].sort((a, b) => a.distanceMeters - b.distanceMeters)

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
      {/* Promo Banner */}
      <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#FDC24F] to-[#F2930C] px-6 sm:px-9 py-7 flex items-center justify-between gap-5">
        <div className="pointer-events-none absolute -right-16 -top-10 size-[260px] rounded-full bg-white/[0.12]" />
        <div className="relative z-10">
          <span className="inline-flex px-3 py-1 rounded-full bg-white font-['Poppins:Bold'] text-[10px] text-[#0f4f2b] tracking-wide">
            PROMO MINGGU INI
          </span>
          <h1 className="mt-3 font-['Poppins:Bold'] text-[24px] sm:text-[32px] text-[#1f1f1f] leading-tight">
            Diskon 20% di Kopi Sekaran
          </h1>
          <p className="mt-1 font-['Poppins:Regular'] text-[13.5px] text-[#5a3a00]">
            Tukar 300 Eco-Points di kasir · s.d. 30 Nov
          </p>
          <button
            type="button"
            onClick={onRedeemPromo}
            className="mt-4 h-[38px] px-6 rounded-full bg-[#0F4F2B] hover:bg-[#0b3d21] font-['Poppins:Bold'] text-[12.5px] text-white"
          >
            Tukar poin
          </button>
        </div>
        <div className="relative z-10 hidden sm:flex size-[120px] rounded-full bg-white items-center justify-center shrink-0 shadow-md">
          <img src={`${assetPathPrefix}/66cca.svg`} alt="Kopi" className="block" />
        </div>
      </section>

      {/* Categories */}
      <section className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((c) => {
          const count = partners.filter((p) => p.category === c.id).length
          const active = activeCat === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCat(active ? null : c.id)}
              className={`rounded-[16px] bg-[#FFFDF8] p-3.5 flex items-center gap-3 text-left transition-colors ${
                active
                  ? 'border-[1.5px] border-[#17683A]'
                  : 'border border-[#EBDDC2] hover:border-[#d6c29d]'
              }`}
            >
              <span
                className={`size-[48px] rounded-[12px] flex items-center justify-center shrink-0 ${CARD_THEME_GRADIENTS[c.theme]}`}
              >
                <img src={`${assetPathPrefix}/${c.icon}.svg`} alt="" className="block" />
              </span>
              <span>
                <span className="block font-['Poppins:Bold'] text-[14.5px] text-[#1f1f1f]">
                  {c.id}
                </span>
                <span className="block font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
                  {count} mitra
                </span>
              </span>
            </button>
          )
        })}
      </section>

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="font-['Poppins:Bold'] text-[20px] text-[#1f1f1f]">
          {activeCat ? `${activeCat} di sekitar kampus` : 'Di sekitar kampus'}
        </h2>
        <button
          type="button"
          onClick={() => setSortNearest((s) => !s)}
          className={`font-['Poppins:Bold'] text-[13px] ${
            sortNearest ? 'text-[#b26a00]' : 'text-[#17683a]'
          } hover:underline`}
        >
          {sortNearest ? 'Terdekat ✓' : 'Terdekat'}
        </button>
      </div>

      <section className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPartnerClick(p)}
            className="rounded-[18px] bg-[#FFFDF8] border border-[#EBDDC2] hover:border-[#d6c29d] p-4 flex items-center gap-4 text-left transition-colors"
          >
            <div
              className={`relative size-[88px] rounded-[16px] overflow-hidden flex items-center justify-center shrink-0 ${CARD_THEME_GRADIENTS[p.theme]}`}
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
              <img src={p.iconAsset} alt="" className="relative block" />
            </div>
            <div className="min-w-0">
              <p className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f] truncate">
                {p.name}
              </p>
              <p className="font-['Poppins:Regular'] text-[12px] text-[#6e6a63] truncate">
                {p.subtitle}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {p.ecoPartner && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E2F1E5] font-['Poppins:Bold'] text-[10.5px] text-[#17683a]">
                    <img src={`${assetPathPrefix}/85d5d.svg`} alt="" className="block" />
                    Mitra Eco-Points
                  </span>
                )}
                {p.hasPromo && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1D6] font-['Poppins:Bold'] text-[10.5px] text-[#b26a00]">
                    Promo
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* Register CTA */}
      <section className="mt-8 rounded-[18px] bg-[#E2F1E5] px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="size-[52px] rounded-[14px] bg-[#17683A] flex items-center justify-center shrink-0">
            <img src={`${assetPathPrefix}/bd14c.svg`} alt="" className="block" />
          </span>
          <div>
            <p className="font-['Poppins:Bold'] text-[16px] text-[#0f4f2b]">
              Punya UMKM dekat kampus?
            </p>
            <p className="font-['Poppins:Regular'] text-[13px] text-[#6e6a63]">
              Pasang promo &amp; jadi mitra Eco-Points.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRegisterPartner}
          className="self-start sm:self-auto h-[44px] px-7 rounded-full bg-[#17683A] hover:bg-[#12542e] font-['Poppins:Bold'] text-[13.5px] text-white"
        >
          Daftar Mitra
        </button>
      </section>
    </main>
  )
}
