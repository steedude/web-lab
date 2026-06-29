import type { NewImageLink, NewShortLink, ResolvedImageLink, ResolvedShortLink } from '../types/link.type'
import { ApiErrorCode } from '../configs/error.config'
import { throwApiError } from './error.util'

function credentials() {
  const config = useRuntimeConfig()
  const key = config.supabaseServiceRoleKey || config.public.supabasePublishableKey
  if (!config.public.supabaseUrl || !key)
    throwApiError(503, ApiErrorCode.DatabaseNotConfigured)
  return { key, url: config.public.supabaseUrl }
}

async function callRpc<T>(name: string, body: Record<string, unknown>) {
  const { key, url } = credentials()
  return await $fetch<T[]>(`${url}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: key, authorization: `Bearer ${key}` },
    body,
  })
}

export async function createShortLink(link: NewShortLink) {
  const [created] = await callRpc<NewShortLink>('create_short_link', {
    link_description: link.description,
    link_expires_at: link.expires_at,
    link_favicon_url: link.favicon_url,
    link_image_url: link.image_url,
    link_password: link.password,
    link_screenshot_url: link.screenshot_url,
    link_slug: link.slug,
    link_target_url: link.target_url,
    link_title: link.title,
  })
  return created ?? link
}

export async function resolveShortLink(slug: string, password?: string | null) {
  const [result] = await callRpc<ResolvedShortLink>('resolve_short_link', {
    password_attempt: password || null,
    requested_slug: slug,
  })
  return result ?? null
}

export async function createImageShortLink(imageLink: NewImageLink, shortLink: NewShortLink) {
  const [created] = await callRpc<NewShortLink>('create_image_short_link', {
    image_description: imageLink.description,
    image_expires_at: imageLink.expires_at,
    image_image_url: imageLink.image_url,
    image_password: imageLink.password,
    image_slug: imageLink.slug,
    image_title: imageLink.title,
    short_description: shortLink.description,
    short_expires_at: shortLink.expires_at,
    short_favicon_url: shortLink.favicon_url,
    short_image_url: shortLink.image_url,
    short_password: shortLink.password,
    short_screenshot_url: shortLink.screenshot_url,
    short_slug: shortLink.slug,
    short_target_url: shortLink.target_url,
    short_title: shortLink.title,
  })
  return created ?? shortLink
}

export async function resolveImageLink(slug: string, password?: string | null) {
  const [result] = await callRpc<ResolvedImageLink>('resolve_image_link', {
    password_attempt: password || null,
    requested_slug: slug,
  })
  return result ?? null
}
