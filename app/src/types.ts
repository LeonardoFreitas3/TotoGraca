export type Pick = 'V1' | 'X' | 'V2'
export type Role = 'admin' | 'user'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  name: string
  role: Role
  status: UserStatus
}

export interface Team {
  id: string
  name: string
  season: string
}

export interface Jornada {
  id: string
  number: number
  season: string
  deadline: string // ISO datetime — fecho das apostas
}

export interface Match {
  id: string
  jornadaId: string
  homeTeamId: string
  awayTeamId: string
  homeScore: number | null
  awayScore: number | null
}

export interface Tip {
  id: string
  userId: string
  matchId: string
  pick: Pick
}

export interface DB {
  users: User[]
  teams: Team[]
  jornadas: Jornada[]
  matches: Match[]
  tips: Tip[]
  session: string | null // id do utilizador com sessão iniciada
}

export const CURRENT_SEASON = '2026/2027'

// A nossa equipa — nunca entra nos jogos a apostar (apostamos nos outros jogos da série).
export const CLUB_TEAM = 'Águias da Graça'

export function matchResult(m: Match): Pick | null {
  if (m.homeScore === null || m.awayScore === null) return null
  if (m.homeScore > m.awayScore) return 'V1'
  if (m.homeScore < m.awayScore) return 'V2'
  return 'X'
}
