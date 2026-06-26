import { DROP_RTC_CONFIG } from '~/configs/realtime.config'

export function useDropRtcConfiguration() {
  const config = useRuntimeConfig()

  return computed<RTCConfiguration>(() => {
    const iceServers: RTCIceServer[] = [...(DROP_RTC_CONFIG.iceServers ?? [])]
    const turnUrl = config.public.turnUrl
    const turnUsername = config.public.turnUsername
    const turnCredential = config.public.turnCredential

    if (turnUrl && turnUsername && turnCredential) {
      iceServers.push({
        credential: turnCredential,
        urls: turnUrl,
        username: turnUsername,
      })
    }

    return {
      ...DROP_RTC_CONFIG,
      iceServers,
    }
  })
}
