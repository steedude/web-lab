import { HOME_FEATURE_BASE } from '~/configs/feature.config'

type LocalePath = (path: string) => string

export function useHomeFeatureTranslations(localePath: LocalePath) {
  const { t } = useI18n()

  return computed(() => [
    {
      ...HOME_FEATURE_BASE[0],
      badge: t('features.draw.badge'),
      description: t('features.draw.description'),
      index: t('features.draw.index'),
      title: t('features.draw.title'),
      to: localePath(HOME_FEATURE_BASE[0].to),
    },
    {
      ...HOME_FEATURE_BASE[1],
      badge: t('features.drop.badge'),
      description: t('features.drop.description'),
      index: t('features.drop.index'),
      title: t('features.drop.title'),
      to: localePath(HOME_FEATURE_BASE[1].to),
    },
    {
      ...HOME_FEATURE_BASE[2],
      badge: t('features.links.badge'),
      description: t('features.links.description'),
      index: t('features.links.index'),
      title: t('features.links.title'),
      to: localePath(HOME_FEATURE_BASE[2].to),
    },
  ])
}
