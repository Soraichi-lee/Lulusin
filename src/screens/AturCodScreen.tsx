import React, { useState } from 'react'
import {
  assetPathPrefix,
  CARD_THEME_GRADIENTS,
  ProductItem,
} from '../data/lulusinData'

interface AturCodScreenProps {
  product: ProductItem
  onBack: () => void
  onConfirmCod: (payload: {
    product: ProductItem
    spotName: string
    dayShort: string
    dayFull: string
    dateNum: string
    time: string
    paymentMethod: string
    agreedPriceLabel: string
  }) => void
}

const CAMPUS_SPOTS = [
  {
    id: 'perpus',
    name: 'Perpustakaan Pusat UNNES',
    shortPin: 'Perpus Pusat',
    desc: 'Area ramai, dekat parkiran',
    pinPos: 'left-[53%] top-[34%]',
  },
  {
    id: 'masjid',
    name: 'Masjid Ulul Albab',
    shortPin: 'Masjid Ulul Albab',
    desc: 'Halaman depan',
    pinPos: 'left-[16%] top-[28%]',
  },
  {
    id: 'fmipa',
    name: 'Gedung D7 FMIPA',
    shortPin: 'Gedung D7 FMIPA',
    desc: 'Lobi lantai 1',
    pinPos: 'left-[87%] top-[24%]',
  },
]

const DAYS = [
  { short: 'Sen', full: 'Senin', date: '10' },
  { short: 'Sel', full: 'Selasa', date: '11' },
  { short: 'Rab', full: 'Rabu', date: '12' },
  { short: 'Kam', full: 'Kamis', date: '13' },
  { short: 'Jum', full: 'Jumat', date: '14' },
]

export const AturCodScreen: React.FC<AturCodScreenProps> = ({
  product,
  onBack,
  onConfirmCod,
}) => {
  const [selectedSpotId, setSelectedSpotId] = useState('perpus')
  const [selectedDayIdx, setSelectedDayIdx] = useState(1) // Sel 11
  const [selectedTime, setSelectedTime] = useState('13.00')
  const [customTime, setCustomTime] = useState('16.30')
  const [paymentMethod, setPaymentMethod] = useState<
    'Tunai saat bertemu' | 'Transfer / QRIS'
  >('Tunai saat bertemu')

  const spot =
    CAMPUS_SPOTS.find((s) => s.id === selectedSpotId) ?? CAMPUS_SPOTS[0]
  const day = DAYS[selectedDayIdx]
  const effectiveTime = selectedTime === 'Lainnya' ? customTime : selectedTime

  const agreedPriceLabel =
    product.id === 'kalkulator-casio-991' ? 'Rp170.000' : product.priceLabel

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onBack}
          className="size-[38px] rounded-full bg-white border border-[#EBDDC2] hover:bg-[#FDF4E3] flex items-center justify-center shrink-0"
          aria-label="Kembali"
        >
          <img
            src={`${assetPathPrefix}/90b47.svg`}
            alt=""
            className="block"
          />
        </button>
        <h1 className="font-['Poppins:Bold'] text-[22px] sm:text-[24px] text-[#1f1f1f]">
          Atur Pertemuan COD
        </h1>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Campus Map & Spot Picker Card */}
        <section className="lg:col-span-6 rounded-[20px] bg-white border border-[#EBDDC2] shadow-[0_4px_18px_rgba(110,86,40,0.05)] p-5 sm:p-6">
          <h2 className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f]">
            Titik temu di kampus
          </h2>

          {/* Interactive Campus Map Visual (matches 30:1644-1662) */}
          <div className="mt-3.5 relative h-[248px] rounded-[16px] bg-[#E7EFD9] overflow-hidden select-none">
            {/* Campus Roads */}
            <svg
              viewBox="0 0 600 260"
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              <path
                d="M0 165 Q 150 142 300 162 T 600 120"
                stroke="#FFFFFF"
                strokeWidth="12"
                fill="none"
              />
              <path
                d="M195 0 L 180 260"
                stroke="#FFFFFF"
                strokeWidth="11"
                fill="none"
              />
              <path
                d="M440 0 L 485 260"
                stroke="#FFFFFF"
                strokeWidth="11"
                fill="none"
              />
            </svg>

            {/* Building Footprints */}
            <div className="absolute left-[7%] top-[12%] w-[18%] h-[23%] rounded-[8px] bg-[#D5E2C4]" />
            <div className="absolute left-[7%] top-[42%] w-[10%] h-[14%] rounded-[6px] bg-[#D5E2C4]" />
            <div className="absolute left-[48%] top-[14%] w-[18%] h-[27%] rounded-[8px] bg-[#D5E2C4]" />
            <div className="absolute left-[84%] top-[12%] w-[10%] h-[20%] rounded-[8px] bg-[#D5E2C4]" />
            <div className="absolute left-[8%] bottom-[8%] w-[18%] h-[16%] rounded-[8px] bg-[#D5E2C4]" />
            <div className="absolute left-[50%] bottom-[8%] w-[15%] h-[17%] rounded-[8px] bg-[#D5E2C4]" />
            <div className="absolute right-[4%] bottom-[12%] size-[64px] rounded-full bg-[#C8DDB4]" />

            {/* Interactive Campus Pins */}
            {CAMPUS_SPOTS.map((s) => {
              const active = s.id === selectedSpotId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSpotId(s.id)}
                  className={`absolute ${s.pinPos} -translate-x-1/2 flex flex-col items-center group transition-transform hover:scale-105`}
                >
                  <img
                    src={
                      active
                        ? `${assetPathPrefix}/9df7e.svg`
                        : `${assetPathPrefix}/4db2d.svg`
                    }
                    alt={s.shortPin}
                    className="block"
                  />
                  {active && (
                    <span className="mt-1.5 px-3 py-1 rounded-full bg-[#1F1F1F] font-['Poppins:Bold'] text-[10.5px] text-white whitespace-nowrap shadow-sm">
                      {s.shortPin}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Radio Spot List */}
          <div className="mt-4 space-y-2.5">
            {CAMPUS_SPOTS.map((s) => {
              const active = s.id === selectedSpotId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSpotId(s.id)}
                  className={`w-full rounded-[14px] px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors ${
                    active
                      ? 'bg-[#E2F1E5] border-[1.5px] border-[#17683A]'
                      : 'bg-white border border-[#EBDDC2] hover:bg-[#FDF4E3]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        active
                          ? `${assetPathPrefix}/b5baf.svg`
                          : `${assetPathPrefix}/83760.svg`
                      }
                      alt=""
                      className="block shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-['Poppins:Bold'] text-[14px] text-[#1f1f1f] truncate">
                        {s.name}
                      </p>
                      <p className="font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63] truncate">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`size-[20px] rounded-full flex items-center justify-center shrink-0 ${
                      active
                        ? 'border-2 border-[#17683A]'
                        : 'border-[1.5px] border-[#D6C8AE]'
                    }`}
                  >
                    {active && (
                      <span className="size-[10px] rounded-full bg-[#17683A]" />
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 text-[12px] font-['Poppins:Regular'] text-[#6e6a63]">
            <img
              src={`${assetPathPrefix}/49977.svg`}
              alt=""
              className="block shrink-0"
            />
            <span>
              Titik COD dipilih dari lokasi kampus yang ramai dan mudah
              dijangkau.
            </span>
          </div>
        </section>

        {/* Right Schedule & Payment Card */}
        <section className="lg:col-span-6 rounded-[20px] bg-white border border-[#EBDDC2] shadow-[0_4px_18px_rgba(110,86,40,0.05)] p-5 sm:p-6">
          {/* Selected Product Summary */}
          <div className="flex items-center gap-4 pb-5 border-b border-[#EBDDC2]">
            <div
              className={`size-[64px] rounded-[14px] relative overflow-hidden flex items-center justify-center shrink-0 ${
                CARD_THEME_GRADIENTS[product.theme]
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
              <img
                src={`${assetPathPrefix}/8d350.svg`}
                alt=""
                className="relative z-10 block"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-['Poppins:Bold'] text-[14px] text-[#1f1f1f] truncate">
                {product.title}
              </h2>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="font-['Poppins:Bold'] text-[16px] text-[#17683a]">
                  {agreedPriceLabel}
                </span>
                <span className="font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
                  {product.id === 'kalkulator-casio-991' ? 'hasil nego · ' : ''}
                  {product.seller.name}
                </span>
              </div>
            </div>
          </div>

          {/* Tanggal */}
          <div className="mt-5">
            <p className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f] mb-2.5">
              Tanggal
            </p>
            <div className="grid grid-cols-5 gap-2.5">
              {DAYS.map((d, idx) => {
                const active = idx === selectedDayIdx
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`h-[70px] rounded-[14px] flex flex-col items-center justify-center transition-colors ${
                      active
                        ? 'bg-[#17683A] text-white'
                        : 'bg-white border border-[#EBDDC2] hover:bg-[#FDF4E3]/60'
                    }`}
                  >
                    <span
                      className={`font-['Poppins:Regular'] text-[12px] ${
                        active ? 'text-[#cfe8d6]' : 'text-[#6e6a63]'
                      }`}
                    >
                      {d.short}
                    </span>
                    <span
                      className={`font-['Poppins:Bold'] text-[20px] leading-tight ${
                        active ? 'text-white' : 'text-[#1f1f1f]'
                      }`}
                    >
                      {d.date}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Jam */}
          <div className="mt-5">
            <p className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f] mb-2.5">
              Jam
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {['10.00', '13.00', '15.30', 'Lainnya'].map((tm) => {
                const active = selectedTime === tm
                return (
                  <button
                    key={tm}
                    type="button"
                    onClick={() => setSelectedTime(tm)}
                    className={`h-[36px] px-4 rounded-full font-['Poppins:Bold'] text-[13px] transition-colors ${
                      active
                        ? 'bg-[#17683A] text-white'
                        : 'bg-white border border-[#EBDDC2] text-[#1f1f1f] hover:bg-[#FDF4E3]'
                    }`}
                  >
                    {tm}
                  </button>
                )
              })}
              {selectedTime === 'Lainnya' && (
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="Contoh: 16.30"
                  className="h-[36px] w-[100px] rounded-full border border-[#17683A] px-3 font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] outline-none"
                />
              )}
            </div>
          </div>

          {/* Pembayaran */}
          <div className="mt-5">
            <p className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f] mb-2.5">
              Pembayaran
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['Tunai saat bertemu', 'Transfer / QRIS'] as const).map(
                (method) => {
                  const active = paymentMethod === method
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`h-[52px] rounded-[14px] px-4 flex items-center gap-3 text-left transition-colors ${
                        active
                          ? 'bg-[#E2F1E5] border-[1.5px] border-[#17683A]'
                          : 'bg-white border border-[#EBDDC2] hover:bg-[#FDF4E3]/60'
                      }`}
                    >
                      <span
                        className={`size-[18px] rounded-full flex items-center justify-center shrink-0 ${
                          active
                            ? 'border-2 border-[#17683A]'
                            : 'border-[1.5px] border-[#D6C8AE]'
                        }`}
                      >
                        {active && (
                          <span className="size-[9px] rounded-full bg-[#17683A]" />
                        )}
                      </span>
                      <span
                        className={`text-[13px] text-[#1f1f1f] ${
                          active
                            ? "font-['Poppins:Bold']"
                            : "font-['Poppins:Regular']"
                        }`}
                      >
                        {method}
                      </span>
                    </button>
                  )
                },
              )}
            </div>
          </div>

          {/* Tips Box */}
          <div className="mt-5 rounded-[14px] bg-[#FFF1D6] p-4 flex items-start gap-3">
            <img
              src={`${assetPathPrefix}/66477.svg`}
              alt=""
              className="block shrink-0 mt-0.5"
            />
            <p className="font-['Poppins:Regular'] text-[12px] text-[#1f1f1f] leading-relaxed">
              Tips aman: ketemu di tempat ramai dan cek barang dulu sebelum
              bayar.
            </p>
          </div>

          {/* Summary & Confirm Button */}
          <div className="mt-5 pt-4 border-t border-[#EBDDC2]">
            <p className="font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
              Ringkasan
            </p>
            <p className="mt-0.5 font-['Poppins:Bold'] text-[13px] text-[#1f1f1f]">
              {day.full}, {day.date} Nov · {effectiveTime} · {spot.name}
            </p>

            <button
              type="button"
              onClick={() =>
                onConfirmCod({
                  product,
                  spotName: spot.name,
                  dayShort: day.short,
                  dayFull: day.full,
                  dateNum: day.date,
                  time: effectiveTime,
                  paymentMethod,
                  agreedPriceLabel,
                })
              }
              className="mt-4 w-full h-[54px] rounded-[14px] bg-[#17683A] hover:bg-[#12542e] transition-colors font-['Poppins:Bold'] text-[16px] text-white"
            >
              Kirim Ajakan COD
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
