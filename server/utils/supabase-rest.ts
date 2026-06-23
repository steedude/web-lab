interface ShortLinkRow {
  clicks: number
  created_at: string
  description: string | null
  expires_at: string | null
  favicon_url: string | null
  id: string
  image_url: string | null
  screenshot_url: string | null
  slug: string
  target_url: string
  title: string | null
}

function credentials() {
  const config = useRuntimeConfig()
  const key = config.supabaseServiceRoleKey || config.public.supabasePublishableKey
  if (!config.public.supabaseUrl || !key)
    throw createError({ statusCode: 503, statusMessage: '資料庫尚未設定' })
  return { key, url: config.public.supabaseUrl }
}

export type NewShortLink = Pick<ShortLinkRow, 'description' | 'expires_at' | 'favicon_url' | 'image_url' | 'screenshot_url' | 'slug' | 'target_url' | 'title'>

export async function insertShortLink(row: NewShortLink) {
  const { key, url } = credentials()
  await $fetch(`${url}/rest/v1/short_links`, {
    method: 'POST',
    headers: { apikey: key, authorization: `Bearer ${key}`, prefer: 'return=minimal' },
    body: row,
  })
  return row
}

export async function resolveShortLink(slug: string) {
  const { key, url } = credentials()
  const rows = await $fetch<Array<{ target_url: string }>>(`${url}/rest/v1/rpc/resolve_short_link`, {
    method: 'POST',
    headers: { apikey: key, authorization: `Bearer ${key}` },
    body: { requested_slug: slug },
  })
  return rows[0]?.target_url ?? null
}
