import React from 'react'
import {
  assetPathPrefix,
  CARD_THEME_GRADIENTS,
  ProductItem,
  TYPE_BADGE_STYLES,
} from '../data/lulusinData'

interface ProductCardProps {
  product: ProductItem
  onSelect?: (product: ProductItem) => void
  isWishlisted?: boolean
  onToggleWishlist?: (productId: string) => void
  forceHighlight?: boolean
  useShortTitle?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isWishlisted = false,
  onToggleWishlist,
  forceHighlight,
  useShortTitle = true,
}) => {
  const isHighlighted = forceHighlight ?? Boolean(product.highlighted)
  const badgeStyle = TYPE_BADGE_STYLES[product.type]
  const displayTitle =
    useShortTitle && product.shortTitle ? product.shortTitle : product.title

  return (
    <div
      onClick={() => onSelect?.(product)}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect(product)
        }
      }}
      className={`group rounded-[16px] bg-[#FFFDF8] p-[8px] pb-[12px] transition-all duration-200 ${
        onSelect ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${
        isHighlighted
          ? 'border-[1.5px] border-[#F5A314] shadow-[0_4px_16px_rgba(245,163,20,0.12)]'
          : 'border border-[#EBDDC2] shadow-[0_4px_14px_rgba(110,86,40,0.05)] hover:border-[#d6c29d]'
      }`}
    >
      {/* Colored Gradient Thumbnail */}
      <div
        className={`relative h-[130px] rounded-[12px] overflow-hidden flex items-center justify-center ${
          CARD_THEME_GRADIENTS[product.theme]
        }`}
      >
        {/* Top glossy sheen from Figma card design */}
        <div className="absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-white/18 to-transparent pointer-events-none" />

        {/* Disorot Badge */}
        {isHighlighted && (
          <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 h-[22px] rounded-full bg-[#F5A314] shadow-2xs">
            <img
              src={`${assetPathPrefix}/33b01.svg`}
              alt=""
              className="block shrink-0"
            />
            <span className="font-['Poppins:Bold'] text-[10.5px] text-[#1f1f1f] leading-none">
              Disorot
            </span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleWishlist?.(product.id)
          }}
          aria-label="Simpan ke favorit"
          className={`absolute top-2.5 right-2.5 z-10 size-[26px] rounded-full flex items-center justify-center transition-transform active:scale-90 ${
            isWishlisted
              ? 'bg-[#FFE1EB] ring-1 ring-[#D23A70]/30'
              : 'bg-white/95 hover:bg-white'
          }`}
        >
          <img
            src={`${assetPathPrefix}/5d36a.svg`}
            alt=""
            className="block shrink-0"
          />
        </button>

        {/* Product SVG Illustration at exact natural root dimensions */}
        {product.photos?.[0] ? (
          <img
            src={product.photos[0]}
            alt={product.title}
            className="absolute inset-0 z-0 size-full object-cover select-none"
          />
        ) : (
          <img
            src={product.iconAsset}
            alt={product.title}
            className="relative z-10 block select-none transition-transform duration-200 group-hover:scale-105"
          />
        )}
      </div>

      {/* Card Details */}
      <div className="px-1.5 pt-2.5">
        <span
          className={`inline-flex items-center px-2.5 py-[2px] rounded-full font-['Poppins:Bold'] text-[11px] leading-[1.35] ${badgeStyle.bg} ${badgeStyle.text}`}
        >
          {product.type}
        </span>

        <h3 className="mt-1.5 font-['Poppins:Bold'] text-[13.5px] text-[#1f1f1f] leading-snug truncate">
          {displayTitle}
        </h3>

        <p className="mt-0.5 font-['Poppins:Bold'] text-[15px] text-[#17683a] leading-snug">
          {product.priceLabel}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <img
              src={`${assetPathPrefix}/019e6.svg`}
              alt=""
              className="block shrink-0"
            />
            <span className="font-['Poppins:Regular'] text-[10.5px] text-[#6e6a63] truncate">
              {product.locationShort}
            </span>
          </div>
          <span className="px-2 py-[2px] rounded-full bg-[#E2F1E5] font-['Poppins:Bold'] text-[9px] text-[#17683a] shrink-0">
            COD
          </span>
        </div>
      </div>
    </div>
  )
}
