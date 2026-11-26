import React, { useState } from 'react'
import {
  assetPathPrefix,
  CARD_THEME_GRADIENTS,
  ProductItem,
  TransactionRecord,
  TrxStatus,
} from '../data/lulusinData'

interface TransaksiScreenProps {
  transactions: TransactionRecord[]
  products: ProductItem[]
  onViewProduct: (product: ProductItem) => void
  onChatPartner: (trx: TransactionRecord) => void
  onConfirmDone: (trxId: string) => void
  onReview: (trxId: string) => void
  onOpenEcoPoints: () => void
}

const STATUS_STYLES: Record<TrxStatus, string> = {
  'COD dijadwalkan': 'bg-[#DCE8FF] text-[#2f5fd6]',
  'Sedang disewa': 'bg-[#ECE2FF] text-[#6e45d3]',
  Selesai: 'bg-[#DCF2E1] text-[#1c7a3d]',
  'Menunggu konfirmasi': 'bg-[#FFF1D6] text-[#b26a00]',
  Dibatalkan: 'bg-[#EEEAE3] text-[#6e6a63]',
}

const CATEGORY_ICONS: Record<string, string> = {
  Elektronik: '621a3',
  'Kendaraan & Olahraga': 'b4804',
  'Buku & Modul': '7fb1d',
  'Perabot Kos': 'da817',
}

const FILTERS = ['Semua', 'Berlangsung', 'Selesai', 'Dibatalkan'] as const
const STEPS = ['Diajukan', 'Disetujui', 'COD', 'Selesai']

export const TransaksiScreen: React.FC<TransaksiScreenProps> = ({
  transactions,
  products,
  onViewProduct,
  onChatPartner,
  onConfirmDone,
  onReview,
  onOpenEcoPoints,
}) => {
  const [role, setRole] = useState<'Pembelian' | 'Penjualan'>('Pembelian')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Semua')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const list = transactions.filter((t) => {
    if (t.role !== role) return false
    if (filter === 'Semua') return true
    if (filter === 'Selesai') return t.status === 'Selesai'
    if (filter === 'Dibatalkan') return t.status === 'Dibatalkan'
    return t.status !== 'Selesai' && t.status !== 'Dibatalkan'
  })

  const selected = list.find((t) => t.id === selectedId) ?? list[0]
  const productOf = (t: TransactionRecord) =>
    products.find((p) => p.id === t.productId)
  const iconOf = (t: TransactionRecord) => {
    const p = productOf(t)
    if (t.productId === 'headphone-bt') return 'a43a2'
    return CATEGORY_ICONS[p?.category ?? 'Elektronik'] ?? '621a3'
  }

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
      <h1 className="font-['Poppins:Bold'] text-[26px] text-[#1f1f1f]">
        Transaksi Saya
      </h1>

      <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="p-1 rounded-[14px] bg-[#F2E6CC] grid grid-cols-2 w-full md:w-[368px]">
          {(['Pembelian', 'Penjualan'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r)
                setSelectedId(null)
              }}
              className={`h-[38px] rounded-[11px] text-[13px] transition-colors ${
                role === r
                  ? "bg-white font-['Poppins:Bold'] text-[#17683a] shadow-2xs"
                  : "font-['Poppins:Regular'] text-[#6e6a63]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f)
                setSelectedId(null)
              }}
              className={`relative pb-1.5 text-[13.5px] shrink-0 ${
                filter === f
                  ? "font-['Poppins:Bold'] text-[#17683a]"
                  : "font-['Poppins:Regular'] text-[#6e6a63] hover:text-[#17683a]"
              }`}
            >
              {f}
              {filter === f && (
                <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-[#17683a]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* List */}
        <section className="lg:col-span-6 space-y-3">
          {list.length === 0 && (
            <div className="rounded-[18px] bg-white border border-[#EBDDC2] p-8 text-center font-['Poppins:Regular'] text-[13px] text-[#6e6a63]">
              Belum ada transaksi di kategori ini.
            </div>
          )}
          {list.map((t) => {
            const p = productOf(t)
            const active = selected?.id === t.id
            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(t.id)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedId(t.id)}
                className={`rounded-[16px] bg-[#FFFDF8] p-3.5 flex items-start gap-3.5 cursor-pointer transition-colors ${
                  active
                    ? 'border-[1.5px] border-[#17683A]'
                    : 'border border-[#EBDDC2] hover:border-[#d6c29d]'
                }`}
              >
                <div
                  className={`relative size-[64px] rounded-[12px] overflow-hidden flex items-center justify-center shrink-0 ${CARD_THEME_GRADIENTS[p?.theme ?? 'green']}`}
                >
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
                  <img src={`${assetPathPrefix}/${iconOf(t)}.svg`} alt="" className="relative block" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-['Poppins:Bold'] text-[14px] text-[#1f1f1f] truncate">
                      {t.title}
                    </p>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-['Poppins:Bold'] text-[10.5px] shrink-0 ${STATUS_STYLES[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-0.5 font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
                    {t.subtitle}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {t.ecoPointsEarned ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenEcoPoints()
                        }}
                        className="inline-flex items-center gap-1 font-['Poppins:Bold'] text-[11.5px] text-[#b26a00]"
                      >
                        <img src={`${assetPathPrefix}/b222a.svg`} alt="" className="block" />
                        +{t.ecoPointsEarned} Eco-Points
                      </button>
                    ) : (
                      <span className="font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
                        {t.scheduleOrNote}
                      </span>
                    )}
                    {t.status === 'Selesai' && !t.reviewed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onReview(t.id)
                        }}
                        className="h-[26px] px-3 rounded-full bg-[#F5A314] hover:bg-[#e5960d] font-['Poppins:Bold'] text-[10.5px] text-[#1f1f1f] shrink-0"
                      >
                        Beri Ulasan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {/* Detail */}
        {selected && (
          <section className="lg:col-span-6 rounded-[20px] bg-[#FFFDF8] border border-[#EBDDC2] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-['Poppins:Bold'] text-[16px] text-[#1f1f1f]">
                Detail transaksi
              </h2>
              <span className="font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
                {selected.code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const p = productOf(selected)
                if (p) onViewProduct(p)
              }}
              className="mt-4 w-full flex items-center gap-4 text-left"
            >
              <div
                className={`relative size-[72px] rounded-[14px] overflow-hidden flex items-center justify-center shrink-0 ${CARD_THEME_GRADIENTS[productOf(selected)?.theme ?? 'green']}`}
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
                <img src={`${assetPathPrefix}/${iconOf(selected)}.svg`} alt="" className="relative block scale-110" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f] truncate">
                    {selected.title}
                  </p>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-['Poppins:Bold'] text-[10.5px] shrink-0 ${STATUS_STYLES[selected.status]}`}
                  >
                    {selected.status}
                  </span>
                </div>
                <p className="font-['Poppins:Regular'] text-[12.5px] text-[#6e6a63]">
                  {selected.subtitle}
                </p>
              </div>
            </button>

            {/* Stepper */}
            <div className="mt-6 px-2">
              <div className="relative flex items-start justify-between">
                <div className="absolute left-[14px] right-[14px] top-[13px] h-[3px] bg-[#F2E6CC]" />
                <div
                  className="absolute left-[14px] top-[13px] h-[3px] bg-[#17683A] transition-all"
                  style={{
                    width: `calc((100% - 28px) * ${selected.status === 'Dibatalkan' ? 0 : selected.stepIndex / 3})`,
                  }}
                />
                {STEPS.map((s, idx) => {
                  const cancelled = selected.status === 'Dibatalkan'
                  const done = !cancelled && idx < selected.stepIndex
                  const current =
                    !cancelled && idx === selected.stepIndex && selected.stepIndex < 3
                  const finished = !cancelled && selected.stepIndex === 3 && idx === 3
                  return (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-1.5 w-[64px]">
                      {done || finished ? (
                        <span className="size-[28px] rounded-full bg-[#17683A] flex items-center justify-center">
                          <img src={`${assetPathPrefix}/55ea4.svg`} alt="" className="block" />
                        </span>
                      ) : current ? (
                        <span className="size-[28px] rounded-full bg-white border-[3px] border-[#F5A314] flex items-center justify-center">
                          <span className="size-[10px] rounded-full bg-[#F5A314]" />
                        </span>
                      ) : (
                        <span className="size-[28px] rounded-full bg-[#F2E6CC]" />
                      )}
                      <span
                        className={`text-[11.5px] text-center ${
                          done || current || finished
                            ? "font-['Poppins:Bold'] text-[#1f1f1f]"
                            : "font-['Poppins:Regular'] text-[#a39c8f]"
                        }`}
                      >
                        {s}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 rounded-[12px] bg-[#DCE8FF] px-4 py-3 flex items-center gap-2.5">
              <img src={`${assetPathPrefix}/0e9c1.svg`} alt="" className="block shrink-0" />
              <span className="font-['Poppins:Bold'] text-[12.5px] text-[#2f5fd6]">
                {selected.codBannerText}
              </span>
            </div>

            <dl className="mt-5 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="font-['Poppins:Regular'] text-[#6e6a63]">Metode bayar</dt>
                <dd className="font-['Poppins:Regular'] text-[#1f1f1f] text-right">{selected.paymentMethod}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-['Poppins:Regular'] text-[#6e6a63]">Harga awal</dt>
                <dd className="font-['Poppins:Regular'] text-[#1f1f1f]">{selected.originalPrice}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-['Poppins:Regular'] text-[#6e6a63]">Total setelah nego</dt>
                <dd className="font-['Poppins:Bold'] text-[#17683a]">{selected.finalPrice}</dd>
              </div>
            </dl>

            <div className="my-5 border-t border-[#EBDDC2]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChatPartner(selected)}
                className="h-[48px] rounded-[14px] border-[1.5px] border-[#17683A] bg-white hover:bg-[#E2F1E5]/50 flex items-center justify-center gap-2"
              >
                <img src={`${assetPathPrefix}/a054c.svg`} alt="" className="block" />
                <span className="font-['Poppins:Bold'] text-[14px] text-[#17683a]">
                  {selected.role === 'Pembelian' ? 'Chat Penjual' : 'Chat Pembeli'}
                </span>
              </button>
              <button
                type="button"
                disabled={selected.status === 'Selesai' || selected.status === 'Dibatalkan'}
                onClick={() => onConfirmDone(selected.id)}
                className="h-[48px] rounded-[14px] bg-[#17683A] hover:bg-[#12542e] disabled:bg-[#B9CDBF] disabled:cursor-not-allowed font-['Poppins:Bold'] text-[14px] text-white"
              >
                {selected.status === 'Selesai'
                  ? 'Sudah Selesai'
                  : selected.status === 'Dibatalkan'
                    ? 'Dibatalkan'
                    : 'Konfirmasi Selesai'}
              </button>
            </div>
            <p className="mt-3 text-center font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
              Konfirmasi setelah barang diterima. Eco-Points masuk otomatis.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
