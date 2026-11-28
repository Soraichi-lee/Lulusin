import React, { useEffect, useState, useRef } from 'react'
import { assetPathPrefix, ScreenId } from '../data/lulusinData'
import { fileToCompressedDataUrl, validateImageFile } from '../lib/image'
import { CameraCapture } from '../components/CameraCapture'
import type { KtmStatus } from '../lib/api'

// Daftar fakultas pada form daftar. Nilai yang disimpan hanya singkatannya (mis. "FMIPA").
const FACULTIES: { value: string; label: string }[] = [
  { value: 'FMIPA', label: 'FMIPA · Matematika & IPA' },
  { value: 'FT', label: 'FT · Teknik' },
  { value: 'FEB', label: 'FEB · Ekonomika & Bisnis' },
  { value: 'FIK', label: 'FIK · Ilmu Keolahragaan' },
  { value: 'FBS', label: 'FBS · Bahasa & Seni' },
  { value: 'FH', label: 'FH · Hukum' },
  { value: 'FISIP', label: 'FISIP · Ilmu Sosial & Politik' },
  { value: 'FK', label: 'FK · Kedokteran' },
]

interface AuthScreensProps {
  mode: 'masuk' | 'daftar' | 'verifikasi-ktm'
  onNavigate: (screen: ScreenId) => void
  onShowToast: (msg: string) => void
  /** Handler backend (opsional). Mengembalikan pesan galat, atau null bila berhasil. */
  onLogin?: (email: string, password: string) => Promise<string | null>
  onRegister?: (data: {
    email: string
    password: string
    fullName: string
    facultyProdi: string
  }) => Promise<string | null>
  onSubmitKtm?: (nim: string, photoDataUrl: string) => Promise<string | null>
  /** Akun yang sedang masuk (mode backend): mengisi data otomatis & menampilkan status asli. */
  account?: {
    name: string
    facultyProdi: string
    nim: string
    ktmStatus: KtmStatus
  }
}

export const AuthScreens: React.FC<AuthScreensProps> = ({
  mode,
  onNavigate,
  onShowToast,
  onLogin,
  onRegister,
  onSubmitKtm,
  account,
}) => {
  // Mode demo memakai contoh isian; mode backend dimulai dari kosong.
  const demo = !onLogin
  const [email, setEmail] = useState(demo ? 'raka.aditya@students.unnes.ac.id' : '')
  const [password, setPassword] = useState(demo ? 'lulusin2026!' : '')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [resend, setResend] = useState(false)
  const [fullName, setFullName] = useState(demo ? 'Raka Aditya' : '')
  const [nim, setNim] = useState(demo ? '2504140123' : '')
  const [facultyProdi, setFacultyProdi] = useState('FMIPA')
  const [agreedTerms, setAgreedTerms] = useState(true)
  // Foto KTM hanya disimpan di memori halaman (tidak ditulis ke localStorage)
  // karena berisi data pribadi. Pengiriman ke server aman menyusul bersama backend.
  const [ktmPhoto, setKtmPhoto] = useState<string | null>(null)
  const [ktmFileName, setKtmFileName] = useState<string | null>(null)
  const [isReadingKtm, setIsReadingKtm] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const ktmUploadedName = ktmFileName

  const handleKtmFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problem = validateImageFile(file)
    if (problem) {
      onShowToast(problem)
      return
    }
    setIsReadingKtm(true)
    try {
      // KTM butuh resolusi cukup agar tulisan terbaca petugas.
      const dataUrl = await fileToCompressedDataUrl(file, 1600, 0.85)
      setKtmPhoto(dataUrl)
      setKtmFileName(file.name)
      onShowToast('Foto KTM siap dikirim. Pastikan tulisan terbaca jelas.')
    } catch {
      onShowToast('Foto KTM tidak dapat dibaca. Coba foto ulang.')
    } finally {
      setIsReadingKtm(false)
    }
  }

  const handleKtmSubmit = async () => {
    if (!ktmPhoto) {
      onShowToast('Unggah foto KTM terlebih dahulu.')
      return
    }
    if (onSubmitKtm) {
      if (!nim.trim()) {
        onShowToast('Isi NIM sesuai KTM terlebih dahulu.')
        return
      }
      if (busy) return
      setBusy(true)
      const err = await onSubmitKtm(nim, ktmPhoto)
      setBusy(false)
      if (err) onShowToast(err)
      else setResend(false)
      return
    }
    onShowToast('Foto KTM terkirim! Menunggu peninjauan petugas.')
    onNavigate('beranda')
  }

  const passwordStrength =
    password.length >= 10 ? 3 : password.length >= 6 ? 2 : password.length > 0 ? 1 : 0
  const strengthLabel =
    passwordStrength >= 3 ? 'Kuat' : passwordStrength === 2 ? 'Sedang' : 'Lemah'

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onLogin) {
      if (busy) return
      setBusy(true)
      const err = await onLogin(email, password)
      setBusy(false)
      if (err) onShowToast(err)
      return
    }
    onShowToast('Selamat datang kembali di Lulusin, Raka!')
    onNavigate('beranda')
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedTerms) {
      onShowToast('Setujui Syarat & Ketentuan terlebih dahulu.')
      return
    }
    if (onRegister) {
      if (busy) return
      setBusy(true)
      const err = await onRegister({ email, password, fullName, facultyProdi })
      setBusy(false)
      if (err) onShowToast(err)
      return
    }
    onNavigate('verifikasi-ktm')
  }

  // Isi otomatis dari akun yang sedang masuk (hanya bila kolomnya masih kosong).
  useEffect(() => {
    if (!account) return
    setFullName((v) => v || account.name)
    setNim((v) => v || account.nim)
    if (account.facultyProdi) setFacultyProdi(account.facultyProdi)
  }, [account?.name, account?.nim, account?.facultyProdi])

  const ktmStatus = account?.ktmStatus
  const showKtmForm =
    !onSubmitKtm || !ktmStatus || ktmStatus === 'none' || ktmStatus === 'rejected' || resend

  // 2 = unggah foto, 3 = menunggu ditinjau, 4 = terverifikasi (semua selesai)
  const ktmStep: 2 | 3 | 4 = showKtmForm ? 2 : ktmStatus === 'verified' ? 4 : 3

  const fakultasOnly = facultyProdi.includes('·')
    ? facultyProdi.split('·')[0].trim()
    : 'FMIPA'

  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-[#FDF4E3]">
      {/* Left Green Campus Hero Panel (matches 30:2, 30:75, 30:158) */}
      <div className="relative lg:w-1/2 bg-gradient-to-br from-[#1F7C46] to-[#0F4F2B] text-white px-6 sm:px-12 lg:px-16 xl:px-20 py-10 lg:py-16 flex flex-col justify-between overflow-hidden">
        {/* Decorative Soft Circles */}
        <div className="pointer-events-none absolute -top-32 right-[-10%] size-[420px] rounded-full bg-white/[0.05]" />
        <div className="pointer-events-none absolute -bottom-36 -left-28 size-[360px] rounded-full bg-white/[0.05]" />
        <div className="pointer-events-none absolute bottom-8 right-8 size-[170px] rounded-full bg-[#6B7E26]/45" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('beranda')}
            className="flex items-center gap-4 text-left"
          >
            <div className="size-[64px] sm:size-[72px] rounded-[16px] overflow-hidden shrink-0 shadow-sm">
              <img
                src={`${assetPathPrefix}/317d2.png`}
                alt="Lulusin"
                className="size-full object-cover"
              />
            </div>
            <span className="font-['Poppins:Bold'] text-[28px] sm:text-[32px] text-white">
              Lulusin
            </span>
          </button>
        </div>

        {/* Center Headline & Feature List */}
        <div className="relative z-10 my-10 lg:my-0">
          <h1 className="font-['Poppins:Bold'] text-[34px] sm:text-[42px] xl:text-[46px] leading-[1.16] tracking-tight">
            <span className="block text-white">Barang kampus,</span>
            <span className="block text-[#f5a314]">terus berputar.</span>
          </h1>

          <p className="mt-5 max-w-[520px] font-['Poppins:Regular'] text-[15px] sm:text-[16px] leading-[1.6] text-[#cfe8d6]">
            Marketplace khusus mahasiswa UNNES untuk jual, sewa, tukar, dan
            donasi barang. Aman karena semua akun terverifikasi KTM.
          </p>

          <div className="mt-9 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="size-[44px] rounded-full bg-white/12 flex items-center justify-center shrink-0">
                <img
                  src={`${assetPathPrefix}/0f59e.svg`}
                  alt=""
                  className="block shrink-0"
                />
              </div>
              <span className="font-['Poppins:Bold'] text-[15px] sm:text-[16px] text-white">
                Akun terverifikasi KTM
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="size-[44px] rounded-full bg-white/12 flex items-center justify-center shrink-0">
                <img
                  src={`${assetPathPrefix}/4e6e1.svg`}
                  alt=""
                  className="block shrink-0"
                />
              </div>
              <span className="font-['Poppins:Bold'] text-[15px] sm:text-[16px] text-white">
                COD di titik aman kampus
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="size-[44px] rounded-full bg-white/12 flex items-center justify-center shrink-0">
                <img
                  src={`${assetPathPrefix}/0f194.svg`}
                  alt=""
                  className="block shrink-0"
                />
              </div>
              <span className="font-['Poppins:Bold'] text-[15px] sm:text-[16px] text-white">
                Kumpulkan Eco-Points tiap transaksi
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Transaction Pills */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <span className="px-4 py-1.5 rounded-full bg-[#DCF2E1] font-['Poppins:Bold'] text-[13px] text-[#1c7a3d]">
            Jual
          </span>
          <span className="px-4 py-1.5 rounded-full bg-[#DCE8FF] font-['Poppins:Bold'] text-[13px] text-[#2f5fd6]">
            Sewa
          </span>
          <span className="px-4 py-1.5 rounded-full bg-[#ECE2FF] font-['Poppins:Bold'] text-[13px] text-[#6e45d3]">
            Tukar
          </span>
          <span className="px-4 py-1.5 rounded-full bg-[#FFE1EB] font-['Poppins:Bold'] text-[13px] text-[#d23a70]">
            Donasi
          </span>
        </div>
      </div>

      {/* Right Auth Form Area */}
      <div className="relative lg:w-1/2 flex flex-col items-center justify-center px-4 sm:px-8 py-10 lg:py-12 overflow-hidden">
        {/* Warm Soft Corner Circle */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-[280px] rounded-full bg-[#F9E8C2]/80" />

        {/* === MODE 1: D01-MASUK === */}
        {mode === 'masuk' && (
          <div className="relative z-10 w-full max-w-[480px]">
            <div className="bg-white rounded-[24px] border border-[#EBDDC2] shadow-[0_8px_30px_rgba(110,86,40,0.06)] px-6 sm:px-10 py-9">
              <div className="text-center">
                <h2 className="font-['Poppins:Bold'] text-[22px] text-[#1f1f1f]">
                  Selamat datang di Lulusin
                </h2>
                <p className="mt-1 font-['Poppins:Regular'] text-[14px] text-[#6e6a63]">
                  Masuk pakai email kampusmu.
                </p>
              </div>

              {/* Segmented Masuk / Daftar */}
              <div className="mt-6 p-1 rounded-[14px] bg-[#F2E6CC] grid grid-cols-2">
                <button
                  type="button"
                  className="h-[40px] rounded-[11px] bg-white font-['Poppins:Bold'] text-[14px] text-[#17683a] shadow-2xs"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('daftar')}
                  className="h-[40px] rounded-[11px] font-['Poppins:Regular'] text-[14px] text-[#6e6a63] hover:text-[#1f1f1f]"
                >
                  Daftar
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                    Email kampus
                  </label>
                  <div className="h-[50px] rounded-[12px] border border-[#EBDDC2] bg-white px-3.5 flex items-center gap-3 focus-within:border-[#17683a]">
                    <img
                      src={`${assetPathPrefix}/8cadb.svg`}
                      alt=""
                      className="block shrink-0"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@students.unnes.ac.id"
                      className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                    Kata sandi
                  </label>
                  <div className="h-[50px] rounded-[12px] border border-[#EBDDC2] bg-white px-3.5 flex items-center gap-3 focus-within:border-[#17683a]">
                    <img
                      src={`${assetPathPrefix}/9b7a3.svg`}
                      alt=""
                      className="block shrink-0"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="p-1 opacity-80 hover:opacity-100"
                      aria-label="Tampilkan kata sandi"
                    >
                      <img
                        src={`${assetPathPrefix}/bacfb.svg`}
                        alt=""
                        className="block shrink-0"
                      />
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        onShowToast(
                          'Tautan reset kata sandi dikirim ke email kampusmu.',
                        )
                      }
                      className="font-['Poppins:Bold'] text-[13px] text-[#17683a] hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-[54px] rounded-[14px] bg-[#17683A] hover:bg-[#12542e] transition-colors font-['Poppins:Bold'] text-[16px] text-white"
                >
                  Masuk
                </button>
              </form>

            </div>

            <div className="mt-6 text-center">
              <p className="font-['Poppins:Regular'] text-[13px] text-[#6e6a63]">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('daftar')}
                  className="font-['Poppins:Bold'] text-[#17683a] hover:underline"
                >
                  Daftar di sini
                </button>
              </p>
              <p className="mt-1.5 font-['Poppins:Regular'] text-[11px] text-[#a39c8f]">
                Khusus mahasiswa aktif UNNES
              </p>
            </div>
          </div>
        )}

        {/* === MODE 2: D02-DAFTAR === */}
        {mode === 'daftar' && (
          <div className="relative z-10 w-full max-w-[520px]">
            <div className="bg-white rounded-[24px] border border-[#EBDDC2] shadow-[0_8px_30px_rgba(110,86,40,0.06)] px-6 sm:px-10 py-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-['Poppins:Bold'] text-[24px] text-[#1f1f1f]">
                    Buat Akun
                  </h2>
                  <p className="mt-0.5 font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
                    Langkah 1 dari 2 · Data diri
                  </p>
                </div>
                {/* Step progress pill */}
                <div className="mt-2.5 w-[112px] h-[6px] rounded-full bg-[#F2E6CC] overflow-hidden">
                  <div className="w-1/2 h-full rounded-full bg-[#17683A]" />
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                    Nama lengkap
                  </label>
                  <div className="h-[48px] rounded-[12px] border border-[#EBDDC2] px-3.5 flex items-center gap-3 focus-within:border-[#17683a]">
                    <img
                      src={`${assetPathPrefix}/1710d.svg`}
                      alt=""
                      className="block shrink-0"
                    />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                    Email kampus
                  </label>
                  <div className="h-[48px] rounded-[12px] border border-[#EBDDC2] px-3.5 flex items-center gap-3 focus-within:border-[#17683a]">
                    <img
                      src={`${assetPathPrefix}/8cadb.svg`}
                      alt=""
                      className="block shrink-0"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                      NIM
                    </label>
                    <input
                      type="text"
                      required
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      className="w-full h-[48px] rounded-[12px] border border-[#EBDDC2] px-3.5 outline-none focus:border-[#17683a] font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                    />
                  </div>
                  <div>
                    <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                      Fakultas
                    </label>
                    <select
                      value={facultyProdi}
                      onChange={(e) => setFacultyProdi(e.target.value)}
                      className="w-full h-[48px] rounded-[12px] border border-[#EBDDC2] bg-white px-3 outline-none focus:border-[#17683a] font-['Poppins:Regular'] text-[12.5px] text-[#1f1f1f]"
                    >
                      {FACULTIES.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] mb-1.5">
                    Kata sandi
                  </label>
                  <div className="h-[48px] rounded-[12px] border border-[#EBDDC2] px-3.5 flex items-center gap-3 focus-within:border-[#17683a]">
                    <img
                      src={`${assetPathPrefix}/9b7a3.svg`}
                      alt=""
                      className="block shrink-0"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="p-1 opacity-80 hover:opacity-100"
                    >
                      <img
                        src={`${assetPathPrefix}/bacfb.svg`}
                        alt=""
                        className="block shrink-0"
                      />
                    </button>
                  </div>

                  {/* 4-segment Password Strength Bar */}
                  <div className="mt-2.5 flex items-center gap-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`h-[5px] flex-1 rounded-full transition-colors ${
                          idx < passwordStrength
                            ? 'bg-[#17683A]'
                            : 'bg-[#F2E6CC]'
                        }`}
                      />
                    ))}
                    <span className="ml-1 font-['Poppins:Bold'] text-[11px] text-[#17683a]">
                      {strengthLabel}
                    </span>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="pt-1 flex items-center gap-2.5 select-none">
                  <button
                    type="button"
                    onClick={() => setAgreedTerms((prev) => !prev)}
                    className={`size-[20px] rounded-[6px] flex items-center justify-center shrink-0 transition-colors ${
                      agreedTerms
                        ? 'bg-[#17683A]'
                        : 'border border-[#EBDDC2] bg-white'
                    }`}
                  >
                    {agreedTerms && (
                      <img
                        src={`${assetPathPrefix}/53f0c.svg`}
                        alt=""
                        className="block"
                      />
                    )}
                  </button>
                  <span className="font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
                    Saya setuju dengan Syarat &amp; Ketentuan dan Kebijakan
                    Privasi Lulusin
                  </span>
                </label>

                <button
                  type="submit"
                  className="mt-2 w-full h-[54px] rounded-[14px] bg-[#17683A] hover:bg-[#12542e] transition-colors font-['Poppins:Bold'] text-[15px] text-white"
                >
                  Daftar &amp; Lanjut Verifikasi
                </button>
              </form>

              <p className="mt-6 text-center font-['Poppins:Regular'] text-[13px] text-[#6e6a63]">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('masuk')}
                  className="font-['Poppins:Bold'] text-[#17683a] hover:underline"
                >
                  Masuk
                </button>
              </p>
            </div>
          </div>
        )}

        {/* === MODE 3: D03-VERIFIKASI-KTM === */}
        {mode === 'verifikasi-ktm' && (
          <div className="relative z-10 w-full max-w-[520px]">
            <div className="bg-white rounded-[24px] border border-[#EBDDC2] shadow-[0_8px_30px_rgba(110,86,40,0.06)] px-6 sm:px-9 py-7">
              {/* Header with Back Button */}
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onNavigate(account ? 'beranda' : 'daftar')}
                  className="size-[36px] rounded-full bg-[#FDF4E3] border border-[#EBDDC2] hover:bg-[#f6ead2] flex items-center justify-center shrink-0"
                  aria-label="Kembali"
                >
                  <img
                    src={`${assetPathPrefix}/90b47.svg`}
                    alt=""
                    className="block"
                  />
                </button>
                <div>
                  <h2 className="font-['Poppins:Bold'] text-[22px] text-[#1f1f1f] leading-tight">
                    Verifikasi KTM
                  </h2>
                  <p className="font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
                    {ktmStep === 2
                      ? 'Langkah 2 dari 3 · Foto KTM'
                      : ktmStep === 3
                        ? 'Langkah 3 dari 3 · Menunggu peninjauan'
                        : 'Selesai · Akun terverifikasi'}
                  </p>
                </div>
              </div>

              {/* 3-Step Horizontal Stepper (mengikuti status KTM asli) */}
              <div className="mt-6 px-3">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-[14px] right-1/2 top-[14px] h-[2.5px] bg-[#17683A]" />
                  <div
                    className={`absolute left-1/2 right-[14px] top-[14px] h-[2.5px] ${
                      ktmStep >= 3 ? 'bg-[#17683A]' : 'bg-[#F2E6CC]'
                    }`}
                  />

                  {/* 1. Akun (selalu selesai) */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5">
                    <div className="size-[28px] rounded-full bg-[#17683A] flex items-center justify-center">
                      <img
                        src={`${assetPathPrefix}/b2d08.svg`}
                        alt=""
                        className="block"
                      />
                    </div>
                    <span className="font-['Poppins:Bold'] text-[12px] text-[#1f1f1f]">
                      Akun
                    </span>
                  </div>

                  {/* 2. Foto KTM */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5">
                    {ktmStep >= 3 ? (
                      <div className="size-[28px] rounded-full bg-[#17683A] flex items-center justify-center">
                        <img
                          src={`${assetPathPrefix}/b2d08.svg`}
                          alt=""
                          className="block"
                        />
                      </div>
                    ) : (
                      <div className="size-[28px] rounded-full bg-[#F5A314] flex items-center justify-center font-['Poppins:Bold'] text-[13px] text-[#1f1f1f]">
                        2
                      </div>
                    )}
                    <span className="font-['Poppins:Bold'] text-[12px] text-[#1f1f1f]">
                      Foto KTM
                    </span>
                  </div>

                  {/* 3. Ditinjau / Terverifikasi */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5">
                    {ktmStep === 4 ? (
                      <div className="size-[28px] rounded-full bg-[#17683A] flex items-center justify-center">
                        <img
                          src={`${assetPathPrefix}/b2d08.svg`}
                          alt=""
                          className="block"
                        />
                      </div>
                    ) : ktmStep === 3 ? (
                      <div className="size-[28px] rounded-full bg-[#F5A314] flex items-center justify-center font-['Poppins:Bold'] text-[13px] text-[#1f1f1f]">
                        3
                      </div>
                    ) : (
                      <div className="size-[28px] rounded-full bg-[#F2E6CC] flex items-center justify-center font-['Poppins:Bold'] text-[13px] text-[#a39c8f]">
                        3
                      </div>
                    )}
                    <span
                      className={
                        ktmStep >= 3
                          ? "font-['Poppins:Bold'] text-[12px] text-[#1f1f1f]"
                          : "font-['Poppins:Regular'] text-[12px] text-[#a39c8f]"
                      }
                    >
                      {ktmStep === 4 ? 'Terverifikasi' : 'Ditinjau'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status asli verifikasi (mode backend) */}
              {onSubmitKtm && ktmStatus === 'verified' && (
                <div className="mt-6 rounded-[16px] bg-[#E2F1E5] p-5 text-center">
                  <p className="text-[34px] leading-none" aria-hidden="true">✅</p>
                  <p className="mt-2 font-['Poppins:Bold'] text-[16px] text-[#0f4f2b]">
                    Akunmu sudah terverifikasi
                  </p>
                  <p className="mt-1 font-['Poppins:Regular'] text-[12.5px] text-[#4d6b57]">
                    Kamu bisa memasang barang dan chat dengan penjual.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('beranda')}
                    className="mt-4 h-[44px] px-6 rounded-[12px] bg-[#17683A] hover:bg-[#12542e] font-['Poppins:Bold'] text-[14px] text-white transition-colors"
                  >
                    Ke Beranda
                  </button>
                </div>
              )}
              {onSubmitKtm && ktmStatus === 'pending' && !resend && (
                <div className="mt-6 rounded-[16px] bg-[#E7EEFC] p-5 text-center">
                  <p className="text-[34px] leading-none" aria-hidden="true">⏳</p>
                  <p className="mt-2 font-['Poppins:Bold'] text-[16px] text-[#254fb8]">
                    KTM-mu sedang ditinjau
                  </p>
                  <p className="mt-1 font-['Poppins:Regular'] text-[12.5px] text-[#4a5f93]">
                    Biasanya selesai dalam 1–24 jam. Statusnya diperbarui otomatis
                    di aplikasi ini.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onNavigate('beranda')}
                      className="h-[44px] px-6 rounded-[12px] bg-[#17683A] hover:bg-[#12542e] font-['Poppins:Bold'] text-[14px] text-white transition-colors"
                    >
                      Ke Beranda
                    </button>
                    <button
                      type="button"
                      onClick={() => setResend(true)}
                      className="h-[44px] px-5 rounded-[12px] border-[1.5px] border-[#254fb8] bg-white font-['Poppins:Bold'] text-[13px] text-[#254fb8]"
                    >
                      Kirim ulang foto
                    </button>
                  </div>
                </div>
              )}
              {onSubmitKtm && ktmStatus === 'rejected' && (
                <div className="mt-5 rounded-[14px] bg-[#FDE6EC] px-4 py-3 font-['Poppins:Regular'] text-[12.5px] text-[#a02049]">
                  Verifikasi sebelumnya ditolak. Kirim ulang foto KTM yang utuh dan
                  tulisannya jelas terbaca.
                </div>
              )}

              {showKtmForm && (
              <>
              {/* Simulated UNNES KTM Card */}
              <div className="mt-5 mx-auto max-w-[360px] rounded-[16px] bg-gradient-to-br from-[#1F7C46] to-[#0F4F2B] p-4 text-white relative overflow-hidden shadow-sm">
                <div className="pointer-events-none absolute -top-10 -right-10 size-[120px] rounded-full bg-white/8" />
                <p className="font-['Poppins:Bold'] text-[11px] tracking-wide">
                  UNIVERSITAS NEGERI SEMARANG
                </p>
                <p className="font-['Poppins:Regular'] text-[9px] text-[#cfe8d6]">
                  KARTU TANDA MAHASISWA
                </p>

                <div className="mt-3 flex items-center gap-4">
                  <div className="w-[72px] h-[88px] rounded-[10px] bg-white/18 flex flex-col items-center justify-center shrink-0">
                    <img
                      src={`${assetPathPrefix}/b3f7d.svg`}
                      alt=""
                      className="block"
                    />
                    {ktmUploadedName && (
                      <span className="mt-1 px-1.5 py-0.5 rounded bg-[#F5A314] text-[#1f1f1f] font-['Poppins:Bold'] text-[8px]">
                        TERUNGGAH
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-[54px_1fr] gap-y-1.5 text-left min-w-0">
                    <span className="font-['Poppins:Regular'] text-[9.5px] text-[#cfe8d6]">
                      Nama
                    </span>
                    <span className="font-['Poppins:Bold'] text-[11.5px] text-white truncate">
                      {fullName}
                    </span>

                    <span className="font-['Poppins:Regular'] text-[9.5px] text-[#cfe8d6]">
                      NIM
                    </span>
                    <span className="font-['Poppins:Bold'] text-[11.5px] text-white truncate">
                      {nim}
                    </span>

                    <span className="font-['Poppins:Regular'] text-[9.5px] text-[#cfe8d6]">
                      Fakultas
                    </span>
                    <span className="font-['Poppins:Bold'] text-[11.5px] text-white truncate">
                      {fakultasOnly}
                    </span>
                  </div>
                </div>
              </div>

              {showCamera && (
                <CameraCapture
                  title="Foto KTM"
                  cardGuide
                  onClose={() => setShowCamera(false)}
                  onUnavailable={() => {
                    setShowCamera(false)
                    cameraInputRef.current?.click()
                  }}
                  onCapture={(dataUrl) => {
                    setKtmPhoto(dataUrl)
                    setKtmFileName(`ktm-${Date.now()}.jpg`)
                    setShowCamera(false)
                    onShowToast('Foto KTM siap dikirim. Pastikan tulisan terbaca jelas.')
                  }}
                />
              )}

              {/* Hidden inputs: kamera bawaan (cadangan) dan galeri */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleKtmFile}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleKtmFile}
              />

              {/* Pratinjau foto KTM yang diunggah */}
              {ktmPhoto && (
                <div className="mt-4 rounded-[14px] border border-[#EBDDC2] bg-white p-3">
                  <img
                    src={ktmPhoto}
                    alt="Pratinjau foto KTM"
                    className="w-full max-h-[240px] object-contain rounded-[10px] bg-[#FDF4E3]"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="font-['Poppins:Regular'] text-[12px] text-[#6e6a63] truncate">
                      {ktmFileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setKtmPhoto(null)
                        setKtmFileName(null)
                      }}
                      className="shrink-0 font-['Poppins:Bold'] text-[12px] text-[#d23a70]"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isReadingKtm}
                  onClick={() => {
                    // Kamera langsung di halaman; jika tidak didukung, pakai input bawaan.
                    if (navigator.mediaDevices?.getUserMedia) setShowCamera(true)
                    else cameraInputRef.current?.click()
                  }}
                  className="h-[46px] rounded-[12px] bg-[#17683A] hover:bg-[#12542e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  <img
                    src={`${assetPathPrefix}/5de32.svg`}
                    alt=""
                    className="block shrink-0"
                  />
                  <span className="font-['Poppins:Bold'] text-[14px] text-white">
                    {isReadingKtm ? 'Memproses…' : 'Ambil Foto'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isReadingKtm}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[46px] rounded-[12px] border-[1.5px] border-[#17683A] bg-white hover:bg-[#E2F1E5]/40 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  <img
                    src={`${assetPathPrefix}/f9186.svg`}
                    alt=""
                    className="block shrink-0"
                  />
                  <span className="font-['Poppins:Bold'] text-[14px] text-[#17683a]">
                    Dari Galeri
                  </span>
                </button>
              </div>

              {/* Detected OCR KTM Card */}
              <div className="mt-4 rounded-[14px] bg-[#E2F1E5] p-4">
                <div className="flex items-center gap-2">
                  <span className="size-[22px] rounded-full bg-[#17683A] flex items-center justify-center shrink-0">
                    <img
                      src={`${assetPathPrefix}/9c1bc.svg`}
                      alt=""
                      className="block"
                    />
                  </span>
                  <span className="font-['Poppins:Bold'] text-[14px] text-[#0f4f2b]">
                    Data pendaftaranmu
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-[88px_1fr] gap-y-1 text-[13px]">
                  <span className="font-['Poppins:Regular'] text-[#6e6a63]">
                    Nama
                  </span>
                  <span className="font-['Poppins:Bold'] text-[#1f1f1f]">
                    {fullName}
                  </span>

                  <span className="font-['Poppins:Regular'] text-[#6e6a63]">
                    NIM
                  </span>
                  {onSubmitKtm ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      placeholder="Isi NIM sesuai KTM"
                      className="h-[30px] w-full rounded-[8px] border border-[#BFD9C6] bg-white px-2 font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] outline-none focus:border-[#17683A]"
                    />
                  ) : (
                    <span className="font-['Poppins:Bold'] text-[#1f1f1f]">
                      {nim}
                    </span>
                  )}

                  <span className="font-['Poppins:Regular'] text-[#6e6a63]">
                    Fakultas
                  </span>
                  <span className="font-['Poppins:Bold'] text-[#1f1f1f]">
                    {fakultasOnly}
                  </span>
                </div>
              </div>

              <p className="mt-2 font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63]">
                Petugas akan mencocokkan data di atas dengan foto KTM-mu.
              </p>

              {/* Why Verify Note */}
              <div className="mt-3.5 rounded-[14px] bg-[#FFF1D6] p-3.5 flex items-start gap-3">
                <img
                  src={`${assetPathPrefix}/66477.svg`}
                  alt=""
                  className="block shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-['Poppins:Bold'] text-[13px] text-[#1f1f1f]">
                    Kenapa harus verifikasi?
                  </p>
                  <p className="mt-0.5 font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63] leading-relaxed">
                    Hanya mahasiswa aktif yang bisa transaksi, jadi COD di
                    kampus lebih aman.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleKtmSubmit}
                disabled={!ktmPhoto || isReadingKtm || busy}
                className="mt-4 w-full h-[54px] rounded-[14px] bg-[#17683A] hover:bg-[#12542e] disabled:bg-[#a9bfae] disabled:cursor-not-allowed transition-colors font-['Poppins:Bold'] text-[15px] text-white"
              >
                Kirim untuk Diverifikasi
              </button>

              <p className="mt-3 text-center font-['Poppins:Regular'] text-[11px] text-[#a39c8f]">
                Biasanya selesai dalam 1–24 jam
              </p>
              </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

