<script setup lang="ts">
defineProps<{
  description: string
  imageUrl: string
  title: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="overflow-hidden border-2 border-ink bg-white shadow-[8px_8px_0_#171714]">
    <div class="aspect-[1200/630] overflow-hidden border-b-2 border-ink bg-violet/20">
      <img :src="imageUrl" :alt="title || t('links.preview.uploadAlt')" class="h-full w-full object-contain p-3">
    </div>
    <div class="p-5 sm:p-7">
      <p class="text-xs font-black tracking-[.2em]">
        {{ t('links.preview.imageEyebrow') }}
      </p>
      <h2 class="mt-3 line-clamp-2 break-all text-3xl font-black tracking-tight [overflow-wrap:anywhere]">
        {{ title || t('image.fallbackTitle') }}
      </h2>
      <p class="mt-3 line-clamp-3 break-all leading-7 text-ink/70 [overflow-wrap:anywhere]">
        {{ description || t('links.preview.imageDescription') }}
      </p>
    </div>
  </div>
</template>
