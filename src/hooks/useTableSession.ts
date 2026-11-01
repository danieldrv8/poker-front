import { useCallback, useEffect, useRef, useState } from 'react'
import {
  connectTableSocket,
  createRoom,
  finishHand,
  joinRoom,
  playerHello,
  sendAction,
  startGame,
  startHand,
  type TableSocket,
} from '../api/tableSocket'
import type { ActionType, PlayerView } from '../types'

export function useTableSession(accessToken: string) {
  const socketRef = useRef<TableSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [view, setView] = useState<PlayerView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const socket = connectTableSocket(accessToken)
    socketRef.current = socket

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    const onView = (next: PlayerView) => setView(next)
    const onError = (payload: { error?: string }) => {
      setError(payload.error ?? 'UNKNOWN_ERROR')
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('table:view', onView)
    socket.on('table:error', onError)

    if (socket.connected) setConnected(true)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('table:view', onView)
      socket.off('table:error', onError)
      socket.close()
      socketRef.current = null
    }
  }, [accessToken])

  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }, [])

  const ensureHello = useCallback(async (socket: TableSocket, nickname: string) => {
    const session = await playerHello(socket, nickname)
    setPlayerId(session.playerId)
    return session
  }, [])

  const hostAndJoin = useCallback(
    async (nickname: string) => {
      const socket = socketRef.current
      if (!socket) return
      await run(async () => {
        await ensureHello(socket, nickname)
        const created = await createRoom(socket, {
          small_blind: 10,
          big_blind: 20,
          starting_chips: 1000,
        })
        // Host is already seated; join by code to obtain the waiting view.
        const joined = await joinRoom(socket, created.code)
        setRoomId(joined.roomId)
        setRoomCode(created.code)
        setView(joined.view)
      })
    },
    [ensureHello, run],
  )

  const joinExisting = useCallback(
    async (code: string, nickname: string) => {
      const socket = socketRef.current
      if (!socket) return
      await run(async () => {
        await ensureHello(socket, nickname)
        const joined = await joinRoom(socket, code)
        setRoomId(joined.roomId)
        setRoomCode(code.trim().toUpperCase())
        setView(joined.view)
      })
    },
    [ensureHello, run],
  )

  const start = useCallback(async () => {
    const socket = socketRef.current
    if (!socket || !roomId || !view) return
    await run(async () => {
      if (view.phase === 'WAITING') {
        await startGame(socket, roomId)
      } else {
        await startHand(socket, roomId)
      }
    })
  }, [roomId, run, view])

  const act = useCallback(
    async (type: ActionType, amount?: number) => {
      const socket = socketRef.current
      if (!socket || !roomId) return
      await run(async () => {
        await sendAction(socket, { roomId, type, amount })
      })
    },
    [roomId, run],
  )

  const finish = useCallback(async () => {
    const socket = socketRef.current
    if (!socket || !roomId) return
    await run(async () => {
      await finishHand(socket, roomId)
    })
  }, [roomId, run])

  const clearError = useCallback(() => setError(null), [])

  return {
    connected,
    roomId,
    roomCode,
    playerId,
    view,
    error,
    busy,
    hostAndJoin,
    joinExisting,
    start,
    act,
    finish,
    clearError,
  }
}
