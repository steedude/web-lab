export enum LinkExpiryDay {
  Forever = 0,
  OneDay = 1,
  OneWeek = 7,
  OneMonth = 30,
  OneYear = 365,
}

export const LINK_EXPIRY_OPTIONS = [
  { label: '永久', value: LinkExpiryDay.Forever },
  { label: '1 天', value: LinkExpiryDay.OneDay },
  { label: '7 天', value: LinkExpiryDay.OneWeek },
  { label: '30 天', value: LinkExpiryDay.OneMonth },
  { label: '1 年', value: LinkExpiryDay.OneYear },
] as const

export const LINK_QR_CONFIG = {
  color: {
    dark: '#171714',
    light: '#ffffff',
  },
  margin: 1,
  width: 360,
} as const
