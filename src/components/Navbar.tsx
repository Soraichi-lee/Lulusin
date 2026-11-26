import React, { useState, useRef, useEffect } from 'react'
import { assetPathPrefix, ScreenId } from '../data/lulusinData'

interface NavbarProps {
  currentScreen: ScreenId
  onNavigate: (screen: ScreenId) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onSearchSubmit: (q: string) => void
  ecoPoints: number
  unreadChatCount: number
  /** Akun asli (mode backend). Bila kosong, memakai profil contoh. */
  account?: {
    name: string
    facultyProdi: string
    ktmStatus: 'none' | 'pending' | 'verified' | 'rejected'
  }
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  ecoPoints,
  unreadChatCount,
  account,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formattedPoints = ecoPoints.toLocaleString('id-ID')

  const navItems: { id: ScreenId; label: string }[] = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'papan-wtb', label: 'Papan WTB' },
    { id: 'umkm-kampus', label: 'UMKM Kampus' },
    { id: 'transaksi', label: 'Transaksi' },
  ]

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchSubmit(searchQuery)
  }

  return (
    <>
      {/* Desktop & Tablet Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EBDDC2]">
        <div className="max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-10 h-[72px] flex items-center justify-between gap-3 lg:gap-6">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => onNavigate('beranda')}
            className="flex items-center gap-2.5 shrink-0 text-left group"
          >
            <div className="size-[40px] rounded-[10px] overflow-hidden shrink-0">
              <img
                src={`${assetPathPrefix}/317d2.png`}
                alt="Lulusin"
                className="size-full object-cover"
              />
            </div>
            <span className="font-['Poppins:Bold'] text-[20px] text-[#0f4f2b] tracking-tight">
              Lulusin
            </span>
          </button>

          {/* Search Input */}
          <form
            onSubmit={handleFormSubmit}
            className="flex-1 max-w-[400px] hidden sm:flex items-center h-[44px] rounded-full bg-[#FDF4E3] border border-[#EBDDC2] px-4 gap-2.5 focus-within:border-[#17683a] transition-colors"
          >
            <img
              src={`${assetPathPrefix}/aa43c.svg`}
              alt=""
              className="block shrink-0"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                if (currentScreen !== 'pencarian' && searchQuery.trim()) {
                  onNavigate('pencarian')
                }
              }}
              placeholder="Cari kalkulator, jas lab, buku…"
              className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[13.5px] text-[#1f1f1f] placeholder:text-[#a39c8f]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-[11px] font-['Poppins:Bold'] text-[#a39c8f] hover:text-[#1f1f1f]"
              >
                ✕
              </button>
            )}
          </form>

          {/* Center Navigation Tabs */}
          <nav className="hidden xl:flex items-center h-full gap-7">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`relative h-full flex items-center text-[14px] whitespace-nowrap transition-colors ${
                    isActive
                      ? "font-['Poppins:Bold'] text-[#17683a]"
                      : "font-['Poppins:Regular'] text-[#6e6a63] hover:text-[#17683a]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-[3.5px] bg-[#17683a] rounded-t-full" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* + Pasang Button */}
            <button
              type="button"
              onClick={() => onNavigate('pasang-barang')}
              className="hidden md:inline-flex items-center gap-2 h-[40px] px-4 rounded-full bg-[#F5A314] hover:bg-[#e5960d] transition-colors shadow-2xs"
            >
              <img
                src={`${assetPathPrefix}/8fe30.svg`}
                alt=""
                className="block shrink-0"
              />
              <span className="font-['Poppins:Bold'] text-[13.5px] text-[#1f1f1f]">
                Pasang
              </span>
            </button>

            {/* Eco-Points Pill */}
            <button
              type="button"
              onClick={() => onNavigate('eco-points')}
              className="inline-flex items-center gap-1.5 h-[32px] px-3 rounded-full bg-[#17683A] hover:bg-[#12542e] transition-colors"
              title="Saldo Eco-Points kamu"
            >
              <img
                src={`${assetPathPrefix}/6e331.svg`}
                alt=""
                className="block shrink-0"
              />
              <span className="font-['Poppins:Bold'] text-[13px] text-white">
                {formattedPoints}
              </span>
            </button>

            {/* Chat Button */}
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className={`relative size-[36px] rounded-full border flex items-center justify-center transition-colors ${
                currentScreen === 'chat'
                  ? 'bg-[#E2F1E5] border-[#17683a]'
                  : 'bg-[#FDF4E3] border-[#EBDDC2] hover:bg-[#f6ead2]'
              }`}
              title="Pesan"
            >
              <img
                src={`${assetPathPrefix}/17a29.svg`}
                alt="Chat"
                className="block shrink-0"
              />
              {unreadChatCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-[10px] rounded-full bg-[#E5484D] ring-2 ring-white" />
              )}
            </button>

            {/* RA User Profile Avatar + Quick Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="size-[36px] rounded-full bg-[#2F5FD6] hover:bg-[#254fb8] transition-colors flex items-center justify-center font-['Poppins:Bold'] text-[14px] text-white shadow-2xs"
                title={`Akun ${account?.name ?? 'Raka Aditya'}`}
              >
                {account
                  ? account.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase())
                      .join('') || '?'
                  : 'RA'}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-[248px] rounded-[16px] bg-white border border-[#EBDDC2] shadow-[0_12px_32px_rgba(31,31,31,0.12)] py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-[#EBDDC2]">
                    <p className="font-['Poppins:Bold'] text-[14px] text-[#1f1f1f]">
                      {account?.name ?? 'Raka Aditya'}
                    </p>
                    <p className="font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
                      {account ? account.facultyProdi : 'FMIPA · Sistem Informasi'}
                    </p>
                    {(() => {
                      const st = account?.ktmStatus ?? 'verified'
                      const badge = {
                        verified: ['bg-[#DCF2E1] text-[#17683a]', '✓ Terverifikasi KTM'],
                        pending: ['bg-[#E7EEFC] text-[#254fb8]', '⏳ KTM sedang ditinjau'],
                        rejected: ['bg-[#FDE6EC] text-[#a02049]', '⚠ KTM ditolak'],
                        none: ['bg-[#FFF4D6] text-[#7a5a00]', 'Belum verifikasi KTM'],
                      }[st]
                      return (
                        <span
                          className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-['Poppins:Bold'] text-[10.5px] ${badge[0]}`}
                        >
                          {badge[1]}
                        </span>
                      )
                    })()}
                  </div>

                  <div className="py-1">
                    {[
                      { id: 'transaksi' as ScreenId, label: 'Transaksi Saya' },
                      {
                        id: 'eco-points' as ScreenId,
                        label: `Eco-Points (${formattedPoints})`,
                      },
                      {
                        id: 'umkm-kampus' as ScreenId,
                        label: 'Promo UMKM Kampus',
                      },
                      { id: 'sorot-barang' as ScreenId, label: 'Sorot Barang' },
                      {
                        id: 'verifikasi-ktm' as ScreenId,
                        label: 'Status Verifikasi KTM',
                      },
                    ].map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false)
                          onNavigate(entry.id)
                        }}
                        className="w-full text-left px-4 py-2 font-['Poppins:Regular'] text-[13px] text-[#1f1f1f] hover:bg-[#FDF4E3] transition-colors"
                      >
                        {entry.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[#EBDDC2] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        onNavigate('masuk')
                      }}
                      className="w-full text-left px-4 py-2 font-['Poppins:Bold'] text-[13px] text-[#d23a70] hover:bg-[#FFE1EB]/40 transition-colors"
                    >
                      Keluar / Halaman Masuk
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (visible on phones) */}
        <div className="sm:hidden px-4 pb-3">
          <form
            onSubmit={handleFormSubmit}
            className="flex items-center h-[42px] rounded-full bg-[#FDF4E3] border border-[#EBDDC2] px-3.5 gap-2.5"
          >
            <img
              src={`${assetPathPrefix}/aa43c.svg`}
              alt=""
              className="block shrink-0"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari kalkulator, jas lab, buku…"
              className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[13px] text-[#1f1f1f] placeholder:text-[#a39c8f]"
            />
            <button
              type="button"
              onClick={() => onNavigate('pencarian')}
              className="size-[30px] rounded-[8px] bg-[#17683A] flex items-center justify-center shrink-0"
              title="Filter"
            >
              <img
                src={`${assetPathPrefix}/52b2c.svg`}
                alt="Filter"
                className="block shrink-0"
              />
            </button>
          </form>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (matches 04-beranda mobile design without OS home bar) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#EBDDC2] h-[68px] px-3 flex items-center justify-around">
        <button
          type="button"
          onClick={() => onNavigate('beranda')}
          className="flex flex-col items-center justify-center gap-1 min-w-[60px]"
        >
          <img
            src={`${assetPathPrefix}/b66e4.svg`}
            alt=""
            className={`block ${currentScreen === 'beranda' ? 'opacity-100' : 'opacity-55'}`}
          />
          <span
            className={`text-[11px] ${
              currentScreen === 'beranda'
                ? "font-['Poppins:Bold'] text-[#17683a]"
                : "font-['Poppins:Regular'] text-[#a39c8f]"
            }`}
          >
            Beranda
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('papan-wtb')}
          className="flex flex-col items-center justify-center gap-1 min-w-[60px]"
        >
          <img
            src={`${assetPathPrefix}/b23b9.svg`}
            alt=""
            className={`block ${currentScreen === 'papan-wtb' ? 'opacity-100' : 'opacity-65'}`}
          />
          <span
            className={`text-[11px] ${
              currentScreen === 'papan-wtb'
                ? "font-['Poppins:Bold'] text-[#17683a]"
                : "font-['Poppins:Regular'] text-[#a39c8f]"
            }`}
          >
            Papan WTB
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('pasang-barang')}
          className="flex flex-col items-center justify-center -mt-6 min-w-[64px]"
        >
          <span className="size-[48px] rounded-full bg-[#F5A314] ring-4 ring-white shadow-md flex items-center justify-center">
            <img
              src={`${assetPathPrefix}/6ec1e.svg`}
              alt="Pasang"
              className="block shrink-0"
            />
          </span>
          <span className="mt-1 font-['Poppins:Bold'] text-[11px] text-[#1f1f1f]">
            Pasang
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('chat')}
          className="relative flex flex-col items-center justify-center gap-1 min-w-[60px]"
        >
          <img
            src={`${assetPathPrefix}/cb153.svg`}
            alt=""
            className={`block ${currentScreen === 'chat' ? 'opacity-100' : 'opacity-65'}`}
          />
          {unreadChatCount > 0 && (
            <span className="absolute top-0 right-4 size-[8px] rounded-full bg-[#E5484D]" />
          )}
          <span
            className={`text-[11px] ${
              currentScreen === 'chat'
                ? "font-['Poppins:Bold'] text-[#17683a]"
                : "font-['Poppins:Regular'] text-[#a39c8f]"
            }`}
          >
            Chat
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('transaksi')}
          className="flex flex-col items-center justify-center gap-1 min-w-[60px]"
        >
          <img
            src={`${assetPathPrefix}/d9c9f.svg`}
            alt=""
            className={`block ${currentScreen === 'transaksi' ? 'opacity-100' : 'opacity-65'}`}
          />
          <span
            className={`text-[11px] ${
              currentScreen === 'transaksi'
                ? "font-['Poppins:Bold'] text-[#17683a]"
                : "font-['Poppins:Regular'] text-[#a39c8f]"
            }`}
          >
            Profil
          </span>
        </button>
      </nav>
    </>
  )
}
