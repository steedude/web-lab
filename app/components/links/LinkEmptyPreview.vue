<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="grid min-h-[470px] place-items-center border-2 border-dashed border-ink/40 bg-white/45 p-8 text-center">
    <div>
      <div class="text-6xl">
        {{ t('common.previewIcon') }}
      </div>
      <h2 class="mt-5 text-2xl font-black">
        {{ t('links.empty.title') }}
      </h2>
      <p class="mt-2 text-ink/60">
        {{ t('links.empty.description') }}
      </p>
    </div>
  </div>
</template>
