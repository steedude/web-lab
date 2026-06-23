<script setup lang="ts">
import type { DropChatItem } from '~/types/drop.type'
import { DropMessageKind } from '~/types/drop.type'
import { formatBytes } from '~/utils/file.util'

defineProps<{
  isReady: boolean
  messages: DropChatItem[]
  transferProgress: number | null
}>()

defineEmits<{
  chooseFile: [event: Event]
  sendText: []
}>()

const textInput = defineModel<string>('textInput', { required: true })

const { t } = useI18n()
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
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
          <a v-else-if="message.url" :href="message.url" :download="message.name" class="focus-ring block font-black underline">{{ t('common.download') }} {{ message.name }}<small class="ml-2 font-normal">{{ formatBytes(message.size) }}</small></a>
          <p v-else class="font-black">
            {{ t('common.upload') }} {{ message.name }} <small class="font-normal">{{ formatBytes(message.size) }}</small>
          </p>
        </div>
      </div>
    </div>
    <div v-if="transferProgress !== null" class="border-t-2 border-ink px-5 py-3">
      <div class="mb-1 flex justify-between text-xs font-black">
        <span>{{ t('drop.transfering') }}</span><span>{{ transferProgress }}{{ t('common.percent') }}</span>
      </div><div class="h-2 bg-ink/15">
        <div class="h-full bg-violet transition-all" :style="{ width: `${transferProgress}%` }" />
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
