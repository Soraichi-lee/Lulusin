import React, { useState } from 'react'
import {
  assetPathPrefix,
  CARD_THEME_GRADIENTS,
  ProductItem,
  TYPE_BADGE_STYLES,
} from '../data/lulusinData'
import { ProductCard } from '../components/ProductCard'

interface SorotBarangScreenProps {
  product: ProductItem
  myProducts: ProductItem[]
  comparisonProduct: ProductItem
  ecoPoints: number
  onChangeProduct: (id: string) => void
  onBack: () => void
  /** Opsi bayar Eco-Points (hanya mode demo; di backend saldo poin belum di server). */
  pointsEnabled?: boolean
  onPay: (payload: {
    product: ProductItem
    days: number
    method: 'qris' | 'points'
    price: number
    points: number
  }) => void | Promise<void>
}

const PACKAGES = [
  { days: 1, price: 2000, points: 100 },
  { days: 3, price: 5000, points: 250, popular: true },
  { days: 7, price: 10000, points: 500 },
]

export const SorotBarangScreen: React.FC<SorotBarangScreenProps> = ({
  product,
  myProducts,
  comparisonProduct,
  ecoPoints,
  pointsEnabled = true,
  onChangeProduct,
  onBack,
  onPay,
}) => {
  const [pkgIdx, setPkgIdx] = useState(1)
  const [method, setMethod] = useState<'qris' | 'points'>('qris')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [paying, setPaying] = useState(false)
  const pkg = PACKAGES[pkgIdx]
  const rp = (n: number) => `Rp${n.toLocaleString('id-ID')}`
  const notEnough = method === 'points' && ecoPoints < pkg.points
  const badge = TYPE_BADGE_STYLES[product.type]

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
          Sorot Barang
        </h1>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: selected item & preview */}
        <section className="rounded-[20px] bg-white border border-[#EBDDC2] p-5 sm:p-6">
          <p className="font-['Poppins:Bold'] text-[14px] text-[#6e6a63]">
            Barang yang disorot
          </p>
          <div className="mt-3 rounded-[14px] bg-[#FDF4E3] border border-[#EBDDC2] p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`relative size-[60px] rounded-[12px] overflow-hidden flex items-center justify-center shrink-0 ${CARD_THEME_GRADIENTS[product.theme]}`}
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
                <img
                  src={product.category === 'Kendaraan & Olahraga' ? `${assetPathPrefix}/587aa.svg` : product.iconAsset}
                  alt=""
                  className={`relative block ${product.category === 'Kendaraan & Olahraga' ? '' : 'scale-50'}`}
                />
              </div>
              <div className="min-w-0">
                <p className="font-['Poppins:Bold'] text-[14px] text-[#1f1f1f] truncate">
                  {product.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-['Poppins:Bold'] text-[11px] ${badge.bg} ${badge.text}`}>
                    {product.type}
                  </span>
                  <span className="font-['Poppins:Bold'] text-[13px] text-[#17683a]">
                    {product.priceLabel}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className="font-['Poppins:Bold'] text-[13px] text-[#17683a] hover:underline shrink-0"
            >
              Ganti
            </button>
          </div>

          {pickerOpen && (
            <div className="mt-2 rounded-[14px] border border-[#EBDDC2] bg-white max-h-[220px] overflow-y-auto">
              {myProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChangeProduct(p.id)
                    setPickerOpen(false)
                  }}
                  className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-[#FDF4E3] ${
                    p.id === product.id ? 'bg-[#E2F1E5]' : ''
                  }`}
                >
                  <span className="font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] truncate">
                    {p.title}
                  </span>
                  <span className="font-['Poppins:Regular'] text-[12px] text-[#6e6a63] shrink-0">
                    {p.priceLabel}
                  </span>
                </button>
              ))}
            </div>
          )}

          <p className="mt-6 font-['Poppins:Bold'] text-[14px] text-[#6e6a63]">
            Pratinjau di Beranda
          </p>
          <div className="mt-3 rounded-[16px] bg-[#FDF4E3] border border-[#EBDDC2] p-4 grid grid-cols-2 gap-3.5">
            <ProductCard product={product} forceHighlight useShortTitle />
            <ProductCard product={comparisonProduct} forceHighlight={false} />
          </div>
          <div className="mt-4 flex items-center gap-2 font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
            <img src={`${assetPathPrefix}/5f94b.svg`} alt="" className="block shrink-0" />
            Barang yang disorot tampil paling depan dengan bingkai oranye.
          </div>
        </section>

        {/* Right: packages & payment */}
        <section className="rounded-[20px] bg-white border border-[#EBDDC2] p-5 sm:p-6">
          <h2 className="font-['Poppins:Bold'] text-[16px] text-[#1f1f1f]">
            Pilih durasi
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {PACKAGES.map((p, idx) => {
              const active = idx === pkgIdx
              return (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setPkgIdx(idx)}
                  className={`relative h-[124px] rounded-[16px] flex flex-col items-center justify-center gap-1 transition-colors ${
                    active
                      ? 'bg-[#FFF1D6] border-[1.5px] border-[#F5A314]'
                      : 'bg-white border border-[#EBDDC2] hover:bg-[#FDF4E3]/60'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-[#F5A314] font-['Poppins:Bold'] text-[10.5px] text-[#1f1f1f]">
                      Populer
                    </span>
                  )}
                  <span className="font-['Poppins:Bold'] text-[14px] text-[#1f1f1f]">
                    {p.days} hari
                  </span>
                  <span
                    className={`font-['Poppins:Bold'] text-[18px] sm:text-[22px] ${
                      active ? 'text-[#1f1f1f]' : 'text-[#17683a]'
                    }`}
                  >
                    {rp(p.price)}
                  </span>
                  <span className="font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
                    atau {p.points} poin
                  </span>
                </button>
              )
            })}
          </div>

          <p className="mt-6 font-['Poppins:Bold'] text-[14px] text-[#1f1f1f]">
            Bayar dengan
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { id: 'qris', label: 'Transfer / QRIS' },
              { id: 'points', label: `Eco-Points (${pkg.points} poin)` },
            ] as const)
              .filter((m) => m.id === 'qris' || pointsEnabled)
              .map((m) => {
              const active = method === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`h-[52px] rounded-[14px] px-4 flex items-center gap-3 text-left ${
                    active
                      ? 'bg-[#E2F1E5] border-[1.5px] border-[#17683A]'
                      : 'bg-white border border-[#EBDDC2] hover:bg-[#FDF4E3]/60'
                  }`}
                >
                  <span
                    className={`size-[18px] rounded-full flex items-center justify-center shrink-0 ${
                      active ? 'border-2 border-[#17683A]' : 'border-[1.5px] border-[#D6C8AE]'
                    }`}
                  >
                    {active && <span className="size-[9px] rounded-full bg-[#17683A]" />}
                  </span>
                  <span
                    className={`text-[13px] text-[#1f1f1f] ${
                      active ? "font-['Poppins:Bold']" : "font-['Poppins:Regular']"
                    }`}
                  >
                    {m.label}
                  </span>
                </button>
              )
            })}
          </div>
          {notEnough && (
            <p className="mt-2 font-['Poppins:Regular'] text-[12px] text-[#e5484d]">
              Poinmu belum cukup ({ecoPoints.toLocaleString('id-ID')} poin).
            </p>
          )}

          <ul className="mt-6 space-y-3">
            {[
              'Tampil di deretan Sorot Barang di Beranda',
              'Muncul lebih atas di hasil pencarian',
              'Dapat badge “Disorot” yang menarik perhatian',
            ].map((b) => (
              <li key={b} className="flex items-center gap-3 font-['Poppins:Regular'] text-[13px] text-[#1f1f1f]">
                <span className="size-[20px] rounded-full bg-[#DCF2E1] flex items-center justify-center shrink-0">
                  <img src={`${assetPathPrefix}/0db74.svg`} alt="" className="block" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-5 border-t border-[#EBDDC2] flex items-center justify-between">
            <span className="font-['Poppins:Regular'] text-[13px] text-[#6e6a63]">
              Total · {pkg.days} hari
            </span>
            <span className="font-['Poppins:Bold'] text-[22px] text-[#1f1f1f]">
              {method === 'points' ? `${pkg.points} poin` : rp(pkg.price)}
            </span>
          </div>

          <button
            type="button"
            disabled={notEnough || paying}
            onClick={async () => {
              setPaying(true)
              try {
                await onPay({
                  product,
                  days: pkg.days,
                  method,
                  price: pkg.price,
                  points: pkg.points,
                })
              } finally {
                setPaying(false)
              }
            }}
            className="mt-5 w-full h-[54px] rounded-[14px] bg-[#F5A314] hover:bg-[#e5960d] disabled:bg-[#EEEAE3] disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <img src={`${assetPathPrefix}/b28bc.svg`} alt="" className="block" />
            <span className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f]">
              {paying
                ? 'Memproses…'
                : `Sorot Sekarang · ${method === 'points' ? `${pkg.points} poin` : rp(pkg.price)}`}
            </span>
          </button>
        </section>
      </div>
    </main>
  )
}
