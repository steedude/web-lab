import { ApiErrorCode } from '../configs/error.config'
import { throwApiError } from './error.util'

export function parseHttpUrl(input: string) {
  let url: URL
  try {
    url = new URL(input.trim())
  }
  catch {
    throwApiError(400, ApiErrorCode.InvalidUrl)
  }
  if (!['http:', 'https:'].includes(url.protocol))
    throwApiError(400, ApiErrorCode.UnsupportedUrlProtocol)
  return url
}
