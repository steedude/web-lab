<script setup lang="ts">
interface RemoteSlide {
  accent: string
  body: string
  kicker: string
  title: string
}

defineProps<{
  currentSlide: number
  pointer: { x: number, y: number }
  pointerVisible: boolean
  slides: RemoteSlide[]
  spotlight: boolean
}>()

const { t } = useI18n()
const slideBody = useTemplateRef<HTMLElement>('slideBody')

function scrollToTop() {
  slideBody.value?.scrollTo({ behavior: 'smooth', top: 0 })
}

function scrollBy(top: number) {
  slideBody.value?.scrollBy({ behavior: 'smooth', top })
}

defineExpose({ scrollBy, scrollToTop })
</script>

<template>
  <div class="relative min-h-[31rem] overflow-hidden rounded-[2.25rem] border-2 border-ink bg-ink text-white shadow-[9px_9px_0_#ff735c]">
    <Transition name="slide" mode="out-in">
      <article :key="currentSlide" class="absolute inset-0 flex flex-col p-7 sm:p-12">
        <div :class="slides[currentSlide]?.accent" class="absolute -top-20 -right-16 size-64 rounded-full border-2 border-white/50 opacity-90" />
        <p class="relative font-mono text-xs font-black tracking-[0.2em] text-white/55">
          {{ slides[currentSlide]?.kicker }}
        </p>
        <div ref="slideBody" class="relative mt-auto max-h-80 overflow-y-auto pt-24 pr-2">
          <h2 class="max-w-3xl text-5xl leading-[0.94] font-black tracking-[-0.06em] sm:text-7xl">
            {{ slides[currentSlide]?.title }}
          </h2>
          <p class="mt-7 max-w-2xl text-base leading-8 font-semibold text-white/65 sm:text-lg">
            {{ slides[currentSlide]?.body }}
          </p>
          <p class="mt-6 text-sm leading-7 text-white/45">
            {{ t('remote.techStack') }}
          </p>
        </div>
      </article>
    </Transition>

    <div
      v-show="pointerVisible"
      class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-75"
      :style="{ left: `${pointer.x}%`, top: `${pointer.y}%` }"
    >
      <span :class="spotlight ? 'size-28 bg-coral/25 blur-xl' : 'size-10 bg-coral/50 blur-md'" class="absolute top-1/2 left-1/2 -translate-1/2 rounded-full" />
      <span class="relative block size-4 rounded-full border-2 border-white bg-coral shadow-[0_0_18px_#ff735c]" />
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 180ms ease,
    transform 220ms ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(2rem);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-2rem);
}
</style>
