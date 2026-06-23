export interface LinkPreview {
  description: string
  favicon: string
  image: string | null
  screenshot: string
  title: string
  url: string
}

export interface CreatedLink {
  description: string | null
  expires_at: string | null
  favicon_url: string | null
  image_url: string | null
  password_required: boolean
  screenshot_url: string | null
  shortUrl: string
  slug: string
  target_url: string
  title: string | null
}
