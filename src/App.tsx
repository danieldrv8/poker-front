import { ActionBar } from './components/ActionBar'
import { FeltTable } from './components/FeltTable'
import { Lobby } from './components/Lobby'
import { useTableSession } from './hooks/useTableSession'

export default function App() {
  const session = useTableSession()

  if (!session.gameId || !session.view) {
    return (
      <div className="app">
        <Lobby
          connected={session.connected}
          busy={session.busy}
          error={session.error}
          onHost={session.hostAndJoin}
          onJoin={session.joinExisting}
        />
      </div>
    )
  }

  return (
    <div className="app app--table">
      <FeltTable view={session.view} gameId={session.gameId} />
      <ActionBar
        view={session.view}
        busy={session.busy}
        onStart={() => void session.start()}
        onAct={(type, amount) => void session.act(type, amount)}
        onFinish={() => void session.finish()}
      />
      {session.error && (
        <button
          type="button"
          className="banner banner--error banner--toast"
          onClick={session.clearError}
        >
          {session.error} · tap to dismiss
        </button>
      )}
      <p className="demo-tip">
        Demo: abre otra pestaña → Unirse → pega el ID · playerId distinto
      </p>
    </div>
  )
}
