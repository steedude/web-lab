import antfu from '@antfu/eslint-config'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu(
    {
      formatters: {
        css: true,
      },
      typescript: true,
      vue: true,
    },
    ...vueI18n.configs['flat/recommended'],
    {
      settings: {
        'vue-i18n': {
          localeDir: './i18n/locales/*.{json,json5,yaml,yml}',
          messageSyntaxVersion: '^11.0.0',
        },
      },
    },
    {
      files: ['i18n/locales/**/*.{json,json5,yaml,yml}'],
      rules: {
        '@intlify/vue-i18n/no-duplicate-keys-in-locale': 'error',
        '@intlify/vue-i18n/no-missing-keys-in-other-locales': 'error',
      },
    },
  ),
)
