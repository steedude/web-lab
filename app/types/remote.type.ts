import type { RealtimeRole } from '~/types/realtime.type'

export enum RemotePromptCategory {
  Animal = 'animal',
  Fruit = 'fruit',
  Vegetable = 'vegetable',
}

export interface RemoteDrawingPrompt {
  answerKey: string
  category: RemotePromptCategory
}

export interface RemoteDrawStroke {
  id: string
  x0: number
  x1: number
  y0: number
  y1: number
}

export interface RemoteGameState {
  drawerRole: RealtimeRole
  promptIndex: number
}

export interface RemoteGameStatePayload {
  state: RemoteGameState
}

export interface RemoteDrawPayload {
  stroke: RemoteDrawStroke
}

export interface RemoteGuessPayload {
  guess: string
}

export type RemoteGiveUpPayload = Record<string, never>

export interface RemoteUndoPayload {
  strokeId: string
}
