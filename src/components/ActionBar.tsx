import { useState } from 'react'
import type { ActionType, PlayerView } from '../types'

export function ActionBar({
  view,
  busy,
  onStart,
  onAct,
  onFinish,
}: {
  view: PlayerView
  busy: boolean
  onStart: () => void
  onAct: (type: ActionType, amount?: number) => void
  onFinish: () => void
}) {
  const me = view.players.find((p) => p.id === view.you)
  const isActing = view.acting_player_id === view.you
  const [raiseTo, setRaiseTo] = useState(
    Math.max(view.current_bet * 2 || 40, (me?.current_bet ?? 0) + 20),
  )

  if (view.phase === 'WAITING' || view.phase === 'HAND_COMPLETED') {
    return (
      <div className="actions">
        <p className="actions__hint">
          {view.players.length < 2
            ? 'Esperando rival en otra pestaña…'
            : view.phase === 'HAND_COMPLETED'
              ? 'Mano terminada. Puedes empezar otra.'
              : 'Mesa lista.'}
        </p>
        <button
          className="btn btn--primary"
          type="button"
          disabled={busy || view.players.length < 2}
          onClick={onStart}
        >
          Empezar mano
        </button>
      </div>
    )
  }

  if (view.phase === 'SHOWDOWN') {
    return (
      <div className="actions">
        <p className="actions__hint">Showdown — reparte el bote.</p>
        <button
          className="btn btn--primary"
          type="button"
          disabled={busy}
          onClick={onFinish}
        >
          Finish hand
        </button>
      </div>
    )
  }

  return (
    <div className="actions">
      <p className="actions__hint">
        {isActing
          ? 'Tu turno'
          : `Turno de ${view.acting_player_id ?? '—'}`}
      </p>
      <div className="actions__row">
        <button
          className="btn"
          type="button"
          disabled={busy || !isActing}
          onClick={() => onAct('fold')}
        >
          Fold
        </button>
        <button
          className="btn"
          type="button"
          disabled={busy || !isActing}
          onClick={() => onAct('check')}
        >
          Check
        </button>
        <button
          className="btn"
          type="button"
          disabled={busy || !isActing}
          onClick={() => onAct('call')}
        >
          Call
        </button>
        <button
          className="btn"
          type="button"
          disabled={busy || !isActing || me?.can_raise === false}
          onClick={() => onAct('all_in')}
        >
          All-in
        </button>
      </div>
      <div className="actions__raise">
        <label>
          Raise to
          <input
            type="number"
            min={0}
            value={raiseTo}
            onChange={(e) => setRaiseTo(Number(e.target.value))}
            disabled={busy || !isActing}
          />
        </label>
        <button
          className="btn btn--primary"
          type="button"
          disabled={busy || !isActing || me?.can_raise === false}
          onClick={() => onAct('raise', raiseTo)}
        >
          Raise
        </button>
      </div>
    </div>
  )
}
