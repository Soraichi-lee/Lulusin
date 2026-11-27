import React, { useState } from 'react'
import {
  assetPathPrefix,
  ProductItem,
  ScreenId,
  TransactionType,
} from '../data/lulusinData'
import { EmptyState } from '../components/EmptyState'
import { ProductCard } from '../components/ProductCard'

interface BerandaScreenProps {
  /** Nama pengguna yang sedang masuk. Kosong = mode demo ("Raka"). */
  userName?: string
  products: ProductItem[]
  ecoPoints: number
  wishlistIds: string[]
  onToggleWishlist: (productId: string) => void
  onSelectProduct: (product: ProductItem) => void
  onNavigate: (screen: ScreenId) => void
  onOpenSearchWithType: (type: TransactionType | 'Semua') => void
  onShowToast: (msg: string) => void
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  products,
  ecoPoints,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onNavigate,
  userName,
  onOpenSearchWithType,
  onShowToast,
}) => {
  const [activeType, setActiveType] = useState<'Semua' | TransactionType>(
    'Semua',
  )

  const filterByType = (list: ProductItem[]) =>
    activeType === 'Semua'
      ? list
      : list.filter((item) => item.type === activeType)

  const sorotProducts = filterByType(
    products.filter((p) => p.highlighted),
  ).slice(0, 5)

  const latestProducts = filterByType(
    products.filter((p) => !p.highlighted),
  ).slice(0, 10)

  const formattedPoints = ecoPoints.toLocaleString('id-ID')

  const pills: {
    id: 'Semua' | TransactionType
    label: string
    idleBg: string
    idleText: string
  }[] = [
    {
      id: 'Semua',
      label: 'Semua',
      idleBg: 'bg-white border border-[#EBDDC2]',
      idleText: 'text-[#1f1f1f]',
    },
    {
      id: 'Jual',
      label: 'Jual',
      idleBg: 'bg-[#DCF2E1]',
      idleText: 'text-[#1c7a3d]',
    },
    {
      id: 'Sewa',
      label: 'Sewa',
      idleBg: 'bg-[#DCE8FF]',
      idleText: 'text-[#2f5fd6]',
    },
    {
      id: 'Tukar',
      label: 'Tukar',
      idleBg: 'bg-[#ECE2FF]',
      idleText: 'text-[#6e45d3]',
    },
    {
      id: 'Donasi',
      label: 'Donasi',
      idleBg: 'bg-[#FFE1EB]',
      idleText: 'text-[#d23a70]',
    },
  ]

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
      {/* Greeting Header */}
      <div>
        <h1 className="font-['Poppins:Bold'] text-[24px] sm:text-[26px] text-[#1f1f1f] leading-tight">
          {userName === undefined
            ? 'Hai, Raka'
            : userName.trim()
              ? `Hai, ${userName.trim().split(/\s+/)[0]}`
              : 'Hai!'}
        </h1>
        <div className="mt-1 flex items-center gap-1.5">
          <img
            src={`${assetPathPrefix}/6f99b.svg`}
            alt=""
            className="block shrink-0"
          />
          <span className="font-['Poppins:Regular'] text-[13px] text-[#6e6a63]">
            Sekaran, Gunungpati
          </span>
        </div>
      </div>

      {/* Top Promo Banner + 2 Action Cards */}
      <section className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Promo UMKM Kampus Banner */}
        <div
          onClick={() => onNavigate('umkm-kampus')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onNavigate('umkm-kampus')
          }}
          className="lg:col-span-8 relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#1F7C46] to-[#0F4F2B] px-6 sm:px-9 py-6 sm:py-7 flex items-center justify-between gap-4 cursor-pointer group min-h-[196px]"
        >
          {/* Decorative Concentric Circles from Figma */}
          <div className="pointer-events-none absolute -right-10 -top-12 size-[250px] rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute right-6 top-3 size-[164px] rounded-full bg-white/[0.06]" />

          <div className="relative z-10 max-w-[440px]">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F5A314] font-['Poppins:Bold'] text-[10px] text-[#1f1f1f] tracking-wide">
              PROMO UMKM KAMPUS
            </span>
            <h2 className="mt-3 font-['Poppins:Bold'] text-[22px] sm:text-[30px] text-white leading-snug">
              Kopi Sekaran diskon 20%
            </h2>
            <p className="mt-1 font-['Poppins:Regular'] text-[13px] sm:text-[13.5px] text-[#cfe8d6]">
              Bayar pakai Eco-Points · s.d. 30 Nov
            </p>
            <span className="mt-4 inline-flex items-center justify-center h-[40px] px-6 rounded-full bg-[#F5A314] group-hover:bg-[#e5960d] transition-colors font-['Poppins:Bold'] text-[13px] text-[#1f1f1f]">
              Lihat promo
            </span>
          </div>

          {/* Coffee Cup Circle */}
          <div className="relative z-10 size-[76px] sm:size-[96px] rounded-full bg-[#F5A314] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <img
              src={`${assetPathPrefix}/5ae5e.svg`}
              alt="Kopi Sekaran"
              className="block shrink-0"
            />
          </div>
        </div>

        {/* Right Stacked Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
          {/* Card 1: Eco-Points */}
          <button
            type="button"
            onClick={() => onNavigate('eco-points')}
            className="h-[92px] rounded-[18px] bg-[#FFFDF8] border border-[#EBDDC2] hover:border-[#17683a]/50 shadow-[0_4px_14px_rgba(110,86,40,0.05)] px-5 flex items-center justify-between gap-3.5 text-left transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-[52px] rounded-[14px] bg-[#E2F1E5] flex items-center justify-center shrink-0">
                <img
                  src={`${assetPathPrefix}/81f20.svg`}
                  alt=""
                  className="block shrink-0"
                />
              </div>
              <div className="min-w-0">
                <p className="font-['Poppins:Regular'] text-[12.5px] text-[#6e6a63]">
                  Eco-Points kamu
                </p>
                <p className="font-['Poppins:Bold'] text-[20px] text-[#1f1f1f] leading-tight">
                  {formattedPoints} poin
                </p>
              </div>
            </div>
            <img
              src={`${assetPathPrefix}/499ec.svg`}
              alt=""
              className="block shrink-0"
            />
          </button>

          {/* Card 2: Punya barang nganggur? */}
          <button
            type="button"
            onClick={() => onNavigate('pasang-barang')}
            className="h-[92px] rounded-[18px] bg-[#FFFDF8] border border-[#EBDDC2] hover:border-[#F5A314] shadow-[0_4px_14px_rgba(110,86,40,0.05)] px-5 flex items-center justify-between gap-3.5 text-left transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-[52px] rounded-[14px] bg-[#FFF1D6] flex items-center justify-center shrink-0">
                <img
                  src={`${assetPathPrefix}/7040c.svg`}
                  alt=""
                  className="block shrink-0"
                />
              </div>
              <div className="min-w-0">
                <p className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f] truncate">
                  Punya barang nganggur?
                </p>
                <p className="mt-0.5 font-['Poppins:Regular'] text-[12.5px] text-[#6e6a63] truncate">
                  Pasang sekarang, gratis.
                </p>
              </div>
            </div>
            <img
              src={`${assetPathPrefix}/409a8.svg`}
              alt=""
              className="block shrink-0"
            />
          </button>
        </div>
      </section>

      {/* Transaction Type Filter Pills */}
      <section className="mt-6 flex items-center gap-2.5 overflow-x-auto pb-1">
        {pills.map((pill) => {
          const selected = activeType === pill.id
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActiveType(pill.id)}
              className={`h-[36px] px-5 rounded-full font-['Poppins:Bold'] text-[13.5px] shrink-0 transition-all ${
                selected
                  ? 'bg-[#17683A] text-white shadow-2xs'
                  : `${pill.idleBg} ${pill.idleText} hover:opacity-85`
              }`}
            >
              {pill.label}
            </button>
          )
        })}
      </section>

      {/* Section 1: Sorot Barang */}
      <section className="mt-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <img
                src={`${assetPathPrefix}/d8c59.svg`}
                alt=""
                className="block shrink-0"
              />
              <h2 className="font-['Poppins:Bold'] text-[20px] text-[#1f1f1f]">
                Sorot Barang
              </h2>
            </div>
            <p className="mt-0.5 font-['Poppins:Regular'] text-[12.5px] text-[#6e6a63]">
              Barang pilihan yang lagi disorot
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('sorot-barang')}
            className="font-['Poppins:Bold'] text-[13px] text-[#17683a] hover:underline shrink-0"
          >
            Lihat semua
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {sorotProducts.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon="⭐"
                title="Belum ada barang yang disorot"
                body="Barang yang disorot penjual akan tampil di sini."
              />
            </div>
          )}
          {sorotProducts.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onSelect={onSelectProduct}
              isWishlisted={wishlistIds.includes(item.id)}
              onToggleWishlist={onToggleWishlist}
              forceHighlight
            />
          ))}
        </div>
      </section>

      {/* Section 2: Barang Terbaru */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-['Poppins:Bold'] text-[20px] text-[#1f1f1f]">
            Barang Terbaru
          </h2>
          <button
            type="button"
            onClick={() => onOpenSearchWithType(activeType)}
            className="font-['Poppins:Bold'] text-[13px] text-[#17683a] hover:underline shrink-0"
          >
            Lihat semua
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {latestProducts.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                title="Belum ada barang"
                body="Jadilah yang pertama memasang barang di Lulusin."
                actionLabel="Pasang Barang"
                onAction={() => onNavigate('pasang-barang')}
              />
            </div>
          )}
          {latestProducts.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onSelect={onSelectProduct}
              isWishlisted={wishlistIds.includes(item.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-5 border-t border-[#EBDDC2] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-['Poppins:Regular'] text-[#a39c8f]">
        <p>© 2026 Lulusin · Barang kampus, terus berputar.</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onShowToast(
                'Pusat Bantuan Lulusin UNNES siap melayani via email kampus.',
              )
            }
            className="hover:text-[#17683a]"
          >
            Bantuan
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() =>
              onShowToast('Semua pengguna wajib mahasiswa aktif UNNES ber-KTM.')
            }
            className="hover:text-[#17683a]"
          >
            Syarat &amp; Ketentuan
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() =>
              onShowToast(
                'Data KTM dienkripsi dan hanya dipakai untuk verifikasi.',
              )
            }
            className="hover:text-[#17683a]"
          >
            Kebijakan Privasi
          </button>
        </div>
      </footer>
    </main>
  )
}
