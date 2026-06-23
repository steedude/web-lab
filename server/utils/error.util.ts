import type { ApiErrorCode } from '../configs/error.config'

export function throwApiError(statusCode: number, code: ApiErrorCode, statusMessage = code): never {
  throw createError({
    data: { code },
    statusCode,
    statusMessage,
  })
}

export function isDuplicateError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  return message.includes('duplicate') || message.includes('23505')
}
