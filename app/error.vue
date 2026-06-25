<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const statusCode = computed(() => props.error.statusCode || 500)
const isNotFound = computed(() => statusCode.value === 404)

function goHome() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <NuxtLayout>
    <main class="mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-5xl place-items-center px-5 py-12 lg:px-8">
      <AppStatusCard
        :action-label="t('status.actions.home')"
        :eyebrow="isNotFound ? t('status.notFound.eyebrow') : t('status.error.eyebrow')"
        :message="isNotFound ? t('status.notFound.message') : t('status.error.message')"
        :status-code="statusCode"
        :title="isNotFound ? t('status.notFound.title') : t('status.error.title')"
        to="/"
        @action="goHome"
      />
    </main>
  </NuxtLayout>
</template>
