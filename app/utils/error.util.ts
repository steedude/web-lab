import type { ApiErrorCode } from '~/configs/error.config'
import type { ApiErrorPayload } from '~/types/error.type'

export function createLocalApiError(code: ApiErrorCode) {
  return { data: { code } }
}

export function getApiErrorCode(error: unknown) {
  const payload = (error as { data?: ApiErrorPayload })?.data
  return payload?.data?.code || payload?.code || null
}
