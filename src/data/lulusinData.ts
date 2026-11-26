export const assetPathPrefix = '/assets'

export type TransactionType = 'Jual' | 'Sewa' | 'Tukar' | 'Donasi'
export type CardTheme = 'orange' | 'blue' | 'purple' | 'teal' | 'green' | 'pink'
export type ConditionType = 'Baru' | 'Seperti baru' | 'Bekas baik'
export type CategoryType =
  | 'Elektronik'
  | 'Buku & Modul'
  | 'Alat Praktikum'
  | 'Fashion'
  | 'Perabot Kos'
  | 'Kendaraan & Olahraga'

export type ScreenId =
  | 'masuk'
  | 'daftar'
  | 'verifikasi-ktm'
  | 'beranda'
  | 'pencarian'
  | 'detail-barang'
  | 'chat'
  | 'pasang-barang'
  | 'papan-wtb'
  | 'atur-cod'
  | 'eco-points'
  | 'transaksi'
  | 'umkm-kampus'
  | 'sorot-barang'

export interface SellerInfo {
  id: string
  name: string
  initials: string
  avatarBg: string
  faculty: string
  rating: string
  transactionsCount: number
  verifiedKtm: boolean
}

export interface ProductItem {
  id: string
  title: string
  shortTitle?: string
  type: TransactionType
  priceLabel: string
  numericPrice: number
  negotiable?: boolean
  depositLabel?: string
  category: CategoryType
  condition: ConditionType
  locationShort: string
  codSpot: string
  areaGroup: 'Dalam kampus' | '< 1 km' | 'Sekaran'
  distanceMeters: number
  highlighted?: boolean
  theme: CardTheme
  iconAsset: string
  detailLargeIconAsset?: string
  /** Foto asli yang diunggah penjual dari HP (data URL). Foto pertama = sampul. */
  photos?: string[]
  views: number
  postedAgo: string
  description: string
  seller: SellerInfo
}

export interface CodInviteData {
  dateLabel: string
  location: string
  priceAndMethod: string
  statusNote: string
}

export interface ChatMessage {
  id: string
  sender: 'me' | 'them'
  text?: string
  /** Gambar yang dilampirkan dalam chat (data URL). */
  imageUrl?: string
  time: string
  codInvite?: CodInviteData
}

export interface ChatThread {
  id: string
  partner: SellerInfo
  onlineStatus: string
  unreadCount: number
  lastTime: string
  attachedProductId: string
  negotiatedPriceLabel?: string
  messages: ChatMessage[]
}

export interface WtbRequest {
  id: string
  authorName: string
  initials: string
  avatarBg: string
  facultyAndTime: string
  wantType: 'Mau beli' | 'Mau sewa' | 'Mau tukar'
  category: 'Elektronik' | 'Buku' | 'Alat Praktikum' | 'Kos' | 'Kendaraan'
  title: string
  budgetOrNote: string
  offersCount: number
  partnerThreadId: string
}

export type TrxStatus =
  | 'COD dijadwalkan'
  | 'Sedang disewa'
  | 'Selesai'
  | 'Menunggu konfirmasi'
  | 'Dibatalkan'

export interface TransactionRecord {
  id: string
  code: string
  role: 'Pembelian' | 'Penjualan'
  productId: string
  title: string
  subtitle: string
  scheduleOrNote: string
  status: TrxStatus
  stepIndex: 0 | 1 | 2 | 3 // 0: Diajukan, 1: Disetujui, 2: COD, 3: Selesai
  codBannerText: string
  paymentMethod: string
  originalPrice: string
  finalPrice: string
  ecoPointsEarned?: number
  reviewed?: boolean
  partnerThreadId: string
}

export interface UmkmVoucher {
  id: string
  umkmId: string
  name: string
  offer: string
  pointsCost: number
  theme: CardTheme
  iconAsset: string
}

export interface UmkmPartner {
  id: string
  name: string
  category: 'Makanan' | 'Minuman' | 'Print & ATK' | 'Laundry'
  subtitle: string
  distanceMeters: number
  ecoPartner: boolean
  hasPromo: boolean
  promoDesc?: string
  pointsRequired?: number
  theme: CardTheme
  iconAsset: string
}

export interface PointHistoryEntry {
  id: string
  title: string
  date: string
  delta: number
}

export const CARD_THEME_GRADIENTS: Record<CardTheme, string> = {
  orange: 'bg-gradient-to-br from-[#FDC24F] to-[#F2930C]',
  blue: 'bg-gradient-to-br from-[#64A2F7] to-[#3263DE]',
  purple: 'bg-gradient-to-br from-[#AE91F8] to-[#7650E6]',
  teal: 'bg-gradient-to-br from-[#5CCFC0] to-[#1E9488]',
  green: 'bg-gradient-to-br from-[#63C785] to-[#2C9152]',
  pink: 'bg-gradient-to-br from-[#F493BB] to-[#D6457F]',
}

export const TYPE_BADGE_STYLES: Record<
  TransactionType,
  { bg: string; text: string }
> = {
  Jual: { bg: 'bg-[#DCF2E1]', text: 'text-[#1C7A3D]' },
  Sewa: { bg: 'bg-[#DCE8FF]', text: 'text-[#2F5FD6]' },
  Tukar: { bg: 'bg-[#ECE2FF]', text: 'text-[#6E45D3]' },
  Donasi: { bg: 'bg-[#FFE1EB]', text: 'text-[#D23A70]' },
}

export const SELLERS: Record<string, SellerInfo> = {
  nadia: {
    id: 'nadia',
    name: 'Nadia Putri',
    initials: 'NP',
    avatarBg: '#D6457F',
    faculty: 'Pend. Matematika',
    rating: '4,9',
    transactionsCount: 12,
    verifiedKtm: true,
  },
  bayu: {
    id: 'bayu',
    name: 'Bayu Saputra',
    initials: 'BS',
    avatarBg: '#6E45D3',
    faculty: 'Teknik Elektro · FT',
    rating: '4,8',
    transactionsCount: 9,
    verifiedKtm: true,
  },
  sela: {
    id: 'sela',
    name: 'Sela Anindya',
    initials: 'SA',
    avatarBg: '#2F5FD6',
    faculty: 'Ilmu Keolahragaan · FIK',
    rating: '5,0',
    transactionsCount: 7,
    verifiedKtm: true,
  },
  dimas: {
    id: 'dimas',
    name: 'Dimas Arya',
    initials: 'DA',
    avatarBg: '#1C7A3D',
    faculty: 'Fisika · FMIPA',
    rating: '4,9',
    transactionsCount: 15,
    verifiedKtm: true,
  },
  rina: {
    id: 'rina',
    name: 'Rina Novita',
    initials: 'RN',
    avatarBg: '#B26A00',
    faculty: 'Seni Rupa · FBS',
    rating: '4,8',
    transactionsCount: 6,
    verifiedKtm: true,
  },
}

export const INITIAL_PRODUCTS: ProductItem[] = [
  // === 5 SOROT BARANG (from D04-beranda) ===
  {
    id: 'kamera-mirrorless',
    title: 'Kamera Mirrorless',
    type: 'Sewa',
    priceLabel: 'Rp75rb/hari',
    numericPrice: 75000,
    depositLabel: 'Rp 250.000',
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'FBS · 350 m',
    codSpot: 'Gedung Dekanat FBS · Perpustakaan Pusat',
    areaGroup: 'Dalam kampus',
    distanceMeters: 350,
    highlighted: true,
    theme: 'orange',
    iconAsset: `${assetPathPrefix}/3c26c.svg`,
    views: 214,
    postedAgo: 'Diposting 1 hari lalu',
    description:
      'Kamera mirrorless jernih untuk tugas fotografi, dokumentasi kepanitiaan, atau wisuda. Sudah termasuk baterai cadangan, strap, dan SD card 64GB.',
    seller: SELLERS.rina,
  },
  {
    id: 'headphone-bt',
    title: 'Headphone BT',
    type: 'Jual',
    priceLabel: 'Rp120.000',
    numericPrice: 120000,
    negotiable: true,
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'FT · 600 m',
    codSpot: 'Gedung E1 FT · Masjid Ulul Albab',
    areaGroup: 'Dalam kampus',
    distanceMeters: 600,
    highlighted: true,
    theme: 'blue',
    iconAsset: `${assetPathPrefix}/59886.svg`,
    views: 162,
    postedAgo: 'Diposting 1 hari lalu',
    description:
      'Headphone Bluetooth over-ear baterai awet 30 jam, bantalan empuk nyaman dipakai nugas di perpus. Kabel charger USB-C lengkap.',
    seller: SELLERS.bayu,
  },
  {
    id: 'sepeda-lipat',
    title: 'Sepeda Lipat Element 16 inci',
    shortTitle: 'Sepeda Lipat',
    type: 'Sewa',
    priceLabel: 'Rp20rb/hari',
    numericPrice: 20000,
    depositLabel: 'Rp 100.000',
    category: 'Kendaraan & Olahraga',
    condition: 'Seperti baru',
    locationShort: 'FIK · 800 m',
    codSpot: 'Gerbang Utama UNNES · FIK',
    areaGroup: '< 1 km',
    distanceMeters: 800,
    highlighted: true,
    theme: 'purple',
    iconAsset: `${assetPathPrefix}/881ea.svg`,
    views: 195,
    postedAgo: 'Diposting 3 hari lalu',
    description:
      'Sepeda lipat 16 inci, rem depan-belakang pakem, ban baru ganti bulan lalu. Cocok buat ke kampus dari kos.',
    seller: SELLERS.sela,
  },
  {
    id: 'laptop-stand',
    title: 'Laptop Stand',
    type: 'Jual',
    priceLabel: 'Rp65.000',
    numericPrice: 65000,
    negotiable: true,
    category: 'Perabot Kos',
    condition: 'Baru',
    locationShort: 'Kos Banaran',
    codSpot: 'Gerbang Utama UNNES · Banaran',
    areaGroup: '< 1 km',
    distanceMeters: 500,
    highlighted: true,
    theme: 'teal',
    iconAsset: `${assetPathPrefix}/ce46c.svg`,
    views: 98,
    postedAgo: 'Diposting 2 hari lalu',
    description:
      'Stand laptop aluminium lipat 6 tingkat ketinggian, kokoh untuk laptop 13–16 inci. Lengkap dengan pouch kain beludru.',
    seller: SELLERS.dimas,
  },
  {
    id: 'kalkulator-ti84-sorot',
    title: 'Kalkulator Grafik TI-84',
    type: 'Jual',
    priceLabel: 'Rp450.000',
    numericPrice: 450000,
    negotiable: true,
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'FMIPA',
    codSpot: 'Gedung D7 FMIPA · Perpustakaan Pusat',
    areaGroup: 'Dalam kampus',
    distanceMeters: 250,
    highlighted: true,
    theme: 'green',
    iconAsset: `${assetPathPrefix}/e5e10.svg`,
    detailLargeIconAsset: `${assetPathPrefix}/5abc9.svg`,
    views: 240,
    postedAgo: 'Diposting 2 hari lalu',
    description:
      'Kalkulator grafik Texas Instruments TI-84 Plus original, layar tajam tanpa dead pixel, cocok untuk mata kuliah metode numerik & statistik.',
    seller: SELLERS.nadia,
  },

  // === 10 BARANG TERBARU (from D04-beranda & D06-detail-barang) ===
  {
    id: 'kalkulator-casio-991',
    title: 'Kalkulator Casio fx-991ID Plus',
    shortTitle: 'Kalkulator Casio',
    type: 'Jual',
    priceLabel: 'Rp180.000',
    numericPrice: 180000,
    negotiable: true,
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'Perpus Pusat',
    codSpot: 'Perpustakaan Pusat · Gedung D7 FMIPA',
    areaGroup: 'Dalam kampus',
    distanceMeters: 150,
    theme: 'green',
    iconAsset: `${assetPathPrefix}/51d3e.svg`,
    detailLargeIconAsset: `${assetPathPrefix}/5abc9.svg`,
    views: 128,
    postedAgo: 'Diposting 2 hari lalu',
    description:
      'Dipakai 1 semester untuk Kalkulus dan Statistika. Semua tombol normal, layar jernih, lengkap dengan cover dan buku panduan. Boleh dicek dulu saat COD.',
    seller: SELLERS.nadia,
  },
  {
    id: 'buku-kalkulus',
    title: 'Buku Kalkulus Purcell',
    shortTitle: 'Buku Kalkulus',
    type: 'Donasi',
    priceLabel: 'Gratis',
    numericPrice: 0,
    category: 'Buku & Modul',
    condition: 'Bekas baik',
    locationShort: 'FMIPA',
    codSpot: 'Gedung D7 FMIPA',
    areaGroup: 'Dalam kampus',
    distanceMeters: 220,
    theme: 'pink',
    iconAsset: `${assetPathPrefix}/53877.svg`,
    views: 184,
    postedAgo: 'Diposting 3 jam lalu',
    description:
      'Buku Kalkulus Edisi 9 Jilid 1, halaman lengkap tidak ada yang robek, hanya ada sedikit stabilo rapi. Gratis untuk adik tingkat yang membutuhkan.',
    seller: SELLERS.nadia,
  },
  {
    id: 'jas-lab-m',
    title: 'Jas Lab Ukuran M',
    type: 'Tukar',
    priceLabel: 'Tukar barang',
    numericPrice: 70000,
    category: 'Alat Praktikum',
    condition: 'Seperti baru',
    locationShort: 'FIK',
    codSpot: 'Lobi FIK · Masjid Ulul Albab',
    areaGroup: 'Dalam kampus',
    distanceMeters: 320,
    theme: 'teal',
    iconAsset: `${assetPathPrefix}/14c46.svg`,
    views: 93,
    postedAgo: 'Diposting 5 jam lalu',
    description:
      'Jas praktikum lengan panjang ukuran M bersih sudah dilaundry, ingin tukar dengan ukuran L atau kacamata safety lab.',
    seller: SELLERS.sela,
  },
  {
    id: 'lampu-belajar-led',
    title: 'Lampu Belajar LED',
    type: 'Jual',
    priceLabel: 'Rp45.000',
    numericPrice: 45000,
    negotiable: true,
    category: 'Perabot Kos',
    condition: 'Seperti baru',
    locationShort: 'Kos Banaran',
    codSpot: 'Gerbang Utama UNNES',
    areaGroup: '< 1 km',
    distanceMeters: 520,
    theme: 'orange',
    iconAsset: `${assetPathPrefix}/c0e2f.svg`,
    views: 77,
    postedAgo: 'Diposting kemarin',
    description:
      'Lampu meja belajar LED rechargeable 3 mode warna cahaya (putih, warm, natural), leher fleksibel bisa ditekuk 360 derajat.',
    seller: SELLERS.dimas,
  },
  {
    id: 'laptop-sidang',
    title: 'Laptop untuk Sidang',
    type: 'Sewa',
    priceLabel: 'Rp50rb/hari',
    numericPrice: 50000,
    depositLabel: 'Rp 200.000',
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'FT',
    codSpot: 'Dekanat FT · Perpustakaan Pusat',
    areaGroup: 'Dalam kampus',
    distanceMeters: 400,
    theme: 'blue',
    iconAsset: `${assetPathPrefix}/ce46c.svg`,
    views: 141,
    postedAgo: 'Diposting kemarin',
    description:
      'Sewa laptop tipis Core i5 RAM 16GB siap PowerPoint, Zoom, dan HDMI lancar tanpa lag buat seminar proposal atau sidang skripsi.',
    seller: SELLERS.bayu,
  },
  {
    id: 'modul-fisika',
    title: 'Modul Praktikum Fisika',
    type: 'Jual',
    priceLabel: 'Rp25.000',
    numericPrice: 25000,
    category: 'Buku & Modul',
    condition: 'Bekas baik',
    locationShort: 'FMIPA',
    codSpot: 'Gedung D7 FMIPA',
    areaGroup: 'Dalam kampus',
    distanceMeters: 210,
    theme: 'purple',
    iconAsset: `${assetPathPrefix}/2068d.svg`,
    views: 64,
    postedAgo: 'Diposting 2 hari lalu',
    description:
      'Bundel modul praktikum Fisika Dasar 1 & 2 bersih lengkap dengan tabel referensi pengolahan data.',
    seller: SELLERS.dimas,
  },
  {
    id: 'kemeja-putih-l',
    title: 'Kemeja Putih Ukuran L',
    type: 'Donasi',
    priceLabel: 'Gratis',
    numericPrice: 0,
    category: 'Fashion',
    condition: 'Seperti baru',
    locationShort: 'FEB',
    codSpot: 'Taman FEB · Masjid Ulul Albab',
    areaGroup: 'Dalam kampus',
    distanceMeters: 310,
    theme: 'pink',
    iconAsset: `${assetPathPrefix}/14c46.svg`,
    views: 112,
    postedAgo: 'Diposting 2 hari lalu',
    description:
      'Kemeja putih polos lengan panjang ukuran L bahan katun adem, baru dipakai 2 kali saat PKKMB & sidang.',
    seller: SELLERS.rina,
  },
  {
    id: 'printer-epson',
    title: 'Printer Bekas Epson',
    type: 'Jual',
    priceLabel: 'Rp350.000',
    numericPrice: 350000,
    negotiable: true,
    category: 'Elektronik',
    condition: 'Bekas baik',
    locationShort: 'Kos Sekaran',
    codSpot: 'Sekaran · Gerbang Utama UNNES',
    areaGroup: 'Sekaran',
    distanceMeters: 750,
    theme: 'blue',
    iconAsset: `${assetPathPrefix}/d2a93.svg`,
    views: 205,
    postedAgo: 'Diposting 3 hari lalu',
    description:
      'Printer infus Epson L120 siap pakai ngeprint skripsi ratusan lembar, head normal semua warna keluar rapi, bonus tinta hitam setengah botol.',
    seller: SELLERS.bayu,
  },
  {
    id: 'novel-laskar-pelangi',
    title: 'Novel Laskar Pelangi',
    type: 'Tukar',
    priceLabel: 'Tukar barang',
    numericPrice: 40000,
    category: 'Buku & Modul',
    condition: 'Bekas baik',
    locationShort: 'FBS',
    codSpot: 'Pendopo FBS · Perpus Pusat',
    areaGroup: 'Dalam kampus',
    distanceMeters: 340,
    theme: 'orange',
    iconAsset: `${assetPathPrefix}/53877.svg`,
    views: 53,
    postedAgo: 'Diposting 3 hari lalu',
    description:
      'Novel Laskar Pelangi cetakan original Bentang Pustaka, sampul disampul plastik rapi. Bebas tukar dengan novel sastra Indonesia lainnya.',
    seller: SELLERS.rina,
  },
  {
    id: 'sepeda-gunung',
    title: 'Sepeda Gunung',
    type: 'Sewa',
    priceLabel: 'Rp25rb/hari',
    numericPrice: 25000,
    depositLabel: 'Rp 150.000',
    category: 'Kendaraan & Olahraga',
    condition: 'Bekas baik',
    locationShort: 'FIK',
    codSpot: 'Lapangan FIK · Masjid Ulul Albab',
    areaGroup: 'Dalam kampus',
    distanceMeters: 420,
    theme: 'green',
    iconAsset: `${assetPathPrefix}/11e54.svg`,
    views: 88,
    postedAgo: 'Diposting 4 hari lalu',
    description:
      'Sepeda gunung 21 speed kuat nanjak area Gunungpati & Sekaran, sudah termasuk kunci gembok kombinasi.',
    seller: SELLERS.sela,
  },

  // === EXTRA CALCULATOR ITEMS FROM D05-PENCARIAN-FILTER ===
  {
    id: 'kalkulator-ti84-sewa',
    title: 'Kalkulator Grafik TI-84',
    type: 'Sewa',
    priceLabel: 'Rp15rb/hari',
    numericPrice: 15000,
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'FMIPA',
    codSpot: 'Gedung D7 FMIPA',
    areaGroup: 'Dalam kampus',
    distanceMeters: 200,
    theme: 'blue',
    iconAsset: `${assetPathPrefix}/51d3e.svg`,
    detailLargeIconAsset: `${assetPathPrefix}/5abc9.svg`,
    views: 89,
    postedAgo: 'Diposting 1 hari lalu',
    description:
      'Sewa harian kalkulator grafik TI-84 untuk UTS/UAS atau praktikum analisa numerik di FMIPA.',
    seller: SELLERS.dimas,
  },
  {
    id: 'kalkulator-fx350',
    title: 'Kalkulator Casio fx-350',
    type: 'Donasi',
    priceLabel: 'Gratis',
    numericPrice: 0,
    category: 'Elektronik',
    condition: 'Bekas baik',
    locationShort: 'FT',
    codSpot: 'Lobi Dekanat FT',
    areaGroup: 'Dalam kampus',
    distanceMeters: 380,
    theme: 'pink',
    iconAsset: `${assetPathPrefix}/51d3e.svg`,
    detailLargeIconAsset: `${assetPathPrefix}/5abc9.svg`,
    views: 156,
    postedAgo: 'Diposting kemarin',
    description:
      'Kalkulator scientific Casio fx-350MS peninggalan kuliah semester awal, baterai baru diganti. Gratis buat maba yang butuh.',
    seller: SELLERS.bayu,
  },
  {
    id: 'kalkulator-sharp-w506',
    title: 'Kalkulator Sharp EL-W506',
    shortTitle: 'Kalkulator Sharp EL-W5…',
    type: 'Jual',
    priceLabel: 'Rp140.000',
    numericPrice: 140000,
    negotiable: true,
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'FEB',
    codSpot: 'Perpustakaan Pusat · FEB',
    areaGroup: 'Dalam kampus',
    distanceMeters: 290,
    theme: 'orange',
    iconAsset: `${assetPathPrefix}/e5e10.svg`,
    detailLargeIconAsset: `${assetPathPrefix}/5abc9.svg`,
    views: 74,
    postedAgo: 'Diposting 2 hari lalu',
    description:
      'Kalkulator scientific Sharp WriteView 556 fungsi, tampilan pecahan natural seperti di buku tulis.',
    seller: SELLERS.rina,
  },
  {
    id: 'kalkulator-fx570',
    title: 'Kalkulator Casio fx-570',
    type: 'Tukar',
    priceLabel: 'Tukar barang',
    numericPrice: 110000,
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'FIK',
    codSpot: 'Masjid Ulul Albab',
    areaGroup: 'Dalam kampus',
    distanceMeters: 410,
    theme: 'purple',
    iconAsset: `${assetPathPrefix}/51d3e.svg`,
    detailLargeIconAsset: `${assetPathPrefix}/5abc9.svg`,
    views: 61,
    postedAgo: 'Diposting 3 hari lalu',
    description:
      'Casio fx-570ES Plus mulus, boleh tukar dengan flashdisk 64GB atau mouse wireless.',
    seller: SELLERS.sela,
  },
  {
    id: 'kalkulator-joyko-cc25',
    title: 'Kalkulator Joyko CC-25',
    type: 'Jual',
    priceLabel: 'Rp35.000',
    numericPrice: 35000,
    category: 'Elektronik',
    condition: 'Baru',
    locationShort: 'Kos Banaran',
    codSpot: 'Gerbang Utama UNNES',
    areaGroup: '< 1 km',
    distanceMeters: 540,
    theme: 'teal',
    iconAsset: `${assetPathPrefix}/51d3e.svg`,
    detailLargeIconAsset: `${assetPathPrefix}/5abc9.svg`,
    views: 49,
    postedAgo: 'Diposting 3 hari lalu',
    description:
      'Kalkulator dagang & akuntansi 12 digit tombol besar empuk, cocok buat praktikum pengantar akuntansi.',
    seller: SELLERS.dimas,
  },
  {
    id: 'kalkulator-finansial-ba2',
    title: 'Kalkulator Finansial BA II',
    type: 'Sewa',
    priceLabel: 'Rp10rb/hari',
    numericPrice: 10000,
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'FEB',
    codSpot: 'Gedung L2 FEB',
    areaGroup: 'Dalam kampus',
    distanceMeters: 300,
    theme: 'blue',
    iconAsset: `${assetPathPrefix}/51d3e.svg`,
    detailLargeIconAsset: `${assetPathPrefix}/5abc9.svg`,
    views: 83,
    postedAgo: 'Diposting 4 hari lalu',
    description:
      'Texas Instruments BA II Plus Financial Calculator untuk manajemen keuangan & aktuaria.',
    seller: SELLERS.nadia,
  },
  {
    id: 'kalkulator-fx82ms',
    title: 'Kalkulator Casio fx-82MS',
    type: 'Jual',
    priceLabel: 'Rp90.000',
    numericPrice: 90000,
    negotiable: true,
    category: 'Elektronik',
    condition: 'Seperti baru',
    locationShort: 'Kos Sekaran',
    codSpot: 'Sekaran · Perpus Pusat',
    areaGroup: 'Sekaran',
    distanceMeters: 690,
    theme: 'green',
    iconAsset: `${assetPathPrefix}/e5e10.svg`,
    detailLargeIconAsset: `${assetPathPrefix}/5abc9.svg`,
    views: 67,
    postedAgo: 'Diposting 5 hari lalu',
    description:
      'Kalkulator Casio fx-82MS 2nd Edition original garansi resmi masih ada kotak dan kartu garansi.',
    seller: SELLERS.nadia,
  },
]

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'thread-nadia',
    partner: SELLERS.nadia,
    onlineStatus: 'Online · Pend. Matematika',
    unreadCount: 0,
    lastTime: '10.09',
    attachedProductId: 'kalkulator-casio-991',
    negotiatedPriceLabel: 'Rp170.000',
    messages: [
      {
        id: 'm1',
        sender: 'me',
        text: 'Kak, kalkulatornya masih ada?',
        time: '10.02',
      },
      {
        id: 'm2',
        sender: 'them',
        text: 'Masih kok, kondisinya mulus.\nLengkap sama cover-nya juga.',
        time: '10.05',
      },
      {
        id: 'm3',
        sender: 'me',
        text: 'Bisa kurang dikit nggak kak?\nRp160rb gimana?',
        time: '10.06',
      },
      {
        id: 'm4',
        sender: 'them',
        text: 'Boleh deh Rp170rb ya. Ketemu di\nperpus pusat aja?',
        time: '10.09',
      },
      {
        id: 'm5',
        sender: 'me',
        time: '10.10',
        codInvite: {
          dateLabel: 'Selasa, 11 Nov · 13.00',
          location: 'Perpustakaan Pusat UNNES',
          priceAndMethod: 'Rp170.000 · Tunai',
          statusNote: 'Menunggu jawaban Nadia…',
        },
      },
    ],
  },
  {
    id: 'thread-bayu',
    partner: SELLERS.bayu,
    onlineStatus: 'Online · Teknik Elektro',
    unreadCount: 1,
    lastTime: '09.12',
    attachedProductId: 'headphone-bt',
    messages: [
      {
        id: 'b1',
        sender: 'me',
        text: 'Halo kak Bayu, headphone BT-nya ready buat COD hari ini?',
        time: '09.05',
      },
      {
        id: 'b2',
        sender: 'them',
        text: 'Headphone-nya masih ada kak',
        time: '09.12',
      },
    ],
  },
  {
    id: 'thread-sela',
    partner: SELLERS.sela,
    onlineStatus: 'Aktif 15 mnt lalu · FIK',
    unreadCount: 0,
    lastTime: 'Kemarin',
    attachedProductId: 'jas-lab-m',
    messages: [
      {
        id: 's1',
        sender: 'them',
        text: 'Jas labnya ukuran M ya?',
        time: 'Kemarin',
      },
    ],
  },
  {
    id: 'thread-dimas',
    partner: SELLERS.dimas,
    onlineStatus: 'Aktif 1 jam lalu · FMIPA',
    unreadCount: 0,
    lastTime: 'Senin',
    attachedProductId: 'lampu-belajar-led',
    messages: [
      {
        id: 'd1',
        sender: 'me',
        text: 'Makasih infonya kak Dimas!',
        time: 'Senin',
      },
      {
        id: 'd2',
        sender: 'them',
        text: 'Oke, makasih kak',
        time: 'Senin',
      },
    ],
  },
]

export const INITIAL_WTB_REQUESTS: WtbRequest[] = [
  {
    id: 'wtb-1',
    authorName: 'Sela Anindya',
    initials: 'SA',
    avatarBg: '#2F5FD6',
    facultyAndTime: 'FIK · 2 jam lalu',
    wantType: 'Mau beli',
    category: 'Alat Praktikum',
    title: 'Jas lab ukuran M (putih)',
    budgetOrNote: 'Budget maks. Rp75.000 · COD di FIK',
    offersCount: 3,
    partnerThreadId: 'thread-sela',
  },
  {
    id: 'wtb-2',
    authorName: 'Bayu Saputra',
    initials: 'BS',
    avatarBg: '#6E45D3',
    facultyAndTime: 'FT · 5 jam lalu',
    wantType: 'Mau sewa',
    category: 'Kendaraan',
    title: 'Sepeda buat ke kampus, 1 minggu',
    budgetOrNote: 'Maks. Rp20rb/hari · area Sekaran',
    offersCount: 1,
    partnerThreadId: 'thread-bayu',
  },
  {
    id: 'wtb-3',
    authorName: 'Putri Ramadhani',
    initials: 'PR',
    avatarBg: '#D6457F',
    facultyAndTime: 'FEB · kemarin',
    wantType: 'Mau tukar',
    category: 'Buku',
    title: 'Buku Kalkulus Purcell Jilid 1',
    budgetOrNote: 'Ditukar dengan buku Pengantar Akuntansi',
    offersCount: 0,
    partnerThreadId: 'thread-nadia',
  },
  {
    id: 'wtb-4',
    authorName: 'Dimas Arya',
    initials: 'DA',
    avatarBg: '#1C7A3D',
    facultyAndTime: 'FMIPA · kemarin',
    wantType: 'Mau beli',
    category: 'Kos',
    title: 'Meja belajar lipat',
    budgetOrNote: 'Budget maks. Rp60.000',
    offersCount: 2,
    partnerThreadId: 'thread-dimas',
  },
  {
    id: 'wtb-5',
    authorName: 'Rina Novita',
    initials: 'RN',
    avatarBg: '#B26A00',
    facultyAndTime: 'FBS · 2 hari lalu',
    wantType: 'Mau beli',
    category: 'Elektronik',
    title: 'Kamera analog bekas',
    budgetOrNote: 'Budget maks. Rp300.000 · COD di FBS',
    offersCount: 1,
    partnerThreadId: 'thread-nadia',
  },
  {
    id: 'wtb-6',
    authorName: 'Arif Fauzan',
    initials: 'AF',
    avatarBg: '#1E9488',
    facultyAndTime: 'FH · 2 hari lalu',
    wantType: 'Mau sewa',
    category: 'Elektronik',
    title: 'Proyektor mini untuk presentasi',
    budgetOrNote: 'Maks. Rp50rb/hari · 1 hari',
    offersCount: 0,
    partnerThreadId: 'thread-bayu',
  },
]

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'trx-1',
    code: '#TRX-0934',
    role: 'Pembelian',
    productId: 'kalkulator-casio-991',
    title: 'Kalkulator Casio fx-991ID',
    subtitle: 'Rp170.000 · dari Nadia Putri',
    scheduleOrNote: 'Sel, 11 Nov · 13.00 · Perpus Pusat',
    status: 'COD dijadwalkan',
    stepIndex: 2,
    codBannerText: 'Sel, 11 Nov · 13.00 · Perpustakaan Pusat UNNES',
    paymentMethod: 'Tunai saat bertemu',
    originalPrice: 'Rp180.000',
    finalPrice: 'Rp170.000',
    partnerThreadId: 'thread-nadia',
  },
  {
    id: 'trx-2',
    code: '#TRX-0921',
    role: 'Pembelian',
    productId: 'sepeda-lipat',
    title: 'Sepeda Lipat 16"',
    subtitle: 'Sewa · Rp20rb × 7 hari',
    scheduleOrNote: 'Kembalikan sebelum 14 Nov',
    status: 'Sedang disewa',
    stepIndex: 2,
    codBannerText: 'Pengembalian: Jum, 14 Nov · 16.00 · Gerbang Utama UNNES',
    paymentMethod: 'Transfer / QRIS',
    originalPrice: 'Rp140.000',
    finalPrice: 'Rp140.000',
    partnerThreadId: 'thread-sela',
  },
  {
    id: 'trx-3',
    code: '#TRX-0898',
    role: 'Pembelian',
    productId: 'buku-kalkulus',
    title: 'Buku Kalkulus Purcell',
    subtitle: 'Donasi · Gratis',
    scheduleOrNote: 'Selesai 6 Nov · Gedung D7 FMIPA',
    status: 'Selesai',
    stepIndex: 3,
    codBannerText: 'Selesai COD · 6 Nov · Gedung D7 FMIPA',
    paymentMethod: 'Donasi Kampus (Rp0)',
    originalPrice: 'Gratis',
    finalPrice: 'Gratis',
    ecoPointsEarned: 100,
    reviewed: false,
    partnerThreadId: 'thread-nadia',
  },
  {
    id: 'trx-4',
    code: '#TRX-0940',
    role: 'Pembelian',
    productId: 'headphone-bt',
    title: 'Headphone BT',
    subtitle: 'Rp120.000 · dari Bayu S.',
    scheduleOrNote: 'Diajukan hari ini 09.12',
    status: 'Menunggu konfirmasi',
    stepIndex: 0,
    codBannerText: 'Menunggu persetujuan jadwal COD dari Bayu Saputra',
    paymentMethod: 'Tunai saat bertemu',
    originalPrice: 'Rp120.000',
    finalPrice: 'Rp120.000',
    partnerThreadId: 'thread-bayu',
  },
  {
    id: 'trx-5',
    code: '#TRX-0872',
    role: 'Pembelian',
    productId: 'lampu-belajar-led',
    title: 'Lampu Belajar LED',
    subtitle: 'Rp45.000 · dari Dimas A.',
    scheduleOrNote: 'Dibatalkan oleh penjual',
    status: 'Dibatalkan',
    stepIndex: 0,
    codBannerText: 'Transaksi dibatalkan · Barang sudah terjual lebih dulu',
    paymentMethod: 'Tunai saat bertemu',
    originalPrice: 'Rp45.000',
    finalPrice: 'Rp0',
    partnerThreadId: 'thread-dimas',
  },
  {
    id: 'trx-6',
    code: '#TRX-0915',
    role: 'Penjualan',
    productId: 'sepeda-lipat',
    title: 'Sepeda Lipat Element 16 inci',
    subtitle: 'Sewa · Rp20rb × 3 hari · ke Sela A.',
    scheduleOrNote: 'COD selesai · +20 Eco-Points',
    status: 'Selesai',
    stepIndex: 3,
    codBannerText: 'Selesai disewakan · Gerbang Utama UNNES',
    paymentMethod: 'QRIS',
    originalPrice: 'Rp60.000',
    finalPrice: 'Rp60.000',
    ecoPointsEarned: 20,
    reviewed: true,
    partnerThreadId: 'thread-sela',
  },
]

export const UMKM_VOUCHERS: UmkmVoucher[] = [
  {
    id: 'v-kopi-sekaran',
    umkmId: 'umkm-1',
    name: 'Kopi Sekaran',
    offer: 'Diskon 20% semua minuman',
    pointsCost: 300,
    theme: 'orange',
    iconAsset: `${assetPathPrefix}/446be.svg`,
  },
  {
    id: 'v-fotokopi-berkah',
    umkmId: 'umkm-2',
    name: 'Fotokopi Berkah',
    offer: 'Print 20 lembar',
    pointsCost: 200,
    theme: 'blue',
    iconAsset: `${assetPathPrefix}/b938c.svg`,
  },
  {
    id: 'v-warung-bu-sri',
    umkmId: 'umkm-4',
    name: 'Warung Bu Sri',
    offer: 'Gratis es teh',
    pointsCost: 80,
    theme: 'pink',
    iconAsset: `${assetPathPrefix}/9789b.svg`,
  },
  {
    id: 'v-laundry-banaran',
    umkmId: 'umkm-3',
    name: 'Laundry Kilat Banaran',
    offer: 'Diskon 15% cuci kering',
    pointsCost: 250,
    theme: 'teal',
    iconAsset: `${assetPathPrefix}/03425.svg`,
  },
]

export const UMKM_PARTNERS: UmkmPartner[] = [
  {
    id: 'umkm-1',
    name: 'Kopi Sekaran',
    category: 'Minuman',
    subtitle: 'Minuman · 350 m dari FMIPA',
    distanceMeters: 350,
    ecoPartner: true,
    hasPromo: true,
    promoDesc: 'Diskon 20% semua minuman (300 poin)',
    pointsRequired: 300,
    theme: 'orange',
    iconAsset: `${assetPathPrefix}/6dd0e.svg`,
  },
  {
    id: 'umkm-2',
    name: 'Fotokopi Berkah Jaya',
    category: 'Print & ATK',
    subtitle: 'Print & jilid · 200 m dari FT',
    distanceMeters: 200,
    ecoPartner: true,
    hasPromo: true,
    promoDesc: 'Gratis print 20 lembar HVS (200 poin)',
    pointsRequired: 200,
    theme: 'blue',
    iconAsset: `${assetPathPrefix}/927b5.svg`,
  },
  {
    id: 'umkm-3',
    name: 'Laundry Kilat Banaran',
    category: 'Laundry',
    subtitle: 'Laundry · 600 m',
    distanceMeters: 600,
    ecoPartner: true,
    hasPromo: false,
    promoDesc: 'Diskon 15% cuci kering lipat (250 poin)',
    pointsRequired: 250,
    theme: 'teal',
    iconAsset: `${assetPathPrefix}/c247c.svg`,
  },
  {
    id: 'umkm-4',
    name: 'Warung Bu Sri',
    category: 'Makanan',
    subtitle: 'Makanan · 150 m dari FIK',
    distanceMeters: 150,
    ecoPartner: true,
    hasPromo: true,
    promoDesc: 'Gratis es teh manis jumbo (80 poin)',
    pointsRequired: 80,
    theme: 'pink',
    iconAsset: `${assetPathPrefix}/5a83b.svg`,
  },
  {
    id: 'umkm-5',
    name: 'Ayam Geprek Sekaran',
    category: 'Makanan',
    subtitle: 'Makanan · 400 m',
    distanceMeters: 400,
    ecoPartner: false,
    hasPromo: false,
    promoDesc: 'Paket hemat mahasiswa bebas ambil nasi',
    theme: 'orange',
    iconAsset: `${assetPathPrefix}/5a83b.svg`,
  },
  {
    id: 'umkm-6',
    name: 'Print Kilat 24 Jam',
    category: 'Print & ATK',
    subtitle: 'Print & ATK · 500 m',
    distanceMeters: 500,
    ecoPartner: true,
    hasPromo: false,
    promoDesc: 'Potongan jilid hard cover skripsi',
    pointsRequired: 150,
    theme: 'purple',
    iconAsset: `${assetPathPrefix}/c7ad6.svg`,
  },
]

export const INITIAL_POINT_HISTORY: PointHistoryEntry[] = [
  {
    id: 'ph-1',
    title: 'Donasi Buku Kalkulus',
    date: '6 Nov',
    delta: 100,
  },
  {
    id: 'ph-2',
    title: 'Voucher Kopi Sekaran',
    date: '2 Nov',
    delta: -300,
  },
]
