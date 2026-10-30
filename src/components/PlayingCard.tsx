import { isRed, rankLabel, suitGlyph } from '../lib/cards'
import type { Card } from '../types'

export function PlayingCard({
  card,
  compact = false,
}: {
  card: Card
  index?: number
  compact?: boolean
}) {
  if (card.hidden) {
    return (
      <div
        className={`pcard pcard--back ${compact ? 'pcard--compact' : ''}`}
        aria-label="Hidden card"
      />
    )
  }

  const red = isRed(card.suit)
  return (
    <div
      className={`pcard ${red ? 'pcard--red' : 'pcard--black'} ${compact ? 'pcard--compact' : ''}`}
      aria-label={`${rankLabel(card.rank)} of ${card.suit}`}
    >
      <span className="pcard__rank">{rankLabel(card.rank)}</span>
      <span className="pcard__suit">{suitGlyph(card.suit)}</span>
    </div>
  )
}
