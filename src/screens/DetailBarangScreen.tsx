import React, { useState } from 'react'
import {
  assetPathPrefix,
  CARD_THEME_GRADIENTS,
  ProductItem,
  ScreenId,
  TYPE_BADGE_STYLES,
} from '../data/lulusinData'
import { ProductCard } from '../components/ProductCard'

interface DetailBarangScreenProps {
  product: ProductItem
  allProducts: ProductItem[]
  wishlistIds: string[]
  onToggleWishlist: (id: string) => void
  onSelectProduct: (product: ProductItem) => void
  onNavigate: (screen: ScreenId) => void
  onOpenChatWithSeller: (product: ProductItem) => void
  onOpenAturCod: (product: ProductItem) => void
  onShowToast: (msg: string) => void
}

export const DetailBarangScreen: React.FC<DetailBarangScreenProps> = ({
  product,
  allProducts,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onNavigate,
  onOpenChatWithSeller,
  onOpenAturCod,
  onShowToast,
}) => {
  const [activeSlide, setActiveSlide] = useState<number>(0)
  const isWishlisted = wishlistIds.includes(product.id)
  const typeStyle = TYPE_BADGE_STYLES[product.type]
  const photoList = product.photos ?? []
  const hasPhotos = photoList.length > 0

  const similarProducts = allProducts
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const aSame = a.category === product.category ? 0 : 1
      const bSame = b.category === product.category ? 0 : 1
      return aSame - bSame
    })
    .slice(0, 5)

  const ctaLabel =
    product.type === 'Sewa'
      ? 'Sewa · Atur COD'
      : product.type === 'Tukar'
        ? 'Tukar · Atur COD'
        : product.type === 'Donasi'
          ? 'Ambil · Atur COD'
          : 'Beli · Atur COD'

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 md:pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center flex-wrap gap-1.5 text-[12.5px]">
        <button
          type="button"
          onClick={() => onNavigate('beranda')}
          className="font-['Poppins:Bold'] text-[#17683a] hover:underline"
        >
          Beranda
        </button>
        <span className="font-['Poppins:Regular'] text-[#6e6a63]">
          › {product.category} › {product.title}
        </span>
      </nav>

      {/* Main Two-Column Product Section */}
      <section className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9">
        {/* Left Gallery Column */}
        <div className="lg:col-span-6">
          <div
            className={`relative h-[320px] sm:h-[420px] rounded-[24px] overflow-hidden flex items-center justify-center ${
              CARD_THEME_GRADIENTS[product.theme]
            }`}
          >
            {/* Decorative translucent circles matching 30:955 & 30:956 */}
            <div className="pointer-events-none absolute -top-20 -right-12 size-[320px] rounded-full bg-black/[0.06]" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 size-[220px] rounded-full bg-white/[0.10]" />

            {/* Top-right Wishlist & Share Buttons */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                aria-label="Simpan barang"
                className={`size-[40px] rounded-full flex items-center justify-center shadow-xs transition-transform active:scale-90 ${
                  isWishlisted
                    ? 'bg-[#FFE1EB] ring-2 ring-[#D23A70]/40'
                    : 'bg-white/95 hover:bg-white'
                }`}
              >
                <img
                  src={`${assetPathPrefix}/326e0.svg`}
                  alt=""
                  className="block shrink-0"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  onShowToast(`Tautan "${product.title}" disalin!`)
                }
                aria-label="Bagikan barang"
                className="size-[40px] rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-90"
              >
                <img
                  src={`${assetPathPrefix}/5b071.svg`}
                  alt=""
                  className="block shrink-0"
                />
              </button>
            </div>

            {/* Gambar utama: foto asli penjual bila ada, jika tidak ilustrasi */}
            {hasPhotos ? (
              <img
                src={photoList[Math.min(activeSlide, photoList.length - 1)]}
                alt={product.title}
                className="absolute inset-0 z-0 size-full object-cover select-none"
              />
            ) : (
              <img
                src={product.detailLargeIconAsset ?? product.iconAsset}
                alt={product.title}
                className={`relative z-10 block select-none transition-transform duration-300 ${
                  product.detailLargeIconAsset ? '' : 'scale-[2.1]'
                } ${
                  activeSlide === 1
                    ? '-rotate-3'
                    : activeSlide === 2
                      ? 'rotate-3'
                      : activeSlide === 3
                        ? 'scale-105'
                        : ''
                }`}
              />
            )}

            {/* Slide Counter Pill */}
            <span className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full bg-[#1F1F1F]/65 font-['Poppins:Bold'] text-[11px] text-white">
              {hasPhotos
                ? `${Math.min(activeSlide, photoList.length - 1) + 1}/${photoList.length}`
                : `${activeSlide + 1}/4`}
            </span>
          </div>

          {/* 4 Thumbnails Row */}
          <div className="mt-3.5 grid grid-cols-4 gap-3 sm:gap-3.5">
            {(hasPhotos ? photoList.map((_, i) => i) : [0, 1, 2, 3]).map((idx) => {
              const selected = activeSlide === idx
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-[78px] sm:h-[94px] rounded-[14px] overflow-hidden flex items-center justify-center transition-all ${
                    CARD_THEME_GRADIENTS[product.theme]
                  } ${
                    selected
                      ? 'ring-2 ring-[#0F4F2B] opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  {hasPhotos ? (
                    <img
                      src={photoList[idx]}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <img
                      src={
                        product.detailLargeIconAsset
                          ? `${assetPathPrefix}/b6630.svg`
                          : product.iconAsset
                      }
                      alt=""
                      className={`block ${product.detailLargeIconAsset ? '' : 'scale-75'}`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Details Column */}
        <div className="lg:col-span-6 flex flex-col">
          {/* Top Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full font-['Poppins:Bold'] text-[12px] ${typeStyle.bg} ${typeStyle.text}`}
            >
              {product.type}
            </span>
            <span className="px-3.5 py-1 rounded-full bg-[#F2E6CC] font-['Poppins:Bold'] text-[12px] text-[#1f1f1f]">
              {product.condition}
            </span>
            <span className="px-3.5 py-1 rounded-full bg-[#F2E6CC] font-['Poppins:Bold'] text-[12px] text-[#1f1f1f]">
              {product.category}
            </span>
          </div>

          <h1 className="mt-3.5 font-['Poppins:Bold'] text-[24px] sm:text-[28px] text-[#1f1f1f] leading-snug">
            {product.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="font-['Poppins:Bold'] text-[28px] sm:text-[32px] text-[#17683a] leading-none">
              {product.priceLabel}
            </span>
            {product.negotiable && (
              <span className="px-3 py-1 rounded-full bg-[#FFF1D6] font-['Poppins:Bold'] text-[11.5px] text-[#b26a00]">
                Bisa nego
              </span>
            )}
            {product.depositLabel && (
              <span className="px-3 py-1 rounded-full bg-[#DCE8FF] font-['Poppins:Bold'] text-[11.5px] text-[#2f5fd6]">
                Deposit {product.depositLabel}
              </span>
            )}
          </div>

          {/* Views & Posted Time */}
          <div className="mt-3 flex flex-wrap items-center gap-5 text-[12.5px] font-['Poppins:Regular'] text-[#6e6a63]">
            <span className="inline-flex items-center gap-1.5">
              <img
                src={`${assetPathPrefix}/dafbd.svg`}
                alt=""
                className="block shrink-0"
              />
              {product.views} dilihat
            </span>
            <span className="inline-flex items-center gap-1.5">
              <img
                src={`${assetPathPrefix}/436cf.svg`}
                alt=""
                className="block shrink-0"
              />
              {product.postedAgo}
            </span>
          </div>

          <div className="my-5 border-t border-[#EBDDC2]" />

          {/* Description */}
          <div>
            <h2 className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f]">
              Deskripsi
            </h2>
            <p className="mt-2 font-['Poppins:Regular'] text-[13.5px] text-[#1f1f1f] leading-[1.65]">
              {product.description}
            </p>
          </div>

          {/* COD Location Highlight Banner */}
          <div className="mt-5 rounded-[14px] bg-[#E2F1E5] px-4 py-3.5 flex items-center gap-3">
            <img
              src={`${assetPathPrefix}/8113f.svg`}
              alt=""
              className="block shrink-0"
            />
            <span className="font-['Poppins:Bold'] text-[13px] text-[#0f4f2b]">
              COD: {product.codSpot}
            </span>
          </div>

          {/* Seller Verified Card */}
          <button
            type="button"
            onClick={() => onOpenChatWithSeller(product)}
            className="mt-4 w-full rounded-[16px] bg-white border border-[#EBDDC2] hover:border-[#17683a]/50 p-4 flex items-center justify-between gap-3 text-left transition-colors shadow-[0_4px_14px_rgba(110,86,40,0.04)]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                style={{ backgroundColor: product.seller.avatarBg }}
                className="size-[48px] rounded-full flex items-center justify-center font-['Poppins:Bold'] text-[18px] text-white shrink-0"
              >
                {product.seller.initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f]">
                    {product.seller.name}
                  </span>
                  {product.seller.verifiedKtm && (
                    <span className="inline-flex items-center gap-1 font-['Poppins:Bold'] text-[11px] text-[#17683a]">
                      <img
                        src={`${assetPathPrefix}/9e091.svg`}
                        alt=""
                        className="block shrink-0"
                      />
                      Terverifikasi KTM
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5 font-['Poppins:Regular'] text-[12px] text-[#6e6a63] truncate">
                  <img
                    src={`${assetPathPrefix}/8f305.svg`}
                    alt=""
                    className="block shrink-0"
                  />
                  <span>
                    {product.seller.rating} · {product.seller.transactionsCount}{' '}
                    transaksi · {product.seller.faculty}
                  </span>
                </div>
              </div>
            </div>

            <img
              src={`${assetPathPrefix}/499ec.svg`}
              alt=""
              className="block shrink-0"
            />
          </button>

          {/* Primary CTA Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              type="button"
              onClick={() => onOpenChatWithSeller(product)}
              className="sm:w-[200px] h-[54px] rounded-[14px] border-[1.5px] border-[#17683A] bg-white hover:bg-[#E2F1E5]/50 transition-colors flex items-center justify-center gap-2.5"
            >
              <img
                src={`${assetPathPrefix}/1a78a.svg`}
                alt=""
                className="block shrink-0"
              />
              <span className="font-['Poppins:Bold'] text-[15px] text-[#17683a]">
                Chat
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAturCod(product)}
              className="flex-1 h-[54px] rounded-[14px] bg-[#17683A] hover:bg-[#12542e] transition-colors font-['Poppins:Bold'] text-[15px] text-white"
            >
              {ctaLabel}
            </button>
          </div>

          {/* Safety Footer Line */}
          <div className="mt-4 flex items-center gap-2 text-[12px] font-['Poppins:Regular'] text-[#6e6a63]">
            <img
              src={`${assetPathPrefix}/49977.svg`}
              alt=""
              className="block shrink-0"
            />
            <span>
              Transaksi aman: ketemu di titik COD kampus, cek barang sebelum
              bayar.
            </span>
          </div>
        </div>
      </section>

      {/* Similar Items Section */}
      <section className="mt-12">
        <h2 className="font-['Poppins:Bold'] text-[20px] text-[#1f1f1f] mb-4">
          Barang serupa
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {similarProducts.map((sim) => (
            <ProductCard
              key={sim.id}
              product={sim}
              onSelect={onSelectProduct}
              isWishlisted={wishlistIds.includes(sim.id)}
              onToggleWishlist={onToggleWishlist}
              useShortTitle={false}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
