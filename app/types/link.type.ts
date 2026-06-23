export enum LinkMode {
  Image = 'image',
  Url = 'url',
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

export interface ImageLinkResolve {
  description: string | null
  image_url: string | null
  password_required: boolean
  status: 'expired' | 'not_found' | 'password_required' | 'resolved'
  title: string | null
}
