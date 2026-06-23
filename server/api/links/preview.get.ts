import type { LinkPreview } from '../../types/link.type'
import { LINK_CONFIG, LINK_PREVIEW_USER_AGENT } from '../../configs/link.config'
import { buildScreenshotUrl, decodeHtmlEntities, sanitizeText } from '../../utils/link.util'
import { assertPublicDestination, normalizePublicUrl } from '../../utils/url.util'

function meta(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i'),
  ]
  return patterns.map(pattern => html.match(pattern)?.[1]).find(Boolean)
}

async function safeFetch(startUrl: URL) {
  let current = startUrl
  for (let redirect = 0; redirect <= LINK_CONFIG.maxRedirects; redirect++) {
    await assertPublicDestination(current)
    const response = await fetch(current, {
      headers: { 'user-agent': LINK_PREVIEW_USER_AGENT },
      redirect: 'manual',
      signal: AbortSignal.timeout(LINK_CONFIG.previewTimeoutMs),
    })
    if (![301, 302, 303, 307, 308].includes(response.status))
      return response
    const location = response.headers.get('location')
    if (!location)
      return response
    current = new URL(location, current)
  }
  throw createError({ statusCode: 422, statusMessage: '網址重新導向次數過多' })
}

async function readHtml(response: Response) {
  if (!response.body)
    return ''
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let html = ''
  while (html.length < LINK_CONFIG.htmlPreviewMaxBytes) {
    const { done, value } = await reader.read()
    if (done)
      break
    html += decoder.decode(value, { stream: true })
  }
  await reader.cancel()
  return html.slice(0, LINK_CONFIG.htmlPreviewMaxBytes)
}

export default defineEventHandler(async (event) => {
  const input = getQuery(event).url
  if (typeof input !== 'string' || input.length > LINK_CONFIG.maxUrlLength)
    throw createError({ statusCode: 400, statusMessage: '請輸入有效網址' })
  const url = normalizePublicUrl(input)
  const response = await safeFetch(url)
  const contentType = response.headers.get('content-type') || ''
  if (!response.ok || !contentType.includes('text/html'))
    throw createError({ statusCode: 422, statusMessage: '這個網址沒有可讀取的網頁資訊' })
  const html = await readHtml(response)
  const finalUrl = new URL(response.url)
  const title = meta(html, 'og:title') || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || finalUrl.hostname
  const description = meta(html, 'og:description') || meta(html, 'description') || ''
  const imageValue = meta(html, 'og:image')
  const imageUrl = imageValue ? new URL(imageValue, finalUrl) : null
  const image = imageUrl && ['http:', 'https:'].includes(imageUrl.protocol) ? imageUrl.toString() : null
  return {
    description: sanitizeText(decodeHtmlEntities(description), LINK_CONFIG.maxDescriptionLength) || '',
    favicon: `${finalUrl.origin}/favicon.ico`,
    image,
    screenshot: buildScreenshotUrl(finalUrl),
    title: sanitizeText(decodeHtmlEntities(title), LINK_CONFIG.maxTitleLength) || finalUrl.hostname,
    url: finalUrl.toString(),
  } satisfies LinkPreview
})
