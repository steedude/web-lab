<script setup lang="ts">
import type { DropChatItem, DropDebugStats } from '~/types/drop.type'
import { DropFileTransferStatus, DropMessageKind } from '~/types/drop.type'
import { formatBytes } from '~/utils/file.util'

defineProps<{
  debugStats: DropDebugStats
  isReady: boolean
  messages: DropChatItem[]
}>()

defineEmits<{
  chooseFile: [event: Event]
  sendText: []
}>()

const textInput = defineModel<string>('textInput', { required: true })

const { t } = useI18n()
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

function fileStatusLabel(message: DropChatItem) {
  if (message.status === DropFileTransferStatus.Receiving)
    return t('drop.file.receiving')
  if (message.status === DropFileTransferStatus.Sending)
    return t('drop.file.sending')
  if (message.mine)
    return t('drop.file.sent')
  return t('drop.file.ready')
}

function fileProgress(message: DropChatItem) {
  return message.progress ?? (message.status === DropFileTransferStatus.Complete ? 100 : 0)
}

function formatBitrate(bytesPerSecond: number) {
  return `${formatBytes(bytesPerSecond)}/s`
}

function formatChannelDebug(state: string, bufferedAmount: number) {
  return `${state} / ${formatBytes(bufferedAmount)}`
}

function formatNullableBitrate(bitsPerSecond: number | null) {
  return bitsPerSecond ? formatBitrate(bitsPerSecond / 8) : t('drop.debug.empty')
}

function formatRtt(seconds: number | null) {
  return seconds === null ? t('drop.debug.empty') : `${Math.round(seconds * 1000)} ms`
}

function formatDuration(milliseconds?: number) {
  if (!milliseconds)
    return t('drop.debug.empty')
  if (milliseconds < 1000)
    return `${Math.round(milliseconds)} ms`
  return `${(milliseconds / 1000).toFixed(1)} s`
}

function formatCandidatePair(stats: DropDebugStats) {
  return t('drop.debug.candidatePair', {
    local: stats.localCandidateType || t('drop.debug.empty'),
    remote: stats.remoteCandidateType || t('drop.debug.empty'),
  })
}

function formatPacketStats(stats: DropDebugStats) {
  return t('drop.debug.packetStats', {
    received: stats.packetsReceived,
    sent: stats.packetsSent,
  })
}
</script>

<template>
  <div class="flex min-h-[620px] flex-col border-2 border-ink bg-white">
    <header class="flex items-center justify-between border-b-2 border-ink px-5 py-4">
      <div>
        <p class="text-xs font-black tracking-[.18em]">
          {{ t('drop.chatEyebrow') }}
        </p><h1 class="text-2xl font-black">
          {{ t('drop.chatTitle') }}
        </h1>
      </div>
      <span class="hidden text-sm font-bold sm:block">{{ t('drop.dataChannel') }}</span>
    </header>
    <details class="border-b-2 border-ink bg-paper px-5 py-3">
      <summary class="cursor-pointer text-xs font-black tracking-[.16em]">
        {{ t('drop.debug.title') }}
      </summary>
      <dl class="mt-3 grid gap-2 text-xs font-bold text-ink/70 sm:grid-cols-2">
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.connection') }}</dt>
          <dd class="font-mono text-ink">
            {{ debugStats.connectionState }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.channel') }}</dt>
          <dd class="font-mono text-ink">
            {{ debugStats.channelState }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.controlChannel') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatChannelDebug(debugStats.controlChannelState, debugStats.controlBufferedAmount) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.fileChannel') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatChannelDebug(debugStats.fileChannelState, debugStats.fileBufferedAmount) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.buffer') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatBytes(debugStats.bufferedAmount) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.rtt') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatRtt(debugStats.currentRoundTripTime) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.sendRate') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatBitrate(debugStats.sendBytesPerSecond) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.receiveRate') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatBitrate(debugStats.receiveBytesPerSecond) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.availableOutgoing') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatNullableBitrate(debugStats.availableOutgoingBitrate) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.candidate') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatCandidatePair(debugStats) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.packets') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatPacketStats(debugStats) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.lost') }}</dt>
          <dd class="font-mono text-ink">
            {{ debugStats.packetsLost }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.bytesSent') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatBytes(debugStats.bytesSent) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>{{ t('drop.debug.bytesReceived') }}</dt>
          <dd class="font-mono text-ink">
            {{ formatBytes(debugStats.bytesReceived) }}
          </dd>
        </div>
      </dl>
    </details>
    <div class="flex-1 space-y-3 overflow-y-auto p-5">
      <div v-if="!messages.length" class="grid h-full min-h-72 place-items-center text-center text-ink/55">
        <div>
          <div class="text-5xl">
            {{ t('common.openExternal') }}
          </div><p class="mt-3 font-bold">
            {{ t('drop.empty') }}
          </p>
        </div>
      </div>
      <div v-for="message in messages" :key="message.id" class="max-w-[85%]" :class="[message.mine ? 'ml-auto' : '', message.kind === DropMessageKind.System ? 'mx-auto text-center' : '']">
        <p v-if="message.kind === DropMessageKind.System" class="text-xs font-bold text-ink/55">
          {{ message.text }}
        </p>
        <div v-else class="border-2 border-ink px-4 py-3" :class="message.mine ? 'bg-acid' : 'bg-paper'">
          <p v-if="message.kind === DropMessageKind.Text" class="whitespace-pre-wrap break-words">
            {{ message.text }}
          </p>
          <div v-else>
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <a v-if="message.url" :href="message.url" :download="message.name" class="focus-ring block break-words font-black underline">
                  {{ message.name }}
                </a>
                <p v-else class="break-words font-black">
                  {{ message.name }}
                </p>
                <p class="mt-1 text-xs font-bold text-ink/55">
                  {{ t('drop.file.progressStats', { received: formatBytes(message.receivedBytes || 0), total: formatBytes(message.size || 0) }) }}
                  <span v-if="message.speedBytesPerSecond">{{ t('drop.file.speedStats', { speed: formatBytes(message.speedBytesPerSecond) }) }}</span>
                </p>
              </div>
              <span class="shrink-0 text-xs font-black text-ink/55">
                {{ fileStatusLabel(message) }}
              </span>
            </div>
            <div v-if="message.status !== DropFileTransferStatus.Complete" class="mt-3 h-2 border border-ink bg-white/60">
              <div class="h-full bg-violet transition-all" :style="{ width: `${fileProgress(message)}%` }" />
            </div>
            <dl v-if="message.size" class="mt-3 grid gap-1 border border-ink/20 bg-white/50 p-2 text-[11px] font-bold text-ink/60 sm:grid-cols-2">
              <div class="flex justify-between gap-2">
                <dt>{{ t('drop.debug.elapsed') }}</dt>
                <dd class="font-mono text-ink">
                  {{ formatDuration(message.elapsedMs) }}
                </dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt>{{ t('drop.debug.averageSpeed') }}</dt>
                <dd class="font-mono text-ink">
                  {{ formatBitrate(message.averageBytesPerSecond || 0) }}
                </dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt>{{ t('drop.debug.peakSpeed') }}</dt>
                <dd class="font-mono text-ink">
                  {{ formatBitrate(message.peakBytesPerSecond || 0) }}
                </dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt>{{ t('drop.debug.lastGap') }}</dt>
                <dd class="font-mono text-ink">
                  {{ formatDuration(message.lastProgressGapMs) }}
                </dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt>{{ t('drop.debug.stalls') }}</dt>
                <dd class="font-mono text-ink">
                  {{ message.stalledCount || 0 }}
                </dd>
              </div>
            </dl>
            <a v-if="message.url" :href="message.url" :download="message.name" class="focus-ring mt-3 inline-flex border-2 border-ink bg-white px-3 py-2 text-xs font-black">
              {{ t('common.download') }}
            </a>
          </div>
        </div>
      </div>
    </div>
    <form class="flex gap-2 border-t-2 border-ink p-3 sm:p-4" @submit.prevent="$emit('sendText')">
      <input ref="fileInput" type="file" class="hidden" @change="$emit('chooseFile', $event)">
      <button type="button" class="focus-ring border-2 border-ink px-4 text-xl font-black disabled:opacity-30" :disabled="!isReady" :aria-label="t('drop.actions.chooseFile')" @click="fileInput?.click()">
        {{ t('common.plus') }}
      </button>
      <input v-model="textInput" class="focus-ring min-w-0 flex-1 border-2 border-ink bg-paper px-4 py-3" :placeholder="t('drop.messagePlaceholder')" :disabled="!isReady">
      <button class="focus-ring border-2 border-ink bg-ink px-5 font-black text-white disabled:opacity-30" :disabled="!isReady || !textInput.trim()">
        {{ t('drop.actions.send') }}
      </button>
    </form>
  </div>
</template>
