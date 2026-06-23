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

export async function createImageLink(link: NewImageLink) {
  const [created] = await callRpc<NewImageLink>('create_image_link', {
    link_description: link.description,
    link_expires_at: link.expires_at,
    link_image_url: link.image_url,
    link_password: link.password,
    link_slug: link.slug,
    link_title: link.title,
  })
  return created ?? link
}

export async function resolveImageLink(slug: string, password?: string | null) {
  const [result] = await callRpc<ResolvedImageLink>('resolve_image_link', {
    password_attempt: password || null,
    requested_slug: slug,
  })
  return result ?? null
}
