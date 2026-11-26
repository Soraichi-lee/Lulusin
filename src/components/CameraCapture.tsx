import React, { useCallback, useEffect, useRef, useState } from 'react'

interface CameraCaptureProps {
  title?: string
  /** Tampilkan bingkai panduan seukuran kartu (KTM). */
  cardGuide?: boolean
  onCapture: (dataUrl: string) => void
  onClose: () => void
  /** Dipanggil bila kamera tidak bisa dipakai di browser ini. */
  onUnavailable: () => void
}

type Facing = 'environment' | 'user'

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  title = 'Ambil foto',
  cardGuide = false,
  onCapture,
  onClose,
  onUnavailable,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facing, setFacing] = useState<Facing>('environment')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shot, setShot] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    let cancelled = false
    setReady(false)
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Kamera tidak tersedia di browser ini. Situs harus dibuka lewat HTTPS agar kamera bisa dipakai.',
      )
      return
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        stopStream()
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          video.play().catch(() => {})
        }
      })
      .catch((err: DOMException) => {
        if (cancelled) return
        if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
          setError(
            'Izin kamera ditolak. Aktifkan izin kamera untuk situs ini di pengaturan browser, lalu coba lagi.',
          )
        } else if (
          err?.name === 'NotFoundError' ||
          err?.name === 'OverconstrainedError'
        ) {
          setError('Kamera tidak ditemukan di perangkat ini.')
        } else {
          setError('Kamera tidak dapat dibuka. Pastikan tidak dipakai aplikasi lain.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [facing, stopStream])

  // Matikan kamera saat modal ditutup.
  useEffect(() => stopStream, [stopStream])

  const takePhoto = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight))
    const w = Math.round(video.videoWidth * scale)
    const h = Math.round(video.videoHeight * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, w, h)
    setShot(canvas.toDataURL('image/jpeg', 0.88))
  }

  const confirm = () => {
    if (!shot) return
    stopStream()
    onCapture(shot)
  }

  const close = () => {
    stopStream()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex items-center justify-between px-4 h-[56px] text-white shrink-0">
        <span className="font-['Poppins:Bold'] text-[15px]">{title}</span>
        <button
          type="button"
          onClick={close}
          aria-label="Tutup kamera"
          className="size-[36px] rounded-full bg-white/15 text-[20px] leading-none"
        >
          ×
        </button>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="px-8 text-center text-white">
            <p className="font-['Poppins:Regular'] text-[14px] leading-relaxed">
              {error}
            </p>
            <button
              type="button"
              onClick={() => {
                stopStream()
                onUnavailable()
              }}
              className="mt-5 h-[46px] px-6 rounded-[12px] bg-[#17683A] font-['Poppins:Bold'] text-[14px]"
            >
              Pakai kamera bawaan HP / pilih file
            </button>
          </div>
        ) : shot ? (
          <img
            src={shot}
            alt="Hasil foto"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              onLoadedMetadata={() => setReady(true)}
              className="max-h-full max-w-full object-contain"
            />
            {cardGuide && ready && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-[86%] max-w-[420px] aspect-[1.586/1] rounded-[16px] border-2 border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                <p className="mt-3 font-['Poppins:Regular'] text-[12px] text-white">
                  Posisikan KTM di dalam bingkai, pastikan tulisan terbaca
                </p>
              </div>
            )}
            {!ready && (
              <p className="absolute font-['Poppins:Regular'] text-[13px] text-white/80">
                Membuka kamera…
              </p>
            )}
          </>
        )}
      </div>

      {!error && (
        <div className="shrink-0 px-6 py-5 flex items-center justify-center gap-6">
          {shot ? (
            <>
              <button
                type="button"
                onClick={() => setShot(null)}
                className="h-[48px] px-6 rounded-full bg-white/15 text-white font-['Poppins:Bold'] text-[14px]"
              >
                Ulangi
              </button>
              <button
                type="button"
                onClick={confirm}
                className="h-[48px] px-6 rounded-full bg-[#17683A] text-white font-['Poppins:Bold'] text-[14px]"
              >
                Pakai foto ini
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
                className="h-[44px] px-4 rounded-full bg-white/15 text-white font-['Poppins:Regular'] text-[12.5px]"
              >
                Balik kamera
              </button>
              <button
                type="button"
                onClick={takePhoto}
                disabled={!ready}
                aria-label="Jepret foto"
                className="size-[68px] rounded-full bg-white border-[5px] border-white/50 disabled:opacity-40 active:scale-95 transition-transform"
              />
              <span className="w-[88px]" />
            </>
          )}
        </div>
      )}
    </div>
  )
}
