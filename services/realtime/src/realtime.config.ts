import process from 'node:process'

export const REALTIME_SERVER_CONFIG = {
  heartbeatIntervalMs: 30_000,
  host: process.env.HOST ?? '127.0.0.1',
  maxPayloadBytes: 64 * 1024,
  maxRoomClients: 2,
  port: Number(process.env.PORT ?? 3001),
  roomPattern: /^[A-Z0-9]{6}$/,
} as const
