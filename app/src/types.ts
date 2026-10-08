export type Pick = 'V1' | 'X' | 'V2'
export type Role = 'admin' | 'user'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  name: string
  role: Role
  status: UserStatus
}

// Equipa técnica: sem conta, só entra nas multas e cotas
export interface Staff {
  id: string
  name: string
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
  postponed: boolean // adiado: não conta para a jornada
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

export interface Fine {
  id: string
  personId: string // id do jogador (profiles) ou da equipa técnica (staff)
  staff: boolean
  code: string
  amount: number
  date: string // YYYY-MM-DD
  paid: boolean
}

// Cota mensal — lançada como linha na tabela de multas com este código
export const COTA_CODE = 'COTA'
export const cotaValue = (staff: boolean) => (staff ? 5 : 2.5)
export const fineLabel = (code: string) => (code === COTA_CODE ? 'Cota mensal' : FINE_TABLE[code]?.label ?? '?')

// Tabela de multas do balneário (código → valor em €, descrição)
export const FINE_TABLE: Record<string, { value: number; label: string }> = {
  A: { value: 1, label: 'Atraso ao treino' },
  B: { value: 2, label: 'Atraso à concentração jogo' },
  C: { value: 0.5, label: 'Entrar chuteiras posto médico' },
  D: { value: 0.5, label: 'Urinar no campo' },
  E: { value: 0.5, label: 'Deixar material do clube no balneário' },
  F: { value: 0.5, label: 'Não assinar folha de presença' },
  G: { value: 1, label: 'Não levar fato de treino do clube em dia de jogo' },
  H: { value: 0.5, label: 'Telemóvel tocar nas palestras no balneário' },
  I: { value: 0.5, label: 'Perder a peladinha' },
  J: { value: 0.5, label: 'Não arrumar o material de treino' },
  K: { value: 1, label: 'Não assinar convocatória' },
  L: { value: 0.5, label: 'Deixar balneário desarrumado' },
  M: { value: 10, label: 'Cartão vermelho por indisciplina' },
  N: { value: 3, label: 'Cartão amarelo por indisciplina' },
  O: { value: 5, label: 'Faltar a treino' },
  P: { value: 10, label: 'Faltar ao jogo' },
  Q: { value: 10, label: 'Falta de respeito com colega de equipa' },
}
