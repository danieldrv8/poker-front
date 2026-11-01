import { io, Socket } from 'socket.io-client'
import type { ActionType, PlayerView } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export type TableSocket = Socket

export interface PlayerHello {
  playerId: string
  sessionToken: string
  nickname: string
  email: string
  userId: string
}

export function connectTableSocket(accessToken: string): TableSocket {
  return io(API_URL || undefined, {
    transports: ['websocket'],
    autoConnect: true,
    auth: { token: accessToken },
  })
}

async function ack<T extends object>(
  socket: TableSocket,
  event: string,
  body?: unknown,
): Promise<T> {
  const res = (await socket.emitWithAck(event, body ?? {})) as T & {
    error?: string
  }
  if (res && typeof res === 'object' && 'error' in res && res.error) {
    throw new Error(res.error)
  }
  return res
}

export async function playerHello(
  socket: TableSocket,
  nickname: string,
): Promise<PlayerHello> {
  return ack<PlayerHello>(socket, 'player:hello', { nickname })
}

export async function createRoom(
  socket: TableSocket,
  config?: Record<string, unknown>,
): Promise<{ roomId: string; code: string }> {
  const res = await ack<{ roomId?: string; code?: string }>(
    socket,
    'room:create',
    { config },
  )
  if (!res.roomId || !res.code) {
    throw new Error('CREATE_FAILED')
  }
  return { roomId: res.roomId, code: res.code }
}

export async function joinRoom(
  socket: TableSocket,
  code: string,
): Promise<{ roomId: string; view: PlayerView }> {
  const res = await ack<{
    ok?: boolean
    roomId?: string
    view?: PlayerView
  }>(socket, 'room:join', { code })
  if (!res.roomId || !res.view) {
    throw new Error('JOIN_FAILED')
  }
  return { roomId: res.roomId, view: res.view }
}

export async function startGame(
  socket: TableSocket,
  roomId: string,
): Promise<void> {
  await ack(socket, 'game:start', { roomId })
}

export async function startHand(
  socket: TableSocket,
  roomId: string,
): Promise<void> {
  await ack(socket, 'hand:start', { roomId })
}

export async function sendAction(
  socket: TableSocket,
  body: { roomId: string; type: ActionType; amount?: number },
): Promise<void> {
  await ack(socket, 'table:action', body)
}

export async function finishHand(
  socket: TableSocket,
  roomId: string,
): Promise<void> {
  await ack(socket, 'table:finish', { roomId })
}
