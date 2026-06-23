export enum DropMessageKind {
  File = 'file',
  FileEnd = 'file:end',
  FileProgress = 'file:progress',
  FileStart = 'file:start',
  System = 'system',
  Text = 'text',
}

export enum DropFileTransferStatus {
  Complete = 'complete',
  Receiving = 'receiving',
  Sending = 'sending',
}

export interface DropChatItem {
  averageBytesPerSecond?: number
  completedAt?: number
  elapsedMs?: number
  id: string
  kind: DropMessageKind
  lastProgressGapMs?: number
  mine: boolean
  name?: string
  peakBytesPerSecond?: number
  progress?: number
  receivedBytes?: number
  size?: number
  speedBytesPerSecond?: number
  stalledCount?: number
  startedAt?: number
  status?: DropFileTransferStatus
  text?: string
  url?: string
}

export interface IncomingDropFile {
  averageBytesPerSecond: number
  chunks: ArrayBuffer[]
  completedAt?: number
  id: string
  lastProgressGapMs: number
  lastProgressAt: number
  lastReceived: number
  name: string
  peakBytesPerSecond: number
  received: number
  size: number
  speedBytesPerSecond: number
  stalledCount: number
  startedAt: number
  type: string
}

export interface OutgoingDropFileProgress {
  averageBytesPerSecond: number
  lastProgressGapMs: number
  lastProgressAt: number
  lastReceived: number
  peakBytesPerSecond: number
  stalledCount: number
  startedAt: number
}

export interface DropDataMessage {
  id?: string
  kind: DropMessageKind
  name?: string
  received?: number
  size?: number
  text?: string
  type?: string
}

export interface DropDebugStats {
  availableOutgoingBitrate: number | null
  bufferedAmount: number
  bytesReceived: number
  bytesSent: number
  channelState: RTCDataChannelState
  connectionState: RTCPeerConnectionState
  controlBufferedAmount: number
  controlChannelState: RTCDataChannelState | 'missing'
  currentRoundTripTime: number | null
  fileBufferedAmount: number
  fileChannelState: RTCDataChannelState | 'missing'
  localCandidateType: string
  packetsLost: number
  packetsReceived: number
  packetsSent: number
  receiveBytesPerSecond: number
  remoteCandidateType: string
  selectedCandidatePairState: string
  sendBytesPerSecond: number
}
