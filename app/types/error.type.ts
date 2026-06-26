/** 後端 API 錯誤回傳格式，前端會用 code 對應 i18n 翻譯。 */
export interface ApiErrorPayload {
  code?: string
  data?: {
    code?: string
  }
  statusCode?: number
  statusMessage?: string
}
