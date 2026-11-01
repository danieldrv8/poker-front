import { useState } from 'react'
import type { ActionType, PlayerView } from '../types'

function legalActions(view: PlayerView, isActing: boolean) {
  const me = view.players.find((p) => p.id === view.you)
  if (!isActing || !me || me.folded || me.all_in) {
    return {
      fold: false,
      check: false,
      call: false,
      raise: false,
      allIn: false,
      toCall: 0,
      me,
    }
  }

  const toCall = Math.max(0, view.current_bet - me.current_bet)
  const canRaise = me.can_raise !== false

  return {
    fold: true,
    check: toCall === 0,
    call: toCall > 0,
    // Need chips beyond a call to open/raise; incomplete raises block reopening.
    raise: canRaise && me.chips > toCall,
    // All-in OK unless it would illegally reopen after a short raise.
    allIn: me.chips > 0 && (canRaise || me.chips <= toCall),
    toCall,
    me,
  }
}

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
  const legal = legalActions(view, isActing)
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

  const hasAnyAction =
    legal.fold || legal.check || legal.call || legal.raise || legal.allIn

  return (
    <div className="actions">
      <p className="actions__hint">
        {isActing
          ? 'Tu turno'
          : `Turno de ${view.acting_player_id ?? '—'}`}
      </p>

      {hasAnyAction && (
        <div className="actions__row">
          {legal.fold && (
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => onAct('fold')}
            >
              Fold
            </button>
          )}
          {legal.check && (
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => onAct('check')}
            >
              Check
            </button>
          )}
          {legal.call && (
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => onAct('call')}
            >
              Call {legal.toCall}
            </button>
          )}
          {legal.allIn && (
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => onAct('all_in')}
            >
              All-in
            </button>
          )}
        </div>
      )}

      {legal.raise && (
        <div className="actions__raise">
          <label>
            Raise to
            <input
              type="number"
              min={0}
              value={raiseTo}
              onChange={(e) => setRaiseTo(Number(e.target.value))}
              disabled={busy}
            />
          </label>
          <button
            className="btn btn--primary"
            type="button"
            disabled={busy}
            onClick={() => onAct('raise', raiseTo)}
          >
            Raise
          </button>
        </div>
      )}
    </div>
  )
}
