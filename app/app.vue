<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()
const counter = useCounterStore()
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <NuxtRouteAnnouncer />
    <main class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div class="mb-8 flex items-center justify-between gap-4">
        <p class="text-sm font-semibold tracking-[0.25em] text-emerald-400 uppercase">
          {{ t('brand') }}
        </p>

        <select
          :value="locale"
          class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          :aria-label="t('language')"
          @change="setLocale(($event.target as HTMLSelectElement).value as 'zh-TW' | 'en')"
        >
          <option v-for="item in locales" :key="item.code" :value="item.code">
            {{ item.name }}
          </option>
        </select>
      </div>

      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
        {{ t('title') }}
      </h1>
      <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
        {{ t('description') }}
      </p>

      <section class="mt-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p class="text-sm text-slate-400">
          {{ t('persistedCount') }}
        </p>
        <p class="mt-2 text-5xl font-bold tabular-nums">
          {{ counter.count }}
        </p>
        <div class="mt-6 flex gap-3">
          <button
            class="rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-300"
            type="button"
            @click="counter.increment()"
          >
            {{ t('increment') }}
          </button>
          <button
            class="rounded-lg border border-slate-700 px-4 py-2 font-semibold transition hover:bg-slate-800"
            type="button"
            @click="counter.reset()"
          >
            {{ t('reset') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
