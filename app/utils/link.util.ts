export function getHostname(value: string) {
  try {
    return new URL(value).hostname
  }
  catch {
    return ''
  }
}

export function getPreviewImage(image?: string | null, screenshot?: string | null) {
  return screenshot || image || ''
}
