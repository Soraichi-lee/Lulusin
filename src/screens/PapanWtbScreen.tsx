import React, { useState } from 'react'
import { assetPathPrefix, WtbRequest } from '../data/lulusinData'

interface PapanWtbScreenProps {
  /** Akun yang sedang masuk (mode backend). Kosong = profil contoh. */
  currentUser?: { name: string; initials: string; facultyProdi: string }
  requests: WtbRequest[]
  onAddRequest: (req: WtbRequest) => void
  onOfferItem: (req: WtbRequest) => void
}

const WANT_STYLES: Record<WtbRequest['wantType'], string> = {
  'Mau beli': 'bg-[#DCF2E1] text-[#1c7a3d]',
  'Mau sewa': 'bg-[#DCE8FF] text-[#2f5fd6]',
  'Mau tukar': 'bg-[#ECE2FF] text-[#6e45d3]',
}

const CATEGORIES = [
  'Semua',
  'Elektronik',
  'Buku',
  'Alat Praktikum',
  'Kos',
  'Kendaraan',
] as const

export const PapanWtbScreen: React.FC<PapanWtbScreenProps> = ({
  requests,
  onAddRequest,
  onOfferItem,
  currentUser,
}) => {
  const [activeCat, setActiveCat] =
    useState<(typeof CATEGORIES)[number]>('Semua')
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState('')
  const [wantType, setWantType] = useState<WtbRequest['wantType']>('Mau beli')
  const [category, setCategory] =
    useState<WtbRequest['category']>('Elektronik')

  const visible =
    activeCat === 'Semua'
      ? requests
      : requests.filter((r) => r.category === activeCat)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAddRequest({
      id: `wtb-${Date.now()}`,
      authorName: currentUser?.name ?? 'Raka Aditya',
      initials: currentUser?.initials ?? 'RA',
      avatarBg: '#2F5FD6',
      facultyAndTime: `${currentUser?.facultyProdi || 'FMIPA'} · baru saja`,
      wantType,
      category,
      title: title.trim(),
      budgetOrNote: budget.trim() || 'Budget fleksibel · COD di kampus',
      offersCount: 0,
      partnerThreadId: 'thread-nadia',
    })
    setTitle('')
    setBudget('')
    setFormOpen(false)
    setActiveCat('Semua')
  }

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#1F7C46] to-[#0F4F2B] px-6 sm:px-9 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="pointer-events-none absolute -top-16 right-6 size-[220px] rounded-full bg-white/[0.06]" />
        <div className="relative z-10">
          <p className="font-['Poppins:Bold'] text-[13px] text-[#f5a314]">
            Papan Want To Buy
          </p>
          <h1 className="mt-1 font-['Poppins:Bold'] text-[22px] sm:text-[24px] text-white">
            Lagi nyari barang tertentu?
          </h1>
          <p className="mt-1 font-['Poppins:Regular'] text-[13px] text-[#cfe8d6]">
            Tulis di papan, biar kakak tingkat yang punya langsung nawarin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((o) => !o)}
          className="relative z-10 self-start sm:self-auto inline-flex items-center gap-2 h-[44px] px-5 rounded-full bg-[#F5A314] hover:bg-[#e5960d] transition-colors shrink-0"
        >
          <img src={`${assetPathPrefix}/8fe30.svg`} alt="" className="block" />
          <span className="font-['Poppins:Bold'] text-[13.5px] text-[#1f1f1f]">
            Tulis Permintaan
          </span>
        </button>
      </section>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-[20px] bg-white border border-[#EBDDC2] p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-4">
            <label className="block font-['Poppins:Bold'] text-[13px] mb-1.5">
              Barang yang dicari
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Contoh: Jangka sorong digital"
              className="w-full h-[46px] rounded-[12px] border border-[#EBDDC2] px-4 outline-none focus:border-[#17683a] font-['Poppins:Regular'] text-[14px]"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block font-['Poppins:Bold'] text-[13px] mb-1.5">
              Budget / catatan
            </label>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Budget maks. Rp100.000"
              className="w-full h-[46px] rounded-[12px] border border-[#EBDDC2] px-4 outline-none focus:border-[#17683a] font-['Poppins:Regular'] text-[14px]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-['Poppins:Bold'] text-[13px] mb-1.5">
              Jenis
            </label>
            <select
              value={wantType}
              onChange={(e) =>
                setWantType(e.target.value as WtbRequest['wantType'])
              }
              className="w-full h-[46px] rounded-[12px] border border-[#EBDDC2] bg-white px-3 font-['Poppins:Regular'] text-[13px]"
            >
              <option>Mau beli</option>
              <option>Mau sewa</option>
              <option>Mau tukar</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block font-['Poppins:Bold'] text-[13px] mb-1.5">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as WtbRequest['category'])
              }
              className="w-full h-[46px] rounded-[12px] border border-[#EBDDC2] bg-white px-3 font-['Poppins:Regular'] text-[13px]"
            >
              {CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="md:col-span-1 h-[46px] rounded-[12px] bg-[#17683A] hover:bg-[#12542e] font-['Poppins:Bold'] text-[13px] text-white"
          >
            Kirim
          </button>
        </form>
      )}

      {/* Category Filter Row */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const active = cat === activeCat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCat(cat)}
                className={`h-[34px] px-4 rounded-full font-['Poppins:Bold'] text-[12.5px] shrink-0 transition-colors ${
                  active
                    ? 'bg-[#17683A] text-white'
                    : 'bg-white border border-[#EBDDC2] text-[#1f1f1f] hover:bg-[#FDF4E3]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
        <p className="font-['Poppins:Regular'] text-[12.5px] text-[#6e6a63] shrink-0">
          {visible.length} permintaan terbaru
        </p>
      </div>

      {/* Requests Grid */}
      <section className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {visible.map((req) => (
          <article
            key={req.id}
            className="rounded-[18px] bg-[#FFFDF8] border border-[#EBDDC2] shadow-[0_4px_14px_rgba(110,86,40,0.05)] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  style={{ backgroundColor: req.avatarBg }}
                  className="size-[36px] rounded-full flex items-center justify-center font-['Poppins:Bold'] text-[14px] text-white shrink-0"
                >
                  {req.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-['Poppins:Bold'] text-[14px] text-[#1f1f1f] truncate">
                    {req.authorName}
                  </p>
                  <p className="font-['Poppins:Regular'] text-[11px] text-[#6e6a63]">
                    {req.facultyAndTime}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-['Poppins:Bold'] text-[11.5px] shrink-0 ${WANT_STYLES[req.wantType]}`}
              >
                {req.wantType}
              </span>
            </div>

            <h2 className="mt-4 font-['Poppins:Bold'] text-[15px] text-[#1f1f1f]">
              {req.title}
            </h2>
            <p className="mt-0.5 font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
              {req.budgetOrNote}
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-1.5 font-['Poppins:Bold'] text-[11.5px] ${
                  req.offersCount > 0 ? 'text-[#17683a]' : 'text-[#a39c8f]'
                }`}
              >
                <img
                  src={`${assetPathPrefix}/${req.offersCount > 0 ? 'bdfd3' : 'f0765'}.svg`}
                  alt=""
                  className="block"
                />
                {req.offersCount > 0
                  ? `${req.offersCount} tawaran`
                  : 'Belum ada tawaran'}
              </span>
              <button
                type="button"
                onClick={() => onOfferItem(req)}
                className="h-[32px] px-4 rounded-full bg-[#17683A] hover:bg-[#12542e] font-['Poppins:Bold'] text-[11.5px] text-white"
              >
                Saya Punya
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
