import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

const params = new URLSearchParams(window.location.search)

export function Lobby({
  connected,
  busy,
  error,
  onHost,
  onJoin,
}: {
  connected: boolean
  busy: boolean
  error: string | null
  onHost: (name: string, playerId: string) => void
  onJoin: (gameId: string, name: string, playerId: string) => void
}) {
  const [mode, setMode] = useState<'host' | 'join'>(
    params.get('gameId') ? 'join' : 'host',
  )
  const [gameId, setGameId] = useState(params.get('gameId') ?? '')
  const [name, setName] = useState(params.get('name') ?? '')
  const [playerId, setPlayerId] = useState(
    params.get('playerId') ?? (params.get('gameId') ? 'p2' : 'p1'),
  )

  const hint = useMemo(() => {
    if (mode === 'host') {
      return 'Crea la mesa en esta pestaña. Copia el ID y ábrela en otra como invitad@.'
    }
    return 'Pega el ID de mesa de la otra pestaña y siéntate.'
  }, [mode])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !playerId.trim()) return
    if (mode === 'host') {
      onHost(name.trim(), playerId.trim())
    } else {
      if (!gameId.trim()) return
      onJoin(gameId.trim(), name.trim(), playerId.trim())
    }
  }

  return (
    <div className="lobby">
      <header className="lobby__brand">
        <p className="brand">Felt</p>
        <h1>Demo de mesa</h1>
        <p className="lobby__lede">{hint}</p>
      </header>

      <form className="lobby__form" onSubmit={submit}>
        <div className="seg" role="tablist" aria-label="Modo">
          <button
            type="button"
            className={mode === 'host' ? 'seg__btn is-active' : 'seg__btn'}
            onClick={() => setMode('host')}
          >
            Crear mesa
          </button>
          <button
            type="button"
            className={mode === 'join' ? 'seg__btn is-active' : 'seg__btn'}
            onClick={() => setMode('join')}
          >
            Unirse
          </button>
        </div>

        {mode === 'join' && (
          <label className="field">
            <span>ID de mesa</span>
            <input
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="uuid de la otra pestaña"
              autoComplete="off"
              required
            />
          </label>
        )}

        <label className="field">
          <span>Nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={mode === 'host' ? 'Ana' : 'Bob'}
            required
          />
        </label>

        <label className="field">
          <span>Player ID</span>
          <input
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="p1"
            required
          />
        </label>

        <button
          className="btn btn--primary"
          type="submit"
          disabled={!connected || busy}
        >
          {!connected ? 'Conectando…' : busy ? 'Espera…' : mode === 'host' ? 'Crear y sentarme' : 'Sentarme'}
        </button>

        {error && <p className="banner banner--error">{error}</p>}

        <p className="lobby__status">
          API{' '}
          <span className={connected ? 'dot dot--on' : 'dot dot--off'} />
          {connected ? 'en línea' : 'offline — arranca apps/api en :3000'}
        </p>
      </form>
    </div>
  )
}
