import { LinkExpiryDay } from '~/configs/link.config'

export function useLinkExpiryTranslations() {
  const { t } = useI18n()

  return computed(() => [
    { label: t('links.expiry.forever'), value: LinkExpiryDay.Forever },
    { label: t('links.expiry.oneDay'), value: LinkExpiryDay.OneDay },
    { label: t('links.expiry.oneWeek'), value: LinkExpiryDay.OneWeek },
    { label: t('links.expiry.oneMonth'), value: LinkExpiryDay.OneMonth },
  ])
}
