export function getHostname(value: string) {
  try {
    return new URL(value).hostname
  }
  catch {
    return ''
  }
}

export function normalizeAliasInput(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
}

export function getPreviewImage(image?: string | null, screenshot?: string | null) {
  return image || screenshot || ''
}
