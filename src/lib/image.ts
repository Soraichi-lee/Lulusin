// Utilitas gambar: membaca file dari galeri/kamera HP lalu memperkecilnya
// supaya ringan disimpan dan ditampilkan.

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

export const MAX_RAW_FILE_BYTES = 15 * 1024 * 1024 // 15 MB sebelum dikompres

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'File harus berupa gambar (JPG, PNG, atau WebP).'
  }
  if (file.size > MAX_RAW_FILE_BYTES) {
    return 'Ukuran foto terlalu besar (maksimal 15 MB).'
  }
  return null
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'))
    img.src = src
  })
}

/**
 * Membaca file gambar, memperkecil sisi terpanjang ke `maxSide` piksel,
 * lalu mengembalikannya sebagai data URL JPEG.
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxSide = 1280,
  quality = 0.82,
): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Browser tidak mendukung pemrosesan gambar.')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
