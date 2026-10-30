import { useCallback, useEffect, useRef, useState } from 'react'
import {
  connectTableSocket,
  createTable,
  finishHand,
  joinTable,
  sendAction,
  startHand,
  type TableSocket,
} from '../api/tableSocket'
import type { ActionType, PlayerView } from '../types'

export function useTableSession() {
  const socketRef = useRef<TableSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [gameId, setGameId] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [view, setView] = useState<PlayerView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const socket = connectTableSocket()
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
  }, [])

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

  const hostAndJoin = useCallback(
    async (name: string, id: string) => {
      const socket = socketRef.current
      if (!socket) return
      await run(async () => {
        const { gameId: created } = await createTable(socket, {
          small_blind: 10,
          big_blind: 20,
          starting_chips: 1000,
        })
        const initial = await joinTable(socket, {
          gameId: created,
          playerId: id,
          name,
        })
        setGameId(created)
        setPlayerId(id)
        setView(initial)
      })
    },
    [run],
  )

  const joinExisting = useCallback(
    async (existingGameId: string, name: string, id: string) => {
      const socket = socketRef.current
      if (!socket) return
      await run(async () => {
        const initial = await joinTable(socket, {
          gameId: existingGameId,
          playerId: id,
          name,
        })
        setGameId(existingGameId)
        setPlayerId(id)
        setView(initial)
      })
    },
    [run],
  )

  const start = useCallback(async () => {
    const socket = socketRef.current
    if (!socket || !gameId) return
    await run(async () => {
      await startHand(socket, gameId)
    })
  }, [gameId, run])

  const act = useCallback(
    async (type: ActionType, amount?: number) => {
      const socket = socketRef.current
      if (!socket || !gameId) return
      await run(async () => {
        await sendAction(socket, { gameId, type, amount })
      })
    },
    [gameId, run],
  )

  const finish = useCallback(async () => {
    const socket = socketRef.current
    if (!socket || !gameId) return
    await run(async () => {
      await finishHand(socket, gameId)
    })
  }, [gameId, run])

  const clearError = useCallback(() => setError(null), [])

  return {
    connected,
    gameId,
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
