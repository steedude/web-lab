import { ApiErrorCode } from '~/configs/error.config'

/** 錯誤代碼對應到翻譯函式，讓 IDE 可以直接辨識 t('...') 的內容。 */
export function useApiErrorTranslations() {
  const { t } = useI18n()

  return {
    fallback: () => t('errors.UNKNOWN_ERROR'),
    byCode: {
      [ApiErrorCode.CreateLinkFailed]: () => t('errors.CREATE_LINK_FAILED'),
      [ApiErrorCode.DatabaseNotConfigured]: () => t('errors.DATABASE_NOT_CONFIGURED'),
      [ApiErrorCode.ImageRequired]: () => t('errors.IMAGE_REQUIRED'),
      [ApiErrorCode.ImageTooLarge]: () => t('errors.IMAGE_TOO_LARGE'),
      [ApiErrorCode.ImageUploadFailed]: () => t('errors.IMAGE_UPLOAD_FAILED'),
      [ApiErrorCode.InvalidImageType]: () => t('errors.INVALID_IMAGE_TYPE'),
      [ApiErrorCode.InvalidUrl]: () => t('errors.INVALID_URL'),
      [ApiErrorCode.PasswordTooLong]: () => t('errors.PASSWORD_TOO_LONG'),
      [ApiErrorCode.PasswordTooShort]: () => t('errors.PASSWORD_TOO_SHORT'),
      [ApiErrorCode.RateLimited]: () => t('errors.RATE_LIMITED'),
      [ApiErrorCode.RequestTooLarge]: () => t('errors.REQUEST_TOO_LARGE'),
      [ApiErrorCode.StorageNotConfigured]: () => t('errors.STORAGE_NOT_CONFIGURED'),
      [ApiErrorCode.UnsupportedUrlProtocol]: () => t('errors.UNSUPPORTED_URL_PROTOCOL'),
    } satisfies Record<ApiErrorCode, () => string>,
  }
}
