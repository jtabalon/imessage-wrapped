import { isStaticMode } from './useApiData'

export function getStickerUrl(filename) {
  if (!filename) return null

  if (isStaticMode() && window.__IMESSAGE_WRAPPED_DATA__?.stickerImages) {
    return window.__IMESSAGE_WRAPPED_DATA__.stickerImages[filename] || null
  }

  return `/api/sticker-image?path=${encodeURIComponent(filename)}`
}
