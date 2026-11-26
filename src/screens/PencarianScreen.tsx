import React, { useState, useMemo } from 'react'
import {
  assetPathPrefix,
  CategoryType,
  ConditionType,
  ProductItem,
  TransactionType,
} from '../data/lulusinData'
import { ProductCard } from '../components/ProductCard'

interface PencarianScreenProps {
  products: ProductItem[]
  searchQuery: string
  initialTypeFilter?: TransactionType | 'Semua'
  wishlistIds: string[]
  onToggleWishlist: (id: string) => void
  onSelectProduct: (product: ProductItem) => void
}

export const PencarianScreen: React.FC<PencarianScreenProps> = ({
  products,
  searchQuery,
  initialTypeFilter = 'Semua',
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>(
    initialTypeFilter !== 'Semua' ? [initialTypeFilter] : ['Jual', 'Sewa'],
  )
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([
    'Elektronik',
  ])
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(450000)
  const [selectedConditions, setSelectedConditions] = useState<ConditionType[]>(
    [],
  )
  const [selectedLocations, setSelectedLocations] = useState<
    ('Dalam kampus' | '< 1 km' | 'Sekaran')[]
  >([])
  const [sortBy, setSortBy] = useState<
    'Terdekat' | 'Termurah' | 'Termahal' | 'Terpopuler'
  >('Terdekat')
  const [page, setPage] = useState<number>(1)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const toggleItem = <T,>(arr: T[], item: T, setFn: (next: T[]) => void) => {
    setPage(1)
    if (arr.includes(item)) {
      setFn(arr.filter((x) => x !== item))
    } else {
      setFn([...arr, item])
    }
  }

  const handleReset = () => {
    setSelectedTypes([])
    setSelectedCategories([])
    setMinPrice(0)
    setMaxPrice(500000)
    setSelectedConditions([])
    setSelectedLocations([])
    setPage(1)
  }

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const result = products.filter((item) => {
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.category.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q)
      ) {
        return false
      }
      if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) {
        return false
      }
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(item.category)
      ) {
        return false
      }
      if (item.numericPrice < minPrice || item.numericPrice > maxPrice) {
        return false
      }
      if (
        selectedConditions.length > 0 &&
        !selectedConditions.includes(item.condition)
      ) {
        return false
      }
      if (
        selectedLocations.length > 0 &&
        !selectedLocations.includes(item.areaGroup)
      ) {
        return false
      }
      return true
    })

    return [...result].sort((a, b) => {
      if (sortBy === 'Terdekat') return a.distanceMeters - b.distanceMeters
      if (sortBy === 'Termurah') return a.numericPrice - b.numericPrice
      if (sortBy === 'Termahal') return b.numericPrice - a.numericPrice
      return b.views - a.views
    })
  }, [
    products,
    searchQuery,
    selectedTypes,
    selectedCategories,
    minPrice,
    maxPrice,
    selectedConditions,
    selectedLocations,
    sortBy,
  ])

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedItems = filteredProducts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  const formatRupiah = (val: number) =>
    `Rp ${val.toLocaleString('id-ID')}`

  const filterContent = (
    <div className="rounded-[20px] bg-white border border-[#EBDDC2] shadow-[0_4px_18px_rgba(110,86,40,0.05)] p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-['Poppins:Bold'] text-[18px] text-[#1f1f1f]">
          Filter
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="font-['Poppins:Bold'] text-[13px] text-[#17683a] hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Jenis Transaksi */}
      <div>
        <p className="font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-2.5">
          Jenis transaksi
        </p>
        <div className="flex flex-wrap gap-2">
          {(['Jual', 'Sewa', 'Tukar', 'Donasi'] as TransactionType[]).map(
            (t) => {
              const active = selectedTypes.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleItem(selectedTypes, t, setSelectedTypes)}
                  className={`h-[30px] px-3.5 rounded-full font-['Poppins:Bold'] text-[12px] transition-colors ${
                    active
                      ? 'bg-[#E2F1E5] border-[1.5px] border-[#17683A] text-[#17683a]'
                      : 'bg-white border border-[#EBDDC2] text-[#1f1f1f] hover:bg-[#FDF4E3]'
                  }`}
                >
                  {t}
                </button>
              )
            },
          )}
        </div>
      </div>

      {/* Kategori */}
      <div>
        <p className="font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-2.5">
          Kategori
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              'Elektronik',
              'Buku & Modul',
              'Alat Praktikum',
              'Fashion',
              'Perabot Kos',
              'Kendaraan & Olahraga',
            ] as CategoryType[]
          ).map((cat) => {
            const active = selectedCategories.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  toggleItem(selectedCategories, cat, setSelectedCategories)
                }
                className={`h-[30px] px-3.5 rounded-full font-['Poppins:Bold'] text-[12px] transition-colors ${
                  active
                    ? 'bg-[#E2F1E5] border-[1.5px] border-[#17683A] text-[#17683a]'
                    : 'bg-white border border-[#EBDDC2] text-[#1f1f1f] hover:bg-[#FDF4E3]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Rentang Harga */}
      <div>
        <p className="font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-3">
          Rentang harga
        </p>
        <div className="space-y-2.5">
          <input
            type="range"
            min={0}
            max={500000}
            step={10000}
            value={maxPrice}
            onChange={(e) => {
              const next = Number(e.target.value)
              setMaxPrice(Math.max(next, minPrice))
              setPage(1)
            }}
            className="w-full accent-[#17683A] h-1.5 bg-[#F2E6CC] rounded-lg"
          />
          <div className="flex items-center justify-between font-['Poppins:Bold'] text-[12.5px] text-[#1f1f1f]">
            <span>{formatRupiah(minPrice)}</span>
            <span>{formatRupiah(maxPrice)}</span>
          </div>
        </div>
      </div>

      {/* Kondisi */}
      <div>
        <p className="font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-2.5">
          Kondisi
        </p>
        <div className="flex flex-wrap gap-2">
          {(['Baru', 'Seperti baru', 'Bekas baik'] as ConditionType[]).map(
            (cond) => {
              const active = selectedConditions.includes(cond)
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() =>
                    toggleItem(
                      selectedConditions,
                      cond,
                      setSelectedConditions,
                    )
                  }
                  className={`h-[30px] px-3.5 rounded-full font-['Poppins:Bold'] text-[12px] transition-colors ${
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

      {/* Lokasi */}
      <div>
        <p className="font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-2.5">
          Lokasi
        </p>
        <div className="flex flex-wrap gap-2">
          {(['Dalam kampus', '< 1 km', 'Sekaran'] as const).map((loc) => {
            const active = selectedLocations.includes(loc)
            return (
              <button
                key={loc}
                type="button"
                onClick={() =>
                  toggleItem(selectedLocations, loc, setSelectedLocations)
                }
                className={`h-[30px] px-3.5 rounded-full font-['Poppins:Bold'] text-[12px] transition-colors ${
                  active
                    ? 'bg-[#E2F1E5] border-[1.5px] border-[#17683A] text-[#17683a]'
                    : 'bg-white border border-[#EBDDC2] text-[#1f1f1f] hover:bg-[#FDF4E3]'
                }`}
              >
                {loc}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMobileFilterOpen(false)}
        className="w-full h-[46px] rounded-[12px] bg-[#17683A] hover:bg-[#12542e] transition-colors font-['Poppins:Bold'] text-[13.5px] text-white"
      >
        Tampilkan {filteredProducts.length} barang
      </button>
    </div>
  )

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
      {/* Mobile filter toggle button */}
      <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setMobileFilterOpen((o) => !o)}
          className="h-[38px] px-4 rounded-full bg-white border border-[#EBDDC2] font-['Poppins:Bold'] text-[13px] text-[#17683a]"
        >
          {mobileFilterOpen ? 'Tutup Filter' : 'Filter Barang'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Filter Panel */}
        <aside
          className={`w-full lg:w-[280px] shrink-0 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {filterContent}
        </aside>

        {/* Right Search Results */}
        <section className="flex-1 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h1 className="font-['Poppins:Bold'] text-[20px] text-[#1f1f1f]">
              {filteredProducts.length} hasil
              {searchQuery.trim()
                ? ` untuk “${searchQuery.trim()}”`
                : ' ditemukan'}
            </h1>

            <div className="relative inline-flex items-center self-start sm:self-auto">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | 'Terdekat'
                      | 'Termurah'
                      | 'Termahal'
                      | 'Terpopuler',
                  )
                }
                className="appearance-none h-[38px] pl-4 pr-9 rounded-full bg-white border border-[#EBDDC2] font-['Poppins:Bold'] text-[12.5px] text-[#1f1f1f] outline-none focus:border-[#17683a]"
              >
                <option value="Terdekat">Urutkan: Terdekat</option>
                <option value="Termurah">Urutkan: Termurah</option>
                <option value="Termahal">Urutkan: Termahal</option>
                <option value="Terpopuler">Urutkan: Terpopuler</option>
              </select>
              <img
                src={`${assetPathPrefix}/e65d3.svg`}
                alt=""
                className="pointer-events-none absolute right-3.5 block"
              />
            </div>
          </div>

          {pagedItems.length === 0 ? (
            <div className="rounded-[20px] bg-white border border-[#EBDDC2] p-10 text-center">
              <p className="font-['Poppins:Bold'] text-[16px] text-[#1f1f1f]">
                Belum ada barang yang cocok dengan filter ini
              </p>
              <p className="mt-1 font-['Poppins:Regular'] text-[13px] text-[#6e6a63]">
                Coba reset filter atau gunakan kata kunci lain.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 h-[40px] px-5 rounded-full bg-[#17683A] font-['Poppins:Bold'] text-[13px] text-white"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {pagedItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onSelect={onSelectProduct}
                    isWishlisted={wishlistIds.includes(item.id)}
                    onToggleWishlist={onToggleWishlist}
                    useShortTitle={false}
                  />
                ))}
              </div>

              {/* Pagination Bar (matches 30:911-30:920) */}
              <div className="mt-8 flex flex-col items-center gap-2.5">
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.max(totalPages, 3) }, (_, i) => i + 1).map(
                    (num) => {
                      const isCurrent = safePage === num
                      const isDisabled = num > totalPages
                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setPage(num)}
                          className={`size-[36px] rounded-[10px] font-['Poppins:Bold'] text-[13px] flex items-center justify-center transition-colors ${
                            isCurrent
                              ? 'bg-[#17683A] text-white'
                              : isDisabled
                                ? 'bg-white/60 border border-[#EBDDC2] text-[#a39c8f] cursor-not-allowed'
                                : 'bg-white border border-[#EBDDC2] text-[#1f1f1f] hover:bg-[#FDF4E3]'
                          }`}
                        >
                          {num}
                        </button>
                      )
                    },
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setPage((prev) => (prev < totalPages ? prev + 1 : 1))
                    }
                    className="size-[36px] rounded-[10px] bg-white border border-[#EBDDC2] hover:bg-[#FDF4E3] flex items-center justify-center"
                    aria-label="Halaman berikutnya"
                  >
                    <img
                      src={`${assetPathPrefix}/45499.svg`}
                      alt=""
                      className="block"
                    />
                  </button>
                </div>
                <p className="font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
                  Halaman {safePage} dari {Math.max(totalPages, 1)}
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
