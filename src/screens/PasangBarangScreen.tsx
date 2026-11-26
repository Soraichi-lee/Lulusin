import React, { useRef, useState } from 'react'
import {
  assetPathPrefix,
  CardTheme,
  CategoryType,
  ConditionType,
  ProductItem,
  ScreenId,
  SELLERS,
  TransactionType,
} from '../data/lulusinData'
import { ProductCard } from '../components/ProductCard'
import { fileToCompressedDataUrl, validateImageFile } from '../lib/image'
import { CameraCapture } from '../components/CameraCapture'

const MAX_PHOTOS = 8

interface PasangBarangScreenProps {
  onPublishProduct: (newItem: ProductItem, goToSorot: boolean) => void
  onNavigate: (screen: ScreenId) => void
  onShowToast: (msg: string) => void
}

const CATEGORY_VISUALS: Record<
  CategoryType,
  { theme: CardTheme; icon: string }
> = {
  'Kendaraan & Olahraga': {
    theme: 'purple',
    icon: `${assetPathPrefix}/881ea.svg`,
  },
  Elektronik: {
    theme: 'green',
    icon: `${assetPathPrefix}/51d3e.svg`,
  },
  'Buku & Modul': {
    theme: 'pink',
    icon: `${assetPathPrefix}/53877.svg`,
  },
  'Alat Praktikum': {
    theme: 'teal',
    icon: `${assetPathPrefix}/14c46.svg`,
  },
  Fashion: {
    theme: 'pink',
    icon: `${assetPathPrefix}/14c46.svg`,
  },
  'Perabot Kos': {
    theme: 'orange',
    icon: `${assetPathPrefix}/c0e2f.svg`,
  },
}

export const PasangBarangScreen: React.FC<PasangBarangScreenProps> = ({
  onPublishProduct,
  onNavigate,
  onShowToast,
}) => {
  const [trxType, setTrxType] = useState<TransactionType>('Sewa')
  const [photos, setPhotos] = useState<string[]>([])
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('Sepeda Lipat Element 16 inci')
  const [category, setCategory] = useState<CategoryType>('Kendaraan & Olahraga')
  const [condition, setCondition] = useState<ConditionType>('Seperti baru')
  const [priceInput, setPriceInput] = useState('20000')
  const [depositInput, setDepositInput] = useState('100000')
  const [swapNote, setSwapNote] = useState('Helm sepeda atau kunci gembok')
  const [description, setDescription] = useState(
    'Sepeda lipat 16 inci, rem depan-belakang pakem, ban baru ganti bulan lalu. Cocok buat ke kampus dari kos.',
  )
  const [codLocation, setCodLocation] = useState('Gerbang Utama UNNES')
  const [sorotEnabled, setSorotEnabled] = useState(true)


  const handlePickPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files ?? [])
    e.target.value = '' // supaya foto yang sama bisa dipilih lagi
    if (files.length === 0) return

    const slots = MAX_PHOTOS - photos.length
    if (slots <= 0) {
      onShowToast(`Maksimal ${MAX_PHOTOS} foto per barang.`)
      return
    }
    if (files.length > slots) {
      onShowToast(`Hanya ${slots} foto lagi yang muat, sisanya diabaikan.`)
    }

    setIsProcessingPhoto(true)
    const added: string[] = []
    for (const file of files.slice(0, slots)) {
      const problem = validateImageFile(file)
      if (problem) {
        onShowToast(`${file.name}: ${problem}`)
        continue
      }
      try {
        added.push(await fileToCompressedDataUrl(file))
      } catch {
        onShowToast(`${file.name}: gambar tidak dapat dibaca.`)
      }
    }
    setIsProcessingPhoto(false)
    if (added.length > 0) setPhotos((prev) => [...prev, ...added])
  }

  const removePhoto = (idx: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx))

  const makeCover = (idx: number) =>
    setPhotos((prev) => [prev[idx], ...prev.filter((_, i) => i !== idx)])

  const numericPrice =
    trxType === 'Donasi' ? 0 : Math.max(0, parseInt(priceInput || '0', 10) || 0)

  const formattedPreviewPrice = (() => {
    if (trxType === 'Donasi') return 'Gratis'
    if (trxType === 'Tukar') return 'Tukar barang'
    if (trxType === 'Sewa') {
      if (numericPrice >= 1000 && numericPrice % 1000 === 0) {
        return `Rp${numericPrice / 1000}rb/hari`
      }
      return `Rp${numericPrice.toLocaleString('id-ID')}/hari`
    }
    return `Rp${numericPrice.toLocaleString('id-ID')}`
  })()

  const visual = CATEGORY_VISUALS[category]
  const shortLoc = codLocation.replace(' UNNES', '')

  const previewProduct: ProductItem = {
    id: `item-${Date.now()}`,
    title: title.trim() || 'Nama barang kampus',
    type: trxType,
    priceLabel: formattedPreviewPrice,
    numericPrice,
    depositLabel:
      trxType === 'Sewa' && depositInput
        ? `Rp ${Number(depositInput).toLocaleString('id-ID')}`
        : undefined,
    negotiable: trxType === 'Jual',
    category,
    condition,
    locationShort: shortLoc,
    codSpot: codLocation,
    areaGroup: 'Dalam kampus',
    distanceMeters: 250,
    highlighted: sorotEnabled,
    theme: visual.theme,
    iconAsset: visual.icon,
    photos: photos.length > 0 ? photos : undefined,
    views: 1,
    postedAgo: 'Baru saja diposting',
    description:
      trxType === 'Tukar'
        ? `${description} (Ingin ditukar dengan: ${swapNote})`
        : description,
    seller: {
      ...SELLERS.dimas,
      id: 'raka',
      name: 'Raka Aditya',
      initials: 'RA',
      avatarBg: '#2F5FD6',
      faculty: 'Sistem Informasi · FMIPA',
    },
  }

  const typeOptions: {
    id: TransactionType
    icon: string
    activeBorder: string
    activeBg: string
    activeText: string
    helper: string
  }[] = [
    {
      id: 'Jual',
      icon: `${assetPathPrefix}/54efb.svg`,
      activeBorder: 'border-[#17683A]',
      activeBg: 'bg-[#DCF2E1]/70',
      activeText: 'text-[#1c7a3d]',
      helper: 'Jual: dapatkan uang tunai atau QRIS saat COD di kampus.',
    },
    {
      id: 'Sewa',
      icon: `${assetPathPrefix}/0e30f.svg`,
      activeBorder: 'border-[#2F5FD6]',
      activeBg: 'bg-[#DCE8FF]/80',
      activeText: 'text-[#2f5fd6]',
      helper:
        'Sewa: barang tetap milikmu, penyewa mengembalikan sesuai tanggal.',
    },
    {
      id: 'Tukar',
      icon: `${assetPathPrefix}/51f38.svg`,
      activeBorder: 'border-[#6E45D3]',
      activeBg: 'bg-[#ECE2FF]/80',
      activeText: 'text-[#6e45d3]',
      helper:
        'Tukar: barter langsung dengan barang kuliah lain (+50 Eco-Points).',
    },
    {
      id: 'Donasi',
      icon: `${assetPathPrefix}/cc7c4.svg`,
      activeBorder: 'border-[#D23A70]',
      activeBg: 'bg-[#FFE1EB]/80',
      activeText: 'text-[#d23a70]',
      helper:
        'Donasi: bantu sesama mahasiswa UNNES & dapatkan +100 Eco-Points!',
    },
  ]

  const activeHelper =
    typeOptions.find((t) => t.id === trxType)?.helper ?? typeOptions[1].helper

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      onShowToast('Isi nama barang terlebih dahulu.')
      return
    }
    onPublishProduct(previewProduct, sorotEnabled)
  }

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
      <div>
        <h1 className="font-['Poppins:Bold'] text-[26px] text-[#1f1f1f]">
          Pasang Barang
        </h1>
        <p className="mt-0.5 font-['Poppins:Regular'] text-[13px] text-[#6e6a63]">
          Isi detail barangmu. Gratis, dan langsung tayang.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-7 items-start"
      >
        {/* Left Main Form Card */}
        <div className="lg:col-span-7 rounded-[20px] bg-white border border-[#EBDDC2] shadow-[0_4px_18px_rgba(110,86,40,0.05)] p-5 sm:p-7 space-y-6">
          {/* Transaction Type Cards */}
          <div>
            <label className="block font-['Poppins:Bold'] text-[14px] text-[#1f1f1f] mb-3">
              Mau diapakan barangmu?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {typeOptions.map((opt) => {
                const selected = trxType === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTrxType(opt.id)}
                    className={`h-[76px] rounded-[14px] flex flex-col items-center justify-center gap-2 transition-all ${
                      selected
                        ? `border-[1.5px] ${opt.activeBorder} ${opt.activeBg}`
                        : 'border border-[#EBDDC2] bg-white hover:bg-[#FDF4E3]/60'
                    }`}
                  >
                    <img
                      src={opt.icon}
                      alt=""
                      className="block shrink-0"
                    />
                    <span
                      className={`font-['Poppins:Bold'] text-[13px] ${
                        selected ? opt.activeText : 'text-[#1f1f1f]'
                      }`}
                    >
                      {opt.id}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Contextual Helper Banner */}
            <div className="mt-3 rounded-[10px] bg-[#DCE8FF]/85 px-3.5 py-2.5 flex items-center gap-2.5">
              <img
                src={`${assetPathPrefix}/45da2.svg`}
                alt=""
                className="block shrink-0"
              />
              <span className="font-['Poppins:Regular'] text-[12px] text-[#2f5fd6]">
                {activeHelper}
              </span>
            </div>
          </div>

          {/* Foto Barang */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="font-['Poppins:Bold'] text-[14px] text-[#1f1f1f]">
                Foto barang
              </label>
              <span className="font-['Poppins:Regular'] text-[12.5px] text-[#6e6a63]">
                {photos.length}/{MAX_PHOTOS}
              </span>
            </div>

            {showCamera && (
              <CameraCapture
                title="Foto barang"
                onClose={() => setShowCamera(false)}
                onUnavailable={() => {
                  setShowCamera(false)
                  photoInputRef.current?.click()
                }}
                onCapture={(dataUrl) => {
                  setPhotos((prev) =>
                    prev.length < MAX_PHOTOS ? [...prev, dataUrl] : prev,
                  )
                  setShowCamera(false)
                }}
              />
            )}

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePickPhotos}
            />

            <div className="flex flex-wrap items-center gap-3">
              {photos.map((src, idx) => (
                <div
                  key={`${idx}-${src.length}`}
                  className="relative size-[96px] sm:size-[108px] rounded-[14px] overflow-hidden bg-[#FDF4E3] border border-[#EBDDC2]"
                >
                  <img
                    src={src}
                    alt={`Foto barang ${idx + 1}`}
                    className="absolute inset-0 size-full object-cover"
                  />
                  {idx === 0 ? (
                    <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-full bg-[#1F1F1F]/75 font-['Poppins:Bold'] text-[9.5px] text-white">
                      Sampul
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeCover(idx)}
                      className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-full bg-white/90 font-['Poppins:Bold'] text-[9.5px] text-[#1f1f1f]"
                    >
                      Jadikan sampul
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    aria-label={`Hapus foto ${idx + 1}`}
                    className="absolute top-1.5 right-1.5 z-10 size-[24px] rounded-full bg-[#1F1F1F]/75 text-white text-[14px] leading-none flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  disabled={isProcessingPhoto}
                  onClick={() => photoInputRef.current?.click()}
                  className="size-[96px] sm:size-[108px] rounded-[14px] border-[1.5px] border-dashed border-[#17683A] bg-[#FFFDF8] hover:bg-[#E2F1E5]/35 disabled:opacity-60 flex flex-col items-center justify-center gap-1.5 transition-colors"
                >
                  <img
                    src={`${assetPathPrefix}/4f471.svg`}
                    alt=""
                    className="block"
                  />
                  <span className="font-['Poppins:Bold'] text-[12px] text-[#17683a]">
                    {isProcessingPhoto ? 'Memproses…' : 'Tambah'}
                  </span>
                </button>
              )}

              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  disabled={isProcessingPhoto}
                  onClick={() => {
                    if (navigator.mediaDevices?.getUserMedia) setShowCamera(true)
                    else onShowToast('Kamera tidak tersedia, pilih foto dari galeri.')
                  }}
                  className="size-[96px] sm:size-[108px] rounded-[14px] border-[1.5px] border-dashed border-[#17683A] bg-[#FFFDF8] hover:bg-[#E2F1E5]/35 disabled:opacity-60 flex flex-col items-center justify-center gap-1.5 transition-colors"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17683A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span className="font-['Poppins:Bold'] text-[12px] text-[#17683a]">
                    Kamera
                  </span>
                </button>
              )}
            </div>
            <p className="mt-2 font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
              Pilih foto dari galeri HP atau ambil langsung dengan kamera.
              Foto pertama jadi sampul.
            </p>
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
              Nama barang
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kalkulator Casio fx-991ID Plus"
              className="w-full h-[48px] rounded-[12px] border border-[#EBDDC2] px-4 outline-none focus:border-[#17683a] font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
            />
          </div>

          {/* Kategori & Kondisi */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                Kategori
              </label>
              <div className="relative flex items-center">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full appearance-none h-[48px] rounded-[12px] border border-[#EBDDC2] bg-white pl-4 pr-10 outline-none focus:border-[#17683a] font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                >
                  <option value="Kendaraan & Olahraga">
                    Kendaraan &amp; Olahraga
                  </option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Buku & Modul">Buku &amp; Modul</option>
                  <option value="Alat Praktikum">Alat Praktikum</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Perabot Kos">Perabot Kos</option>
                </select>
                <img
                  src={`${assetPathPrefix}/09ce4.svg`}
                  alt=""
                  className="pointer-events-none absolute right-3.5 block"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-2">
                Kondisi
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {(['Baru', 'Seperti baru', 'Bekas baik'] as ConditionType[]).map(
                  (cond) => {
                    const active = condition === cond
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setCondition(cond)}
                        className={`h-[34px] px-3.5 rounded-full font-['Poppins:Bold'] text-[12px] transition-colors ${
                          active
                            ? 'bg-[#E2F1E5] border-[1.5px] border-[#17683A] text-[#17683a]'
                            : 'bg-white border border-[#EBDDC2] text-[#1f1f1f] hover:bg-[#FDF4E3]'
                        }`}
                      >
                        {cond}
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Pricing / Barter Row */}
          {trxType === 'Sewa' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                  Harga sewa
                </label>
                <div className="h-[48px] rounded-[12px] border border-[#EBDDC2] px-4 flex items-center justify-between gap-2 focus-within:border-[#17683a]">
                  <span className="font-['Poppins:Regular'] text-[14px] text-[#6e6a63]">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                  />
                  <span className="font-['Poppins:Regular'] text-[12.5px] text-[#6e6a63] shrink-0">
                    /hari
                  </span>
                </div>
              </div>
              <div>
                <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                  Deposit (opsional)
                </label>
                <div className="h-[48px] rounded-[12px] border border-[#EBDDC2] px-4 flex items-center gap-2 focus-within:border-[#17683a]">
                  <span className="font-['Poppins:Regular'] text-[14px] text-[#6e6a63]">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={depositInput}
                    onChange={(e) => setDepositInput(e.target.value)}
                    className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                  />
                </div>
              </div>
            </div>
          )}

          {trxType === 'Jual' && (
            <div>
              <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                Harga jual
              </label>
              <div className="h-[48px] rounded-[12px] border border-[#EBDDC2] px-4 flex items-center gap-2 focus-within:border-[#17683a]">
                <span className="font-['Poppins:Regular'] text-[14px] text-[#6e6a63]">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                />
              </div>
            </div>
          )}

          {trxType === 'Tukar' && (
            <div>
              <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                Ingin ditukar dengan apa?
              </label>
              <input
                type="text"
                value={swapNote}
                onChange={(e) => setSwapNote(e.target.value)}
                className="w-full h-[48px] rounded-[12px] border border-[#EBDDC2] px-4 outline-none focus:border-[#17683a] font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
              />
            </div>
          )}

          {/* Deskripsi */}
          <div>
            <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
              Deskripsi
            </label>
            <div className="relative rounded-[12px] border border-[#EBDDC2] p-3.5 pb-7 focus-within:border-[#17683a]">
              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none bg-transparent outline-none font-['Poppins:Regular'] text-[13px] text-[#1f1f1f] leading-relaxed"
              />
              <span className="absolute bottom-2.5 right-3.5 font-['Poppins:Regular'] text-[10px] text-[#a39c8f]">
                {description.length}/500
              </span>
            </div>
          </div>

          {/* Lokasi COD */}
          <div>
            <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
              Lokasi COD
            </label>
            <div className="relative flex items-center h-[48px] rounded-[12px] border border-[#EBDDC2] px-3.5 gap-2.5 focus-within:border-[#17683a]">
              <img
                src={`${assetPathPrefix}/b5d6b.svg`}
                alt=""
                className="block shrink-0"
              />
              <select
                value={codLocation}
                onChange={(e) => setCodLocation(e.target.value)}
                className="w-full appearance-none bg-transparent outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f] pr-6"
              >
                <option value="Gerbang Utama UNNES">Gerbang Utama UNNES</option>
                <option value="Perpustakaan Pusat UNNES">
                  Perpustakaan Pusat UNNES
                </option>
                <option value="Masjid Ulul Albab">Masjid Ulul Albab</option>
                <option value="Gedung D7 FMIPA">Gedung D7 FMIPA</option>
                <option value="Dekanat FT UNNES">Dekanat FT UNNES</option>
                <option value="Pendopo FBS UNNES">Pendopo FBS UNNES</option>
              </select>
              <img
                src={`${assetPathPrefix}/499ec.svg`}
                alt=""
                className="pointer-events-none block shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Right Sticky Live Preview & Action Column */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <h2 className="font-['Poppins:Bold'] text-[14px] text-[#6e6a63] mb-3">
              Pratinjau
            </h2>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-[224px] shrink-0">
                <ProductCard
                  product={previewProduct}
                  forceHighlight={sorotEnabled}
                  useShortTitle={false}
                />
              </div>
              <p className="pt-2 font-['Poppins:Regular'] text-[12.5px] text-[#6e6a63] leading-relaxed max-w-[170px]">
                Begini tampilan barangmu di Beranda dan hasil pencarian.
              </p>
            </div>
          </div>

          {/* Sorot Barang Toggle Card */}
          <div className="rounded-[18px] bg-[#FFF1D6] border border-[#F5A314] p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                type="button"
                onClick={() => onNavigate('sorot-barang')}
                className="size-[44px] rounded-full bg-[#F5A314] flex items-center justify-center shrink-0"
                title="Lihat paket Sorot Barang"
              >
                <img
                  src={`${assetPathPrefix}/fb58c.svg`}
                  alt=""
                  className="block shrink-0"
                />
              </button>
              <div className="min-w-0">
                <p className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f]">
                  Sorot Barang
                </p>
                <p className="font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
                  Tampil paling atas di Beranda
                </p>
                <p className="font-['Poppins:Bold'] text-[12px] text-[#b26a00]">
                  mulai Rp2.000 atau 100 poin
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={sorotEnabled}
              onClick={() => setSorotEnabled((prev) => !prev)}
              className={`w-[44px] h-[25px] rounded-full p-0.5 transition-colors shrink-0 ${
                sorotEnabled ? 'bg-[#17683A]' : 'bg-[#D6C8AE]'
              }`}
            >
              <span
                className={`block size-[21px] rounded-full bg-white shadow-xs transition-transform ${
                  sorotEnabled ? 'translate-x-[19px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Tips Card */}
          <div className="rounded-[18px] bg-white border border-[#EBDDC2] p-5">
            <h3 className="font-['Poppins:Bold'] text-[14px] text-[#1f1f1f] mb-3">
              Tips biar cepat laku
            </h3>
            <ul className="space-y-2.5 text-[12.5px] font-['Poppins:Regular'] text-[#1f1f1f]">
              {[
                'Foto terang dari beberapa sisi',
                'Tulis kondisi apa adanya',
                'Pilih titik COD yang ramai',
              ].map((tip) => (
                <li key={tip} className="flex items-center gap-2.5">
                  <span className="size-[18px] rounded-full bg-[#DCF2E1] flex items-center justify-center shrink-0">
                    <img
                      src={`${assetPathPrefix}/fa9d7.svg`}
                      alt=""
                      className="block"
                    />
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Submit & Draft Buttons */}
          <button
            type="submit"
            className="w-full h-[54px] rounded-[14px] bg-[#17683A] hover:bg-[#12542e] transition-colors font-['Poppins:Bold'] text-[16px] text-white"
          >
            Pasang Sekarang
          </button>

          <button
            type="button"
            onClick={() =>
              onShowToast(`Draf "${title}" berhasil disimpan di perangkatmu.`)
            }
            className="w-full h-[48px] rounded-[14px] bg-white border border-[#EBDDC2] hover:bg-[#FDF4E3] transition-colors font-['Poppins:Bold'] text-[14px] text-[#1f1f1f]"
          >
            Simpan draf
          </button>
        </div>
      </form>
    </main>
  )
}
