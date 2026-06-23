export enum DropMessageKind {
  File = 'file',
  FileEnd = 'file:end',
  FileStart = 'file:start',
  System = 'system',
  Text = 'text',
}

export interface DropChatItem {
  id: string
  kind: DropMessageKind
  mine: boolean
  name?: string
  size?: number
  text?: string
  url?: string
}

export interface IncomingDropFile {
  chunks: ArrayBuffer[]
  name: string
  received: number
  size: number
  type: string
}

export interface DropDataMessage {
  kind: DropMessageKind
  name?: string
  size?: number
  text?: string
  type?: string
}
