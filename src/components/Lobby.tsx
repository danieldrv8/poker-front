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
  onHost: (nickname: string) => void
  onJoin: (code: string, nickname: string) => void
}) {
  const [mode, setMode] = useState<'host' | 'join'>(
    params.get('code') ? 'join' : 'host',
  )
  const [code, setCode] = useState(params.get('code') ?? '')
  const [name, setName] = useState(params.get('name') ?? '')

  const hint = useMemo(() => {
    if (mode === 'host') {
      return 'Crea la mesa en esta pestaña. Comparte el código e invita a alguien.'
    }
    return 'Pega el código de la otra pestaña y siéntate.'
  }, [mode])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (mode === 'host') {
      onHost(name.trim())
    } else {
      if (!code.trim()) return
      onJoin(code.trim(), name.trim())
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
            <span>Código de mesa</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              autoComplete="off"
              autoCapitalize="characters"
              required
            />
          </label>
        )}

        <label className="field">
          <span>Apodo</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={mode === 'host' ? 'Ana' : 'Bob'}
            required
          />
        </label>

        <button
          className="btn btn--primary"
          type="submit"
          disabled={!connected || busy}
        >
          {!connected
            ? 'Conectando…'
            : busy
              ? 'Espera…'
              : mode === 'host'
                ? 'Crear y sentarme'
                : 'Sentarme'}
        </button>

        {error && <p className="banner banner--error">{error}</p>}

        <p className="lobby__status">
          API{' '}
          <span className={connected ? 'dot dot--on' : 'dot dot--off'} />
          {connected ? 'en línea' : 'offline — arranca el API en :3000'}
        </p>
      </form>
    </div>
  )
}
