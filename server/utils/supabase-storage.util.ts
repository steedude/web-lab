import { LINK_CONFIG } from '../configs/link.config'

function storageCredentials() {
  const config = useRuntimeConfig()
  const key = config.supabaseServiceRoleKey || config.public.supabasePublishableKey
  if (!config.public.supabaseUrl || !key)
    throw createError({ statusCode: 503, statusMessage: 'Supabase 尚未設定' })
  return { key, url: config.public.supabaseUrl }
}

export function publicStorageUrl(path: string) {
  const { url } = storageCredentials()
  return `${url}/storage/v1/object/public/${LINK_CONFIG.storage.imageBucket}/${path}`
}

export async function uploadPublicImage(path: string, data: Uint8Array, contentType: string) {
  const { key, url } = storageCredentials()
  await $fetch(`${url}/storage/v1/object/${LINK_CONFIG.storage.imageBucket}/${path}`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'authorization': `Bearer ${key}`,
      'cache-control': '31536000',
      'content-type': contentType,
      'x-upsert': 'false',
    },
    body: data,
  })
  return publicStorageUrl(path)
}
