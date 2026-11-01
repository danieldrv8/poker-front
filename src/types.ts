export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in'

export interface Card {
  rank?: number
  suit?: string
  hidden?: boolean
}

export interface PlayerSnapshot {
  id: string
  name: string
  chips: number
  hole_cards: Card[]
  current_bet: number
  total_bet: number
  folded: boolean
  all_in: boolean
  seat: number
  needs_action?: boolean
  can_raise?: boolean
}

export interface PlayerView {
  phase: string
  hand_number: number
  street?: string | null
  board: Card[]
  button?: number | null
  current_bet: number
  acting_player_id?: string | null
  you: string
  players: PlayerSnapshot[]
  last_awards?: unknown
}

export interface LobbyForm {
  mode: 'host' | 'join'
  code: string
  name: string
}
