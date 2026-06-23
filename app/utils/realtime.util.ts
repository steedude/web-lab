import { ROOM_CODE_CONFIG } from '~/configs/realtime.config'

export function createRoomCode() {
  const values = crypto.getRandomValues(new Uint8Array(ROOM_CODE_CONFIG.length))
  return Array.from(values, value => ROOM_CODE_CONFIG.alphabet[value % ROOM_CODE_CONFIG.alphabet.length]).join('')
}

export function normalizeRoomCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_CONFIG.length)
}

export function isRoomCode(value: string) {
  return ROOM_CODE_CONFIG.pattern.test(value)
}
