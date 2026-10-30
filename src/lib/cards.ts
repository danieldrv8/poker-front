const RANK_LABEL: Record<number, string> = {
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
}

const SUIT_GLYPH: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

export function rankLabel(rank?: number): string {
  if (rank == null) return '?'
  return RANK_LABEL[rank] ?? String(rank)
}

export function suitGlyph(suit?: string): string {
  if (!suit) return '?'
  return SUIT_GLYPH[suit] ?? suit
}

export function isRed(suit?: string): boolean {
  return suit === 'hearts' || suit === 'diamonds'
}
