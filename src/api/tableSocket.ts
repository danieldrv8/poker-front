import { io, Socket } from 'socket.io-client'
import type { ActionType, PlayerView } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export type TableSocket = Socket

export function connectTableSocket(): TableSocket {
  return io(API_URL || undefined, {
    transports: ['websocket'],
    autoConnect: true,
  })
}

export async function createTable(
  socket: TableSocket,
  config?: Record<string, unknown>,
): Promise<{ gameId: string }> {
  const res = (await socket.emitWithAck('table:create', { config })) as {
    gameId?: string
    error?: string
  }
  if (res.error || !res.gameId) {
    throw new Error(res.error ?? 'CREATE_FAILED')
  }
  return { gameId: res.gameId }
}

export async function joinTable(
  socket: TableSocket,
  body: { gameId: string; playerId: string; name: string },
): Promise<PlayerView> {
  const res = (await socket.emitWithAck('table:join', body)) as {
    ok?: boolean
    view?: PlayerView
    error?: string
  }
  if (res.error || !res.view) {
    throw new Error(res.error ?? 'JOIN_FAILED')
  }
  return res.view
}

export async function startHand(
  socket: TableSocket,
  gameId: string,
): Promise<void> {
  const res = (await socket.emitWithAck('table:start', { gameId })) as {
    ok?: boolean
    error?: string
  }
  if (res.error) throw new Error(res.error)
}

export async function sendAction(
  socket: TableSocket,
  body: { gameId: string; type: ActionType; amount?: number },
): Promise<void> {
  const res = (await socket.emitWithAck('table:action', body)) as {
    ok?: boolean
    error?: string
  }
  if (res.error) throw new Error(res.error)
}

export async function finishHand(
  socket: TableSocket,
  gameId: string,
): Promise<void> {
  const res = (await socket.emitWithAck('table:finish', { gameId })) as {
    ok?: boolean
    error?: string
  }
  if (res.error) throw new Error(res.error)
}
