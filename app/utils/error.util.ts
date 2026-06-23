export interface ApiErrorPayload {
  code?: string
  data?: {
    code?: string
  }
  statusCode?: number
  statusMessage?: string
}

export function getApiErrorCode(error: unknown) {
  const payload = (error as { data?: ApiErrorPayload })?.data
  return payload?.data?.code || payload?.code || null
}

export function getApiErrorMessage(error: unknown, t: (key: string) => string, fallbackKey = 'errors.UNKNOWN_ERROR') {
  const code = getApiErrorCode(error)
  if (!code)
    return t(fallbackKey)
  const key = `errors.${code}`
  const translated = t(key)
  return translated === key ? t(fallbackKey) : translated
}
