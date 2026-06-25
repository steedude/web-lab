import type { CreatedLink } from '~/types/link.type'
import QRCode from 'qrcode'
import { LINK_FORM_LIMITS, LINK_IMAGE_UPLOAD_TYPES, LINK_QR_CONFIG, LinkExpiryDay } from '~/configs/link.config'
import { LinkMode } from '~/types/link.type'
import { getApiErrorMessage } from '~/utils/error.util'
import { getPreviewImage, getWebsiteScreenshotUrl } from '~/utils/link.util'

export function useLinkCreator() {
  const { t } = useI18n()
  const mode = ref<LinkMode>(LinkMode.Url)
  const url = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const imageTitle = ref('')
  const imageDescription = ref('')
  const selectedImage = ref<File | null>(null)
  const selectedImagePreview = ref('')
  const expiresInDays = ref<LinkExpiryDay>(LinkExpiryDay.Forever)
  const created = ref<CreatedLink | null>(null)
  const qrCode = ref('')
  const creating = ref(false)
  const errorMessage = ref('')
  const copied = ref(false)
  const createdPreviewFailed = ref(false)

  const createdIsImage = computed(() => Boolean(created.value?.target_url.includes('/image/')))
  const createdPreviewImage = computed(() => {
    if (!created.value)
      return ''
    if (createdIsImage.value)
      return getPreviewImage(created.value.image_url, created.value.screenshot_url)
    return getPreviewImage(created.value.image_url, created.value.screenshot_url) || getWebsiteScreenshotUrl(created.value.target_url)
  })
  const shouldShowCreatedPreviewImage = computed(() => Boolean(createdPreviewImage.value && !createdPreviewFailed.value))
  const canCreate = computed(() => mode.value === LinkMode.Url ? Boolean(url.value.trim()) : Boolean(selectedImage.value))

  function setMode(nextMode: LinkMode) {
    if (mode.value === nextMode)
      return
    mode.value = nextMode
    resetForm()
  }

  async function createLink() {
    creating.value = true
    errorMessage.value = ''
    try {
      createdPreviewFailed.value = false
      if (mode.value === LinkMode.Url)
        await createUrlLink()
      else
        await createImageLink()

      if (created.value)
        qrCode.value = await QRCode.toDataURL(created.value.shortUrl, LINK_QR_CONFIG)
    }
    catch (error: any) {
      errorMessage.value = getApiErrorMessage(error, t, 'errors.CREATE_LINK_FAILED')
    }
    finally {
      creating.value = false
    }
  }

  function onImageChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0] || null
    clearImagePreview()
    if (!validateImage(file)) {
      input.value = ''
      return
    }

    selectedImage.value = file
    selectedImagePreview.value = file ? URL.createObjectURL(file) : ''
    created.value = null
    errorMessage.value = ''
  }

  async function copyShortUrl() {
    if (!created.value)
      return
    await navigator.clipboard.writeText(created.value.shortUrl)
    copied.value = true
    setTimeout(() => copied.value = false, 1500)
  }

  function markPreviewFailed() {
    createdPreviewFailed.value = true
  }

  function togglePassword() {
    showPassword.value = !showPassword.value
  }

  watch(url, () => {
    if (mode.value !== LinkMode.Url)
      return
    created.value = null
    qrCode.value = ''
    copied.value = false
    createdPreviewFailed.value = false
  })

  onBeforeUnmount(clearImagePreview)

  return {
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
  }

  function limitText(value: string, maxLength: number) {
    return value.trim().slice(0, maxLength)
  }

  function isValidHttpUrlInput(value: string) {
    try {
      const candidate = new URL(value.trim())
      return ['http:', 'https:'].includes(candidate.protocol)
    }
    catch {
      return false
    }
  }

  function localApiError(code: string) {
    return { data: { code } }
  }

  function clearImagePreview() {
    if (selectedImagePreview.value)
      URL.revokeObjectURL(selectedImagePreview.value)
    selectedImage.value = null
    selectedImagePreview.value = ''
  }

  function resetForm() {
    url.value = ''
    password.value = ''
    showPassword.value = false
    imageTitle.value = ''
    imageDescription.value = ''
    expiresInDays.value = LinkExpiryDay.Forever
    created.value = null
    qrCode.value = ''
    errorMessage.value = ''
    copied.value = false
    createdPreviewFailed.value = false
    clearImagePreview()
  }

  async function createUrlLink() {
    if (!isValidHttpUrlInput(url.value)) {
      errorMessage.value = getApiErrorMessage(localApiError('INVALID_URL'), t, 'errors.INVALID_URL')
      return
    }

    created.value = await $fetch<CreatedLink>('/api/links', {
      method: 'POST',
      body: {
        expiresInDays: expiresInDays.value,
        password: limitText(password.value, LINK_FORM_LIMITS.password) || undefined,
        url: url.value.trim(),
      },
    })
  }

  async function createImageLink() {
    if (!selectedImage.value || !validateImage(selectedImage.value))
      return

    const body = new FormData()
    body.append('image', selectedImage.value)
    body.append('password', limitText(password.value, LINK_FORM_LIMITS.password))
    body.append('title', limitText(imageTitle.value, LINK_FORM_LIMITS.title))
    body.append('description', limitText(imageDescription.value, LINK_FORM_LIMITS.description))
    body.append('expiresInDays', String(expiresInDays.value))
    created.value = await $fetch<CreatedLink>('/api/links/image', {
      method: 'POST',
      body,
    })
  }

  function validateImage(file: File | null) {
    if (!file)
      return true
    if (!LINK_IMAGE_UPLOAD_TYPES.has(file.type)) {
      errorMessage.value = getApiErrorMessage(localApiError('INVALID_IMAGE_TYPE'), t, 'errors.INVALID_IMAGE_TYPE')
      return false
    }
    if (file.size > LINK_FORM_LIMITS.imageBytes) {
      errorMessage.value = getApiErrorMessage(localApiError('IMAGE_TOO_LARGE'), t, 'errors.IMAGE_TOO_LARGE')
      return false
    }
    return true
  }
}
