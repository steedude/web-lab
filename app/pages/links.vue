<script setup lang="ts">
import { LinkMode } from '~/types/link.type'

const { t } = useI18n()
const localePath = useLocalePath()
const {
  canCreate,
  copied,
  copyShortUrl,
  createLink,
  created,
  createdPreviewImage,
  creating,
  errorMessage,
  expiresInDays,
  imageDescription,
  imageTitle,
  markPreviewFailed,
  mode,
  onImageChange,
  password,
  qrCode,
  selectedImagePreview,
  setMode,
  shouldShowCreatedPreviewImage,
  showPassword,
  togglePassword,
  url,
} = useLinkCreator()
</script>

<template>
  <main class="mx-auto w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
    <NuxtLink :to="localePath('/')" class="focus-ring inline-flex font-bold hover:underline">
      {{ t('common.backHome') }}
    </NuxtLink>

    <div class="mt-10 grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
      <section>
        <p class="text-sm font-black tracking-[.24em]">
          {{ t('links.eyebrow') }}
        </p>
        <h1 class="mt-5 text-5xl leading-[.95] font-black tracking-[-.055em] lg:text-7xl">
          {{ t('links.title') }}
        </h1>
        <p class="mt-6 max-w-xl text-lg leading-8">
          {{ t('links.description') }}
        </p>

        <LinksLinkCreateForm
          v-model:expires-in-days="expiresInDays"
          v-model:image-description="imageDescription"
          v-model:image-title="imageTitle"
          v-model:mode="mode"
          v-model:password="password"
          v-model:url="url"
          :can-create="canCreate"
          :creating="creating"
          :error-message="errorMessage"
          :show-password="showPassword"
          @image-change="onImageChange"
          @mode-change="setMode"
          @submit="createLink"
          @toggle-password="togglePassword"
        />
      </section>

      <section class="lg:pt-12">
        <LinksLinkResultCard
          v-if="created"
          :copied="copied"
          :created="created"
          :image-url="createdPreviewImage"
          :qr-code="qrCode"
          :show-preview-image="shouldShowCreatedPreviewImage"
          @copy="copyShortUrl"
          @image-error="markPreviewFailed"
        />
        <LinksLinkImageDraftPreview
          v-else-if="mode === LinkMode.Image && selectedImagePreview"
          :description="imageDescription"
          :image-url="selectedImagePreview"
          :title="imageTitle"
        />
        <LinksLinkEmptyPreview v-else />
      </section>
    </div>
  </main>
</template>
