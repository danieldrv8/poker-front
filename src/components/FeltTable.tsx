import type { PlayerView } from '../types'
import { PlayingCard } from './PlayingCard'

function Seat({
  player,
  isYou,
  isActing,
  isButton,
}: {
  player: PlayerView['players'][number]
  isYou: boolean
  isActing: boolean
  isButton: boolean
}) {
  return (
    <div
      className={[
        'seat',
        isYou ? 'seat--you' : '',
        isActing ? 'seat--acting' : '',
        player.folded ? 'seat--folded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="seat__meta">
        <strong>
          {player.name}
          {isYou ? ' (tú)' : ''}
        </strong>
        <span>{player.chips} chips</span>
        {player.current_bet > 0 && (
          <span className="seat__bet">Bet {player.current_bet}</span>
        )}
        {isButton && <span className="seat__btn">D</span>}
        {player.all_in && <span className="seat__tag">ALL-IN</span>}
      </div>
      <div className="seat__cards">
        {player.hole_cards.map((card, i) => (
          <PlayingCard key={`${player.id}-${i}`} card={card} index={i} />
        ))}
      </div>
    </div>
  )
}

export function FeltTable({
  view,
  gameId,
}: {
  view: PlayerView
  gameId: string
}) {
  const sorted = [...view.players].sort((a, b) => a.seat - b.seat)

  return (
    <section className="felt-wrap">
      <div className="table-chrome">
        <p className="brand brand--sm">Felt</p>
        <div className="table-chrome__meta">
          <span>{view.phase}</span>
          <span>Hand #{view.hand_number}</span>
          {view.street && <span>{view.street}</span>}
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          title="Copiar ID de mesa"
          onClick={() => void navigator.clipboard.writeText(gameId)}
        >
          ID · {gameId.slice(0, 8)}…
        </button>
      </div>

      <div className="felt" aria-label="Poker table">
        <div className="felt__rail" />
        <div className="board">
          {view.board.length === 0 ? (
            <p className="board__empty">Sin community cards</p>
          ) : (
            view.board.map((card, i) => (
              <PlayingCard key={`board-${i}`} card={card} index={i} />
            ))
          )}
          <p className="board__pot">Pot commitment · bet {view.current_bet}</p>
        </div>

        <div className="seats">
          {sorted.map((player) => (
            <Seat
              key={player.id}
              player={player}
              isYou={player.id === view.you}
              isActing={view.acting_player_id === player.id}
              isButton={view.button === player.seat}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
