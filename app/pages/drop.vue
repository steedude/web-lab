<script setup lang="ts">
import type { DropChatItem, DropDataMessage, IncomingDropFile } from '~/types/drop.type'
import QRCode from 'qrcode'
import { DROP_FILE_TRANSFER_CONFIG, DROP_QR_CONFIG, DROP_RTC_CONFIG } from '~/configs/realtime.config'
import { DropMessageKind } from '~/types/drop.type'
import { RealtimeMessageType, RealtimeRole } from '~/types/realtime.type'
import { createRoomCode, isRoomCode, normalizeRoomCode } from '~/utils/realtime.util'

const route = useRoute()
const router = useRouter()
const roomInput = ref(typeof route.query.room === 'string' ? route.query.room.toUpperCase() : '')
const roomId = ref('')
const role = ref<RealtimeRole.DropHost | RealtimeRole.DropGuest>(RealtimeRole.DropHost)
const started = ref(false)
const qrCode = ref('')
const copied = ref(false)
const textInput = ref('')
const transferProgress = ref<number | null>(null)
const messages = ref<DropChatItem[]>([])
const connectionState = ref<RTCPeerConnectionState>('new')
const channelState = ref<RTCDataChannelState>('closed')
const { t } = useI18n()
const localePath = useLocalePath()

const room = useRealtimeRoom(roomId, role)
let peer: RTCPeerConnection | null = null
let channel: RTCDataChannel | null = null
let incomingFile: IncomingDropFile | null = null

const isReady = computed(() => channelState.value === 'open' && connectionState.value === 'connected')
const joinUrl = computed(() => import.meta.client && roomId.value
  ? `${window.location.origin}/drop?room=${roomId.value}`
  : '')

function addSystem(text: string) {
  messages.value.push({ id: crypto.randomUUID(), kind: DropMessageKind.System, mine: false, text })
}

function setupChannel(nextChannel: RTCDataChannel) {
  channel = nextChannel
  channelState.value = nextChannel.readyState
  channel.binaryType = 'arraybuffer'
  channel.bufferedAmountLowThreshold = DROP_FILE_TRANSFER_CONFIG.bufferLowThreshold

  channel.addEventListener('open', () => {
    channelState.value = nextChannel.readyState
  })
  channel.addEventListener('close', () => {
    channelState.value = nextChannel.readyState
  })
  channel.addEventListener('error', () => {
    channelState.value = nextChannel.readyState
  })

  channel.addEventListener('open', () => addSystem(t('drop.system.connected')))
  channel.addEventListener('close', () => addSystem(t('drop.system.offline')))
  channel.addEventListener('message', (event) => {
    if (typeof event.data === 'string') {
      const data = JSON.parse(event.data) as DropDataMessage

      if (data.kind === DropMessageKind.Text && data.text) {
        messages.value.push({ id: crypto.randomUUID(), kind: DropMessageKind.Text, mine: false, text: data.text })
      }
      else if (data.kind === DropMessageKind.FileStart && data.name && data.size !== undefined) {
        incomingFile = { chunks: [], name: data.name, received: 0, size: data.size, type: data.type || 'application/octet-stream' }
        transferProgress.value = 0
      }
      else if (data.kind === DropMessageKind.FileEnd && incomingFile) {
        const blob = new Blob(incomingFile.chunks, { type: incomingFile.type })
        messages.value.push({
          id: crypto.randomUUID(),
          kind: DropMessageKind.File,
          mine: false,
          name: incomingFile.name,
          size: incomingFile.size,
          url: URL.createObjectURL(blob),
        })
        incomingFile = null
        transferProgress.value = null
      }
      return
    }

    if (incomingFile) {
      const chunk = event.data as ArrayBuffer
      incomingFile.chunks.push(chunk)
      incomingFile.received += chunk.byteLength
      transferProgress.value = Math.min(100, Math.round((incomingFile.received / incomingFile.size) * 100))
    }
  })
}

function createPeer() {
  peer?.close()
  channel = null
  channelState.value = 'closed'
  peer = new RTCPeerConnection(DROP_RTC_CONFIG)
  connectionState.value = peer.connectionState
  peer.addEventListener('connectionstatechange', () => {
    connectionState.value = peer?.connectionState ?? 'closed'
  })
  peer.addEventListener('icecandidate', (event) => {
    if (event.candidate)
      room.send(RealtimeMessageType.SignalIce, { candidate: event.candidate.toJSON() })
  })
  peer.addEventListener('datachannel', event => setupChannel(event.channel))
  return peer
}

async function createOffer() {
  const pc = createPeer()
  setupChannel(pc.createDataChannel('drop', { ordered: true }))
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  room.send(RealtimeMessageType.SignalOffer, { sdp: offer })
}

async function handleSignal(message: { type: RealtimeMessageType, payload?: Record<string, unknown> }) {
  if (message.type === RealtimeMessageType.PeerJoined && role.value === RealtimeRole.DropHost) {
    await createOffer()
  }
  else if (message.type === RealtimeMessageType.SignalOffer) {
    const pc = createPeer()
    await pc.setRemoteDescription(message.payload?.sdp as RTCSessionDescriptionInit)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    room.send(RealtimeMessageType.SignalAnswer, { sdp: answer })
  }
  else if (message.type === RealtimeMessageType.SignalAnswer && peer) {
    await peer.setRemoteDescription(message.payload?.sdp as RTCSessionDescriptionInit)
  }
  else if (message.type === RealtimeMessageType.SignalIce && peer && message.payload?.candidate) {
    await peer.addIceCandidate(message.payload.candidate as RTCIceCandidateInit)
  }
}

async function start(nextRole: RealtimeRole.DropHost | RealtimeRole.DropGuest, code?: string) {
  const normalized = normalizeRoomCode(code || createRoomCode())
  if (!isRoomCode(normalized))
    return

  role.value = nextRole
  roomId.value = normalized
  started.value = true
  await router.replace({ query: nextRole === RealtimeRole.DropGuest ? { room: normalized } : {} })

  if (nextRole === RealtimeRole.DropHost) {
    await nextTick()
    qrCode.value = await QRCode.toDataURL(joinUrl.value, DROP_QR_CONFIG)
  }
}

function sendText() {
  const text = textInput.value.trim()
  if (!text || channel?.readyState !== 'open')
    return
  channel.send(JSON.stringify({ kind: DropMessageKind.Text, text }))
  messages.value.push({ id: crypto.randomUUID(), kind: DropMessageKind.Text, mine: true, text })
  textInput.value = ''
}

function waitForBuffer() {
  if (!channel || channel.bufferedAmount < DROP_FILE_TRANSFER_CONFIG.maxBufferedAmount)
    return Promise.resolve()
  return new Promise<void>((resolve) => {
    channel?.addEventListener('bufferedamountlow', () => resolve(), { once: true })
  })
}

async function sendFile(file: File) {
  if (!channel || channel.readyState !== 'open' || file.size > DROP_FILE_TRANSFER_CONFIG.maxFileSize)
    return

  channel.send(JSON.stringify({ kind: DropMessageKind.FileStart, name: file.name, size: file.size, type: file.type }))
  const chunkSize = DROP_FILE_TRANSFER_CONFIG.chunkSize
  transferProgress.value = 0
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    await waitForBuffer()
    channel.send(await file.slice(offset, offset + chunkSize).arrayBuffer())
    transferProgress.value = Math.min(100, Math.round(((offset + chunkSize) / file.size) * 100))
  }
  channel.send(JSON.stringify({ kind: DropMessageKind.FileEnd }))
  messages.value.push({ id: crypto.randomUUID(), kind: DropMessageKind.File, mine: true, name: file.name, size: file.size })
  transferProgress.value = null
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file)
    sendFile(file)
  input.value = ''
}

async function copyJoinUrl() {
  await navigator.clipboard.writeText(joinUrl.value)
  copied.value = true
  setTimeout(() => copied.value = false, 1500)
}

onMounted(() => {
  if (isRoomCode(roomInput.value))
    start(RealtimeRole.DropGuest, roomInput.value)
})

watch(room.latestMessage, (message) => {
  if (message)
    handleSignal(message).catch(() => addSystem(t('drop.system.signalFailed')))
})

onBeforeUnmount(() => {
  peer?.close()
  messages.value.forEach((message) => {
    if (message.url)
      URL.revokeObjectURL(message.url)
  })
})
</script>

<template>
  <main class="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
    <NuxtLink :to="localePath('/')" class="focus-ring inline-flex font-bold hover:underline">
      {{ t('common.arrowLeft') }} {{ t('common.backHome') }}
    </NuxtLink>

    <DropDropStartPanel v-if="!started" v-model:room-input="roomInput" @start="start" />

    <section v-else class="mt-10 grid min-h-[670px] gap-6 lg:grid-cols-[360px_1fr]">
      <DropDropRoomSidebar :copied="copied" :is-ready="isReady" :qr-code="qrCode" :role="role" :room-id="roomId" @copy-invite="copyJoinUrl" />
      <DropDropChatPanel v-model:text-input="textInput" :is-ready="isReady" :messages="messages" :transfer-progress="transferProgress" @choose-file="onFileChange" @send-text="sendText" />
    </section>
  </main>
</template>
