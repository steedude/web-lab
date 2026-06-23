export enum LinkExpiryDay {
  Forever = 0,
  OneDay = 1,
  OneWeek = 7,
  OneMonth = 30,
}

export const LINK_EXPIRY_OPTIONS = [
  { label: '永久', value: LinkExpiryDay.Forever },
  { label: '1 天', value: LinkExpiryDay.OneDay },
  { label: '7 天', value: LinkExpiryDay.OneWeek },
  { label: '30 天', value: LinkExpiryDay.OneMonth },
] as const

export const LINK_QR_CONFIG = {
  color: {
    dark: '#171714',
    light: '#ffffff',
  },
  margin: 1,
  width: 360,
} as const

export const LINK_FORM_LIMITS = {
  description: 100,
  password: 128,
  title: 50,
} as const
