import { ApiErrorCode } from '~/configs/error.config'
import { getApiErrorCode } from '~/utils/error.util'

export function useApiErrorMessage() {
  const { byCode, fallback } = useApiErrorTranslations()

  return (error: unknown, fallbackCode?: ApiErrorCode) => {
    const code = getApiErrorCode(error)
    const translate = getApiErrorMessageTranslator(code, byCode)
      || (fallbackCode ? byCode[fallbackCode] : fallback)

    return translate()
  }
}

function getApiErrorMessageTranslator(code: string | null, messages: Record<ApiErrorCode, () => string>) {
  if (!code)
    return null
  if (!isApiErrorCode(code))
    return null

  return messages[code] || null
}

function isApiErrorCode(code: string): code is ApiErrorCode {
  return Object.values(ApiErrorCode).includes(code as ApiErrorCode)
}
