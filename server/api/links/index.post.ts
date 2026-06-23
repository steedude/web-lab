import { randomBytes } from 'node:crypto'
import { insertShortLink } from '../../utils/supabase-rest'
import { assertPublicDestination, normalizePublicUrl } from '../../utils/urls'

const attempts = new Map<string, number[]>()
const randomSlug = () => randomBytes(5).toString('base64url').slice(0, 7)
const MAX_SLUG_ATTEMPTS = 4

interface CreateLinkBody {
  alias?: string
  description?: string
  expiresInDays?: number
  favicon?: string
  image?: string | null
  screenshot?: string
  title?: string
  url?: string
}

function safeOptionalUrl(value: string | null | undefined, baseUrl: URL) {
  if (!value)
    return null
  try {
    const url = new URL(value, baseUrl)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString().slice(0, 2048) : null
  }
  catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const now = Date.now()
  const recent = (attempts.get(ip) || []).filter(time => now - time < 60_000)
  if (recent.length >= 10)
    throw createError({ statusCode: 429, statusMessage: '建立太頻繁，請稍後再試' })
  attempts.set(ip, [...recent, now])
  const body = await readBody<CreateLinkBody>(event)
  if (!body.url || body.url.length > 2048)
    throw createError({ statusCode: 400, statusMessage: '請輸入有效網址' })
  const target = normalizePublicUrl(body.url)
  await assertPublicDestination(target)
  const alias = body.alias?.trim().toLowerCase()
  if (alias && !/^[a-z0-9_-]{3,24}$/.test(alias))
    throw createError({ statusCode: 400, statusMessage: '自訂代碼需為 3–24 個英數字、- 或 _' })
  const days = Number(body.expiresInDays || 0)
  const expiresAt = days > 0 && days <= 365 ? new Date(now + days * 86_400_000).toISOString() : null
  const payload = {
    description: body.description?.trim().slice(0, 280) || null,
    expires_at: expiresAt,
    favicon_url: safeOptionalUrl(body.favicon, target),
    image_url: safeOptionalUrl(body.image, target),
    screenshot_url: safeOptionalUrl(body.screenshot, target),
    target_url: target.toString(),
    title: body.title?.trim().slice(0, 160) || null,
  }

  async function createWithSlug(slug: string) {
    const created = await insertShortLink({ ...payload, slug })
    return { ...created, shortUrl: `${getRequestURL(event).origin}/s/${created.slug}` }
  }

  try {
    if (alias)
      return await createWithSlug(alias)
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      try {
        return await createWithSlug(randomSlug())
      }
      catch (error: unknown) {
        const message = error instanceof Error ? error.message : ''
        if (!message.includes('duplicate') && !message.includes('23505'))
          throw error
      }
    }
    throw createError({ statusCode: 500, statusMessage: '建立短網址失敗，請再試一次' })
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('duplicate') || message.includes('23505'))
      throw createError({ statusCode: 409, statusMessage: '這個自訂代碼已被使用' })
    throw error
  }
})
