/**
 * FR-5: client-side compression to ≤ 500KB before upload.
 * Downscales to max 1280px and walks JPEG quality down until under budget.
 */
export async function compressImage(file: File, maxBytes = 500 * 1024): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const maxDim = 1280
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  for (const quality of [0.85, 0.7, 0.55, 0.4, 0.3]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    // base64 → bytes: ~3/4 of string length after the prefix
    const bytes = (dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75
    if (bytes <= maxBytes) return dataUrl
  }
  return canvas.toDataURL('image/jpeg', 0.25)
}
