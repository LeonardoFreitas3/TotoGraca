import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import {
  CURRENT_SEASON,
  matchResult,
  type Jornada,
  type Match,
  type Pick,
  type Team,
  type User,
} from './types'

// ============================================================
//  Camada de dados ligada ao Supabase, com uma cache local
//  reativa. As páginas continuam a ler de forma síncrona (cache);
//  as escritas vão ao Supabase e depois recarregam a cache.
// ============================================================

interface Cache {
  ready: boolean
  meId: string | null
  users: User[]
  teams: Team[]
  jornadas: Jornada[]
  matches: Match[]
  tips: { id: string; userId: string; matchId: string; pick: Pick }[]
}

let cache: Cache = { ready: false, meId: null, users: [], teams: [], jornadas: [], matches: [], tips: [] }

const listeners = new Set<() => void>()
function emit() {
  cache = { ...cache }
  listeners.forEach((l) => l())
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}
export function useDB(): Cache {
  return useSyncExternalStore(subscribe, () => cache)
}

// ---------- carregar dados ----------
async function loadAll() {
  const [profiles, teams, jornadas, matches, tips] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('teams').select('*'),
    supabase.from('jornadas').select('*'),
    supabase.from('matches').select('*'),
    supabase.from('tips').select('*'),
  ])

  cache.users = (profiles.data ?? []).map((p): User => ({ id: p.id, name: p.name, role: p.role, status: p.status }))
  cache.teams = (teams.data ?? []).map((t): Team => ({ id: t.id, name: t.name, season: t.season }))
  cache.jornadas = (jornadas.data ?? []).map((j): Jornada => ({ id: j.id, number: j.number, season: j.season, deadline: j.deadline }))
  cache.matches = (matches.data ?? []).map((m): Match => ({
    id: m.id, jornadaId: m.jornada_id, homeTeamId: m.home_team_id, awayTeamId: m.away_team_id,
    homeScore: m.home_score, awayScore: m.away_score,
  }))
  cache.tips = (tips.data ?? []).map((t) => ({ id: t.id, userId: t.user_id, matchId: t.match_id, pick: t.pick as Pick }))
  emit()
}

// ---------- arranque / sessão ----------
async function bootstrap() {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    cache.meId = data.session.user.id
    await loadAll()
  }
  cache.ready = true
  emit()
}
bootstrap()

supabase.auth.onAuthStateChange((_event, session) => {
  const newId = session?.user.id ?? null
  if (newId !== cache.meId) {
    cache.meId = newId
    if (newId) loadAll()
    else { cache.users = []; cache.teams = []; cache.jornadas = []; cache.matches = []; cache.tips = []; emit() }
  }
})

// ---------- autenticação ----------
export function currentUser(): User | null {
  return cache.users.find((u) => u.id === cache.meId) ?? null
}

export async function register(name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!name.trim() || !email.trim() || !password) return { ok: false, error: 'Preenche todos os campos.' }
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim() } },
  })
  if (error) return { ok: false, error: traduzErro(error.message) }
  // não deixamos entrar já — fica pendente de aprovação
  await supabase.auth.signOut()
  cache.meId = null
  return { ok: true }
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error || !data.session) return { ok: false, error: traduzErro(error?.message ?? 'Erro ao entrar.') }

  cache.meId = data.session.user.id
  await loadAll()
  const me = currentUser()
  if (!me) {
    await supabase.auth.signOut(); cache.meId = null; emit()
    return { ok: false, error: 'Conta sem perfil. Fala com o admin.' }
  }
  if (me.role !== 'admin' && me.status !== 'approved') {
    await supabase.auth.signOut(); cache.meId = null; emit()
    const msg = me.status === 'rejected' ? 'O teu registo foi recusado.' : 'A tua conta ainda está à espera de aprovação do admin.'
    return { ok: false, error: msg }
  }
  return { ok: true }
}

export async function logout() {
  await supabase.auth.signOut()
  cache.meId = null
  emit()
}

function traduzErro(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) return 'Email ou palavra-passe errados.'
  if (/already registered/i.test(msg)) return 'Já existe uma conta com esse email.'
  if (/at least 6/i.test(msg)) return 'A palavra-passe tem de ter pelo menos 6 caracteres.'
  return msg
}

// ---------- utilizadores (admin) ----------
export const pendingUsers = () => cache.users.filter((u) => u.status === 'pending')
export const approvedUsers = () => cache.users.filter((u) => u.status === 'approved' && u.role === 'user')

export async function approveUser(id: string) {
  await supabase.from('profiles').update({ status: 'approved' }).eq('id', id); await loadAll()
}
export async function rejectUser(id: string) {
  await supabase.from('profiles').update({ status: 'rejected' }).eq('id', id); await loadAll()
}
export async function deleteUser(id: string) {
  await supabase.from('profiles').delete().eq('id', id); await loadAll()
}

// ---------- equipas ----------
export const listTeams = (season = CURRENT_SEASON) =>
  cache.teams.filter((t) => t.season === season).sort((a, b) => a.name.localeCompare(b.name))
export const teamName = (id: string) => cache.teams.find((t) => t.id === id)?.name ?? '?'

export async function addTeam(name: string, season = CURRENT_SEASON) {
  if (!name.trim()) return
  await supabase.from('teams').insert({ name: name.trim(), season }); await loadAll()
}
export async function deleteTeam(id: string) {
  await supabase.from('teams').delete().eq('id', id); await loadAll()
}

// ---------- jornadas ----------
export const listJornadas = (season = CURRENT_SEASON) =>
  cache.jornadas.filter((j) => j.season === season).sort((a, b) => b.number - a.number)
export const getJornada = (id: string) => cache.jornadas.find((j) => j.id === id) ?? null

export function currentJornada(season = CURRENT_SEASON): Jornada | null {
  const js = listJornadas(season)
  const open = js.filter((j) => !isLocked(j)).sort((a, b) => a.number - b.number)
  return open[0] ?? js[0] ?? null
}

export function nextJornadaNumber(season = CURRENT_SEASON): number {
  const js = listJornadas(season)
  return js.length ? js[0].number + 1 : 1
}

export async function addJornada(number: number, deadline: string, season = CURRENT_SEASON): Promise<Jornada | null> {
  const { data } = await supabase.from('jornadas').insert({ number, deadline, season }).select().single()
  await loadAll()
  if (!data) return null
  return { id: data.id, number: data.number, season: data.season, deadline: data.deadline }
}
export async function updateJornadaDeadline(id: string, deadline: string) {
  await supabase.from('jornadas').update({ deadline }).eq('id', id); await loadAll()
}
export async function deleteJornada(id: string) {
  await supabase.from('jornadas').delete().eq('id', id); await loadAll()
}

// ---------- jogos ----------
export const listMatches = (jornadaId: string) => cache.matches.filter((m) => m.jornadaId === jornadaId)

export async function addMatch(jornadaId: string, homeTeamId: string, awayTeamId: string) {
  await supabase.from('matches').insert({ jornada_id: jornadaId, home_team_id: homeTeamId, away_team_id: awayTeamId })
  await loadAll()
}
export async function deleteMatch(id: string) {
  await supabase.from('matches').delete().eq('id', id); await loadAll()
}
export async function setMatchScore(id: string, home: number | null, away: number | null) {
  await supabase.from('matches').update({ home_score: home, away_score: away }).eq('id', id); await loadAll()
}

// ---------- palpites ----------
export const getTip = (userId: string, matchId: string) =>
  cache.tips.find((t) => t.userId === userId && t.matchId === matchId) ?? null

export async function setTip(userId: string, matchId: string, pick: Pick): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('tips').upsert(
    { user_id: userId, match_id: matchId, pick },
    { onConflict: 'user_id,match_id' },
  )
  if (error) return { ok: false, error: 'As apostas desta jornada já estão fechadas.' }
  await loadAll()
  return { ok: true }
}

export function userTipsForJornada(userId: string, jornadaId: string): Record<string, Pick> {
  const ids = listMatches(jornadaId).map((m) => m.id)
  const out: Record<string, Pick> = {}
  cache.tips.filter((t) => t.userId === userId && ids.includes(t.matchId)).forEach((t) => { out[t.matchId] = t.pick })
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
  const isWinner = jornadaFinished(jornadaId) && answered === ms.length && ms.length > 0 && correct === ms.length
  return { answered, total: ms.length, correct, wrong, isWinner }
}

export function winnersForJornada(jornadaId: string): User[] {
  if (!jornadaFinished(jornadaId)) return []
  return cache.users
    .filter((u) => u.status === 'approved')
    .filter((u) => userScore(u.id, jornadaId).isWinner)
}

export interface SeasonRow { user: User; wins: number }
export function seasonRanking(season = CURRENT_SEASON): SeasonRow[] {
  const finished = listJornadas(season).filter((j) => jornadaFinished(j.id))
  const rows = cache.users
    .filter((u) => u.status === 'approved' && u.role === 'user')
    .map((user) => ({
      user,
      wins: finished.filter((j) => userScore(user.id, j.id).isWinner).length,
    }))
  return rows.sort((a, b) => b.wins - a.wins || a.user.name.localeCompare(b.user.name))
}

// helper de prazos (sábado às 09:00) — usado pelo admin ao criar jornadas
export function nextSaturday9(from = new Date()): string {
  const d = new Date(from)
  const day = d.getDay()
  let add = (6 - day + 7) % 7
  if (add === 0 && (d.getHours() > 9 || (d.getHours() === 9 && d.getMinutes() > 0))) add = 7
  d.setDate(d.getDate() + add)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}
