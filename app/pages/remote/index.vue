<script setup lang="ts">
import QRCode from 'qrcode'
import { REMOTE_QR_CONFIG } from '~/configs/realtime.config'
import { REMOTE_SLIDES } from '~/configs/remote.config'
import { RealtimeMessageType, RealtimeRole, RealtimeStatus, RemoteCommand } from '~/types/realtime.type'
import { createRoomCode } from '~/utils/realtime.util'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const roomId = ref('')
const phoneUrl = ref('')
const qrCode = ref('')
const copied = ref(false)
const currentSlide = ref(0)
const slideStage = useTemplateRef<{ scrollBy: (top: number) => void, scrollToTop: () => void }>('slideStage')
const pointer = reactive({ x: 50, y: 50 })
const pointerVisible = ref(false)
const spotlight = ref(false)
let pointerTimer: ReturnType<typeof setTimeout> | null = null

const { latestMessage, peerConnected, status } = useRealtimeRoom(roomId, RealtimeRole.Desktop)

const slides = computed(() => REMOTE_SLIDES.map(slide => ({
  accent: slide.accent,
  body: t(slide.bodyKey),
  kicker: t(slide.kickerKey),
  title: t(slide.titleKey),
})))

const connectionLabel = computed(() => {
  if (peerConnected.value)
    return t('remote.connected')
  if (status.value === RealtimeStatus.Connecting || status.value === RealtimeStatus.Idle)
    return t('remote.connecting')
  if (status.value === RealtimeStatus.Offline)
    return t('remote.offline')
  return t('remote.waiting')
})

function changeSlide(direction: number) {
  currentSlide.value = (currentSlide.value + direction + slides.value.length) % slides.value.length
  slideStage.value?.scrollToTop()
}

function handleCommand(command: unknown) {
  if (command === RemoteCommand.Previous)
    changeSlide(-1)
  else if (command === RemoteCommand.Next)
    changeSlide(1)
  else if (command === RemoteCommand.ScrollUp)
    slideStage.value?.scrollBy(-160)
  else if (command === RemoteCommand.ScrollDown)
    slideStage.value?.scrollBy(160)
  else if (command === RemoteCommand.SpotlightToggle)
    spotlight.value = !spotlight.value
}

function handleKeydown(event: KeyboardEvent) {
  const commandMap: Record<string, RemoteCommand> = {
    ArrowDown: RemoteCommand.ScrollDown,
    ArrowLeft: RemoteCommand.Previous,
    ArrowRight: RemoteCommand.Next,
    ArrowUp: RemoteCommand.ScrollUp,
  }
  const command = commandMap[event.key]
  if (command) {
    event.preventDefault()
    handleCommand(command)
  }
}

async function copyPhoneUrl() {
  await navigator.clipboard.writeText(phoneUrl.value)
  copied.value = true
  setTimeout(() => copied.value = false, 1600)
}

watch(latestMessage, (message) => {
  if (!message)
    return

  if (message.type === RealtimeMessageType.RemoteCommand)
    handleCommand(message.payload?.command)

  if (message.type === RealtimeMessageType.RemotePointer) {
    const x = Number(message.payload?.x)
    const y = Number(message.payload?.y)
    if (!Number.isFinite(x) || !Number.isFinite(y))
      return

    pointer.x = Math.min(100, Math.max(0, x))
    pointer.y = Math.min(100, Math.max(0, y))
    pointerVisible.value = true
    if (pointerTimer)
      clearTimeout(pointerTimer)
    pointerTimer = setTimeout(() => pointerVisible.value = false, 2200)
  }
})

onMounted(async () => {
  roomId.value = createRoomCode()
  const localePrefix = locale.value === 'en' ? '/en' : ''
  phoneUrl.value = `${window.location.origin}${localePrefix}/remote/control/${roomId.value}`
  qrCode.value = await QRCode.toDataURL(phoneUrl.value, REMOTE_QR_CONFIG)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (pointerTimer)
    clearTimeout(pointerTimer)
})

useSeoMeta({
  title: () => `${t('features.remote.title')} — ${t('brand')}`,
  description: () => t('remote.description'),
})
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-5 pt-8 pb-16 sm:px-8 lg:px-12">
    <NuxtLink :to="localePath('/')" class="focus-ring inline-flex rounded-full py-2 text-xs font-black underline decoration-2 underline-offset-4">
      {{ t('common.arrowLeft') }} {{ t('common.backHome') }}
    </NuxtLink>

    <section class="mt-8 grid items-end gap-8 lg:grid-cols-[1fr_21rem]">
      <div>
        <p class="font-mono text-xs font-black tracking-[0.2em] text-black/50">
          {{ t('remote.eyebrow') }}
        </p>
        <h1 class="mt-4 max-w-4xl text-5xl leading-[0.94] font-black tracking-[-0.065em] sm:text-7xl">
          {{ t('remote.title') }}
        </h1>
        <p class="mt-6 max-w-2xl text-base leading-7 font-semibold text-black/60">
          {{ t('remote.description') }}
        </p>
      </div>

      <RemoteRemotePairingCard
        class="lg:hidden"
        :connection-label="connectionLabel"
        :copied="copied"
        :peer-connected="peerConnected"
        :phone-url="phoneUrl"
        :qr-code="qrCode"
        :room-id="roomId"
        @copy-link="copyPhoneUrl"
      />
    </section>

    <section class="mt-12 grid gap-7 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <RemoteRemotePairingCard
        class="hidden lg:block"
        :connection-label="connectionLabel"
        :copied="copied"
        :peer-connected="peerConnected"
        :phone-url="phoneUrl"
        :qr-code="qrCode"
        :room-id="roomId"
        @copy-link="copyPhoneUrl"
      />

      <div class="min-w-0">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p class="font-mono text-xs font-black">
            {{ t('remote.slideCounter', { current: currentSlide + 1, total: slides.length }) }}
          </p>
          <p class="text-xs font-bold text-black/45">
            {{ t('remote.keyboardHint') }}
          </p>
        </div>

        <RemoteRemoteSlideStage
          ref="slideStage"
          :current-slide="currentSlide"
          :pointer="pointer"
          :pointer-visible="pointerVisible"
          :slides="slides"
          :spotlight="spotlight"
        />
      </div>
    </section>
  </div>
</template>
