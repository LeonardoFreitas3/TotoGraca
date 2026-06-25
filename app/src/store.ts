import { useSyncExternalStore } from 'react'
import {
  CURRENT_SEASON,
  matchResult,
  type DB,
  type Jornada,
  type Match,
  type Pick,
  type Team,
  type User,
} from './types'

const STORAGE_KEY = 'totograca-db-v1'

const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

// ---- fecho ao próximo sábado às 09:00 ----
export function nextSaturday9(from = new Date()): string {
  const d = new Date(from)
  const day = d.getDay() // 0 dom ... 6 sáb
  let add = (6 - day + 7) % 7
  if (add === 0 && (d.getHours() > 9 || (d.getHours() === 9 && d.getMinutes() > 0))) add = 7
  d.setDate(d.getDate() + add)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

// ---------- seed (dados de exemplo) ----------
function seed(): DB {
  const season = CURRENT_SEASON
  const admin: User = { id: uid(), name: 'Admin', email: 'admin@totograca.pt', password: 'admin', role: 'admin', status: 'approved' }
  const toze: User = { id: uid(), name: 'Tó Zé', email: 'toze@graca.pt', password: '123', role: 'user', status: 'approved' }
  const bruno: User = { id: uid(), name: 'Bruno', email: 'bruno@graca.pt', password: '123', role: 'user', status: 'approved' }
  const miguel: User = { id: uid(), name: 'Miguel', email: 'miguel@graca.pt', password: '123', role: 'user', status: 'approved' }
  const joao: User = { id: uid(), name: 'João Silva', email: 'joao@graca.pt', password: '123', role: 'user', status: 'pending' }

  const names = ['Vianense', 'Maximinos', 'Graça', 'Palmeira', 'Amares', 'Ruilhe', 'Cabreiros', 'Gondizalves']
  const teams: Team[] = names.map((name) => ({ id: uid(), name, season }))
  const t = (name: string) => teams.find((x) => x.name === name)!.id

  // Jornada 4 — já terminada (com resultados)
  const j4: Jornada = { id: uid(), number: 4, season, deadline: '2026-06-20T08:00:00.000Z' }
  const j4m1: Match = { id: uid(), jornadaId: j4.id, homeTeamId: t('Vianense'), awayTeamId: t('Maximinos'), homeScore: 2, awayScore: 0 }
  const j4m2: Match = { id: uid(), jornadaId: j4.id, homeTeamId: t('Graça'), awayTeamId: t('Palmeira'), homeScore: 1, awayScore: 1 }
  const j4m3: Match = { id: uid(), jornadaId: j4.id, homeTeamId: t('Amares'), awayTeamId: t('Ruilhe'), homeScore: 0, awayScore: 2 }

  // Jornada 5 — a decorrer (apostas abertas)
  const j5: Jornada = { id: uid(), number: 5, season, deadline: nextSaturday9() }
  const j5m1: Match = { id: uid(), jornadaId: j5.id, homeTeamId: t('Vianense'), awayTeamId: t('Maximinos'), homeScore: null, awayScore: null }
  const j5m2: Match = { id: uid(), jornadaId: j5.id, homeTeamId: t('Graça'), awayTeamId: t('Palmeira'), homeScore: null, awayScore: null }
  const j5m3: Match = { id: uid(), jornadaId: j5.id, homeTeamId: t('Amares'), awayTeamId: t('Ruilhe'), homeScore: null, awayScore: null }

  const mkTip = (userId: string, matchId: string, pick: Pick) => ({ id: uid(), userId, matchId, pick })
  const tips = [
    // Tó Zé — chave certa
    mkTip(toze.id, j4m1.id, 'V1'), mkTip(toze.id, j4m2.id, 'X'), mkTip(toze.id, j4m3.id, 'V2'),
    // Bruno — chave certa
    mkTip(bruno.id, j4m1.id, 'V1'), mkTip(bruno.id, j4m2.id, 'X'), mkTip(bruno.id, j4m3.id, 'V2'),
    // Miguel — falhou o último
    mkTip(miguel.id, j4m1.id, 'V1'), mkTip(miguel.id, j4m2.id, 'X'), mkTip(miguel.id, j4m3.id, 'V1'),
  ]

  return {
    users: [admin, toze, bruno, miguel, joao],
    teams,
    jornadas: [j4, j5],
    matches: [j4m1, j4m2, j4m3, j5m1, j5m2, j5m3],
    tips,
    session: null,
  }
}

// ---------- estado reativo ----------
let db: DB = load()
const listeners = new Set<() => void>()

function load(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  const fresh = seed()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  return fresh
}

function commit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  db = { ...db }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, () => db)
}

export function resetDB() {
  db = seed()
  commit()
}

// ---------- autenticação ----------
export function currentUser(): User | null {
  return db.users.find((u) => u.id === db.session) ?? null
}

export function register(name: string, email: string, password: string): { ok: boolean; error?: string } {
  email = email.trim().toLowerCase()
  if (!name.trim() || !email || !password) return { ok: false, error: 'Preenche todos os campos.' }
  if (db.users.some((u) => u.email === email)) return { ok: false, error: 'Já existe uma conta com esse email.' }
  const user: User = { id: uid(), name: name.trim(), email, password, role: 'user', status: 'pending' }
  db.users.push(user)
  commit()
  return { ok: true }
}

export function login(email: string, password: string): { ok: boolean; error?: string } {
  email = email.trim().toLowerCase()
  const user = db.users.find((u) => u.email === email)
  if (!user || user.password !== password) return { ok: false, error: 'Email ou palavra-passe errados.' }
  if (user.status === 'pending') return { ok: false, error: 'A tua conta ainda está à espera de aprovação do admin.' }
  if (user.status === 'rejected') return { ok: false, error: 'O teu registo foi recusado.' }
  db.session = user.id
  commit()
  return { ok: true }
}

export function logout() {
  db.session = null
  commit()
}

// ---------- utilizadores (admin) ----------
export const pendingUsers = () => db.users.filter((u) => u.status === 'pending')
export const approvedUsers = () => db.users.filter((u) => u.status === 'approved' && u.role === 'user')

export function approveUser(id: string) {
  const u = db.users.find((x) => x.id === id); if (u) u.status = 'approved'; commit()
}
export function rejectUser(id: string) {
  const u = db.users.find((x) => x.id === id); if (u) u.status = 'rejected'; commit()
}
export function deleteUser(id: string) {
  db.users = db.users.filter((u) => u.id !== id)
  db.tips = db.tips.filter((tp) => tp.userId !== id)
  commit()
}

// ---------- equipas ----------
export const listTeams = (season = CURRENT_SEASON) =>
  db.teams.filter((t) => t.season === season).sort((a, b) => a.name.localeCompare(b.name))
export const teamName = (id: string) => db.teams.find((t) => t.id === id)?.name ?? '?'

export function addTeam(name: string, season = CURRENT_SEASON) {
  if (!name.trim()) return
  db.teams.push({ id: uid(), name: name.trim(), season })
  commit()
}
export function deleteTeam(id: string) {
  db.teams = db.teams.filter((t) => t.id !== id); commit()
}

// ---------- jornadas ----------
export const listJornadas = (season = CURRENT_SEASON) =>
  db.jornadas.filter((j) => j.season === season).sort((a, b) => b.number - a.number)
export const getJornada = (id: string) => db.jornadas.find((j) => j.id === id) ?? null

export function currentJornada(season = CURRENT_SEASON): Jornada | null {
  const js = listJornadas(season)
  const open = js.filter((j) => !isLocked(j)).sort((a, b) => a.number - b.number)
  return open[0] ?? js[0] ?? null
}

export function nextJornadaNumber(season = CURRENT_SEASON): number {
  const js = listJornadas(season)
  return js.length ? js[0].number + 1 : 1
}

export function addJornada(number: number, deadline: string, season = CURRENT_SEASON): Jornada {
  const j: Jornada = { id: uid(), number, season, deadline }
  db.jornadas.push(j); commit(); return j
}
export function updateJornadaDeadline(id: string, deadline: string) {
  const j = db.jornadas.find((x) => x.id === id); if (j) j.deadline = deadline; commit()
}
export function deleteJornada(id: string) {
  const matchIds = db.matches.filter((m) => m.jornadaId === id).map((m) => m.id)
  db.matches = db.matches.filter((m) => m.jornadaId !== id)
  db.tips = db.tips.filter((tp) => !matchIds.includes(tp.matchId))
  db.jornadas = db.jornadas.filter((j) => j.id !== id)
  commit()
}

// ---------- jogos ----------
export const listMatches = (jornadaId: string) => db.matches.filter((m) => m.jornadaId === jornadaId)

export function addMatch(jornadaId: string, homeTeamId: string, awayTeamId: string) {
  db.matches.push({ id: uid(), jornadaId, homeTeamId, awayTeamId, homeScore: null, awayScore: null })
  commit()
}
export function deleteMatch(id: string) {
  db.matches = db.matches.filter((m) => m.id !== id)
  db.tips = db.tips.filter((tp) => tp.matchId !== id)
  commit()
}
export function setMatchScore(id: string, home: number | null, away: number | null) {
  const m = db.matches.find((x) => x.id === id)
  if (m) { m.homeScore = home; m.awayScore = away }
  commit()
}

// ---------- palpites ----------
export const getTip = (userId: string, matchId: string) =>
  db.tips.find((t) => t.userId === userId && t.matchId === matchId) ?? null

export function setTip(userId: string, matchId: string, pick: Pick): { ok: boolean; error?: string } {
  const m = db.matches.find((x) => x.id === matchId)
  if (!m) return { ok: false, error: 'Jogo não encontrado.' }
  const j = getJornada(m.jornadaId)
  if (j && isLocked(j)) return { ok: false, error: 'As apostas desta jornada já estão fechadas.' }
  const existing = db.tips.find((t) => t.userId === userId && t.matchId === matchId)
  if (existing) existing.pick = pick
  else db.tips.push({ id: uid(), userId, matchId, pick })
  commit()
  return { ok: true }
}

export function userTipsForJornada(userId: string, jornadaId: string): Record<string, Pick> {
  const ids = listMatches(jornadaId).map((m) => m.id)
  const out: Record<string, Pick> = {}
  db.tips.filter((t) => t.userId === userId && ids.includes(t.matchId)).forEach((t) => { out[t.matchId] = t.pick })
  return out
}

// ---------- lógica ----------
export const isLocked = (j: Jornada) => Date.now() >= new Date(j.deadline).getTime()

export function jornadaHasResults(jornadaId: string): boolean {
  return listMatches(jornadaId).some((m) => matchResult(m) !== null)
}
export function jornadaFinished(jornadaId: string): boolean {
  const ms = listMatches(jornadaId)
  return ms.length > 0 && ms.every((m) => matchResult(m) !== null)
}

export interface ScoreResult { answered: number; total: number; correct: number; wrong: number; isWinner: boolean }

export function userScore(userId: string, jornadaId: string): ScoreResult {
  const ms = listMatches(jornadaId)
  const tips = userTipsForJornada(userId, jornadaId)
  let correct = 0, wrong = 0, answered = 0
  ms.forEach((m) => {
    const res = matchResult(m)
    const pick = tips[m.id]
    if (pick) answered++
    if (res && pick) { if (pick === res) correct++; else wrong++ }
  })
  // só ganha quem acertou TODOS os jogos da jornada
  const isWinner = jornadaFinished(jornadaId) && answered === ms.length && ms.length > 0 && correct === ms.length
  return { answered, total: ms.length, correct, wrong, isWinner }
}

export function winnersForJornada(jornadaId: string): User[] {
  if (!jornadaFinished(jornadaId)) return []
  return db.users
    .filter((u) => u.status === 'approved')
    .filter((u) => userScore(u.id, jornadaId).isWinner)
}

// classificação da época: nº de jornadas ganhas (chaves certas)
export interface SeasonRow { user: User; wins: number }
export function seasonRanking(season = CURRENT_SEASON): SeasonRow[] {
  const finished = listJornadas(season).filter((j) => jornadaFinished(j.id))
  const rows = db.users
    .filter((u) => u.status === 'approved' && u.role === 'user')
    .map((user) => ({
      user,
      wins: finished.filter((j) => userScore(user.id, j.id).isWinner).length,
    }))
  return rows.sort((a, b) => b.wins - a.wins || a.user.name.localeCompare(b.user.name))
}
