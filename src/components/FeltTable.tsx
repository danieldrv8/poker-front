import type { PlayerView } from '../types'
import { ChipStack } from './ChipStack'
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
        <span className="seat__chips">
          <ChipStack amount={player.chips} />
          <span>
            {player.chips} chips
          </span>
        </span>
        {player.current_bet > 0 && (
          <span className="seat__bet">
            <ChipStack amount={player.current_bet} />
            <span>Bet {player.current_bet}</span>
          </span>
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
  const pot = view.players.reduce((sum, p) => sum + p.total_bet, 0)
  const streetBets = view.players.reduce((sum, p) => sum + p.current_bet, 0)

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
          <div className="board__pot">
            <div className="board__pot-pile" aria-label={`Pot ${pot}`}>
              <ChipStack amount={pot} size="lg" />
              <div className="board__pot-copy">
                <span className="board__pot-label">Pot</span>
                <strong>{pot}</strong>
              </div>
            </div>
            <div
              className="board__street"
              aria-label={`Apuesta del turno ${view.current_bet}, en mesa ${streetBets}`}
            >
              <ChipStack amount={Math.max(view.current_bet, streetBets)} size="md" />
              <div className="board__pot-copy">
                <span className="board__pot-label">Bet</span>
                <strong>{view.current_bet}</strong>
                {streetBets > 0 && (
                  <span className="board__street-sum">· {streetBets} en calle</span>
                )}
              </div>
            </div>
          </div>
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
