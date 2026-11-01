import { ActionBar } from './components/ActionBar'
import { AuthScreen } from './components/AuthScreen'
import { FeltTable } from './components/FeltTable'
import { Lobby } from './components/Lobby'
import { useAuth } from './hooks/useAuth'
import { useTableSession } from './hooks/useTableSession'

export default function App() {
  const auth = useAuth()

  if (!auth.ready) {
    return <div className="app" />
  }

  if (!auth.user || !auth.accessToken) {
    return (
      <div className="app">
        <AuthScreen
          onRequestOtp={auth.requestOtp}
          onVerifyOtp={async (email, code) => {
            await auth.verifyOtp(email, code)
          }}
        />
      </div>
    )
  }

  return (
    <AuthenticatedApp
      email={auth.user.email}
      accessToken={auth.accessToken}
      onLogout={auth.logout}
    />
  )
}

function AuthenticatedApp({
  email,
  accessToken,
  onLogout,
}: {
  email: string
  accessToken: string
  onLogout: () => void
}) {
  const session = useTableSession(accessToken)

  if (!session.roomId || !session.view) {
    return (
      <div className="app">
        <div className="auth-shell">
          <Lobby
            connected={session.connected}
            busy={session.busy}
            error={session.error}
            onHost={(nickname) => void session.hostAndJoin(nickname)}
            onJoin={(code, nickname) =>
              void session.joinExisting(code, nickname)
            }
          />
          <p className="auth__session">
            <span>{email}</span>
            <button type="button" className="btn btn--ghost" onClick={onLogout}>
              Salir
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app app--table">
      <FeltTable
        view={session.view}
        gameId={session.roomCode ?? session.roomId}
      />
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
        Demo: otra pestaña → Unirse → código{' '}
        <strong>{session.roomCode ?? '—'}</strong>
      </p>
    </div>
  )
}
