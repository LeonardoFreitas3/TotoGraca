import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import {
  ADEPTO_COTA,
  COTA_CODE,
  JORNADA_CODE,
  COTA_VALUE,
  CURRENT_SEASON,
  matchResult,
  type Fine,
  type Jornada,
  type Match,
  type Pick,
  type Staff,
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
  meEmail: string | null
  users: User[]
  teams: Team[]
  jornadas: Jornada[]
  matches: Match[]
  tips: { id: string; userId: string; matchId: string; pick: Pick }[]
  fines: Fine[]
  staff: Staff[]
}

let cache: Cache = { ready: false, meId: null, meEmail: null, users: [], teams: [], jornadas: [], matches: [], tips: [], fines: [], staff: [] }

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
  const [profiles, teams, jornadas, matches, tips, fines, staff, contacts] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('teams').select('*'),
    supabase.from('jornadas').select('*'),
    supabase.from('matches').select('*').order('created_at').order('id'), // ordem fixa: "Jogo 1..N" não pode mudar após edições (importação dá o mesmo created_at)
    supabase.from('tips').select('*'),
    supabase.from('fines').select('*'), // RLS: admin recebe tudo, jogador só as suas
    supabase.from('staff').select('*'), // RLS: só admin
    supabase.rpc('adepto_contacts'), // emails: só admin recebe
  ])

  const email = new Map<string, string>((contacts.data ?? []).map((c: { id: string; email: string }) => [c.id, c.email]))
  cache.users = (profiles.data ?? []).map((p): User => ({ id: p.id, name: p.name, role: p.role, status: p.status, email: email.get(p.id) }))
  cache.teams = (teams.data ?? []).map((t): Team => ({ id: t.id, name: t.name, season: t.season }))
  cache.jornadas = (jornadas.data ?? []).map((j): Jornada => ({ id: j.id, number: j.number, season: j.season, deadline: j.deadline }))
  cache.matches = (matches.data ?? []).map((m): Match => ({
    id: m.id, jornadaId: m.jornada_id, homeTeamId: m.home_team_id, awayTeamId: m.away_team_id,
    homeScore: m.home_score, awayScore: m.away_score, postponed: m.postponed ?? false,
  }))
  cache.tips = (tips.data ?? []).map((t) => ({ id: t.id, userId: t.user_id, matchId: t.match_id, pick: t.pick as Pick }))
  cache.fines = (fines.data ?? []).map((f): Fine => ({ id: f.id, personId: f.user_id ?? f.staff_id, staff: !f.user_id, code: f.code, amount: Number(f.amount), date: f.date, paid: f.paid, jornadaId: f.jornada_id ?? undefined }))
  cache.staff = (staff.data ?? []).map((s): Staff => ({ id: s.id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name))
  emit()
}

// ---------- arranque / sessão ----------
async function bootstrap() {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    cache.meId = data.session.user.id
    cache.meEmail = data.session.user.email ?? null
    await loadAll()
  }
  cache.ready = true
  emit()
}
bootstrap()

supabase.auth.onAuthStateChange((_event, session) => {
  const newId = session?.user.id ?? null
  cache.meEmail = session?.user.email ?? null
  if (newId !== cache.meId) {
    cache.meId = newId
    if (newId) loadAll()
    else { cache.users = []; cache.teams = []; cache.jornadas = []; cache.matches = []; cache.tips = []; cache.fines = []; cache.staff = []; emit() }
  }
})

// ---------- atualização automática ----------
// A sessão fica guardada pelo Supabase (localStorage); isto só volta a ler os dados.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && cache.meId) loadAll()
})
setInterval(() => { if (cache.meId && document.visibilityState === 'visible') loadAll() }, 5 * 60_000)
export const refresh = () => loadAll()
setInterval(emit, 60_000) // re-render: contagem decrescente e fecho às 09:00 sem recarregar

// ---------- autenticação ----------
// Login por username (nome.apelido). O email é só técnico do Supabase e nunca é mostrado.
const USERNAME_DOMAIN = 'totograca.local'
export function usernameToEmail(input: string): string {
  const s = input.trim()
  return s.includes('@') ? s : `${s.toLowerCase()}@${USERNAME_DOMAIN}`
}
export function usernameFromEmail(email: string | null): string {
  if (!email) return ''
  return email.endsWith('@' + USERNAME_DOMAIN) ? email.slice(0, -(USERNAME_DOMAIN.length + 1)) : email
}
export const currentUsername = () => usernameFromEmail(cache.meEmail)

export function currentUser(): User | null {
  return cache.users.find((u) => u.id === cache.meId) ?? null
}

export async function login(usernameOrEmail: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(usernameOrEmail), password })
  if (error || !data.session) return { ok: false, error: traduzErro(error?.message ?? 'Erro ao entrar.') }

  cache.meId = data.session.user.id
  cache.meEmail = data.session.user.email ?? null
  await loadAll()
  const me = currentUser()
  if (!me) {
    await supabase.auth.signOut(); cache.meId = null; emit()
    return { ok: false, error: 'Conta sem perfil. Fala com o admin.' }
  }
  // pendente entra (vê a jornada desfocada e trata do perfil); só rejeitado fica de fora
  if (me.status === 'rejected') {
    await supabase.auth.signOut(); cache.meId = null; emit()
    return { ok: false, error: 'Conta desativada. Fala com o admin.' }
  }
  return { ok: true }
}

// Registo de adepto com email real (sem confirmação por link). Fica pendente até o admin aprovar; role 'adepto' é o default na BD.
export async function register(name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!name.trim()) return { ok: false, error: 'Preenche o nome.' }
  if (!email.includes('@')) return { ok: false, error: 'Email inválido.' }
  const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } })
  if (error) return { ok: false, error: traduzErro(error.message) }
  await supabase.auth.signOut()
  return { ok: true }
}

export async function logout() {
  await supabase.auth.signOut()
  cache.meId = null
  cache.meEmail = null
  emit()
}

export const currentEmail = () => cache.meEmail

export async function changePassword(newPassword: string): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 6) return { ok: false, error: 'A palavra-passe tem de ter pelo menos 6 caracteres.' }
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { ok: false, error: traduzErro(error.message) }
  return { ok: true }
}

export async function updateMyName(name: string): Promise<{ ok: boolean; error?: string }> {
  if (!name.trim()) return { ok: false, error: 'O nome não pode ficar vazio.' }
  if (!cache.meId) return { ok: false, error: 'Sessão inválida.' }
  const { error } = await supabase.from('profiles').update({ name: name.trim() }).eq('id', cache.meId)
  if (error) return { ok: false, error: error.message }
  await loadAll()
  return { ok: true }
}

function traduzErro(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) return 'Utilizador ou palavra-passe errados.'
  if (/at least 6/i.test(msg)) return 'A palavra-passe tem de ter pelo menos 6 caracteres.'
  if (/already registered/i.test(msg)) return 'Já existe uma conta com esse email.'
  if (/invalid.*email/i.test(msg)) return 'Email inválido.'
  return msg
}

// ---------- utilizadores (admin) ----------
// quem aposta: jogadores do plantel e adeptos aprovados
export const approvedUsers = () => cache.users.filter((u) => u.status === 'approved' && u.role !== 'admin')
export const players = () => approvedUsers().filter((u) => u.role === 'user')
export const adeptos = () => approvedUsers().filter((u) => u.role === 'adepto')
export const pendingUsers = () => cache.users.filter((u) => u.status === 'pending')
export async function approveUser(id: string) {
  await supabase.from('profiles').update({ status: 'approved' }).eq('id', id); await loadAll()
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
  cache.jornadas.filter((j) => j.season === season).sort((a, b) => a.number - b.number)
export const getJornada = (id: string) => cache.jornadas.find((j) => j.id === id) ?? null

export function currentJornada(season = CURRENT_SEASON): Jornada | null {
  const js = listJornadas(season)
  const open = js.filter((j) => !isLocked(j))
  return open[0] ?? js[js.length - 1] ?? null
}

// Só se aposta na jornada da semana: a primeira ainda aberta
export const canBet = (j: Jornada) => !isLocked(j) && currentJornada(j.season)?.id === j.id

export function nextJornadaNumber(season = CURRENT_SEASON): number {
  const js = listJornadas(season)
  return js.length ? js[js.length - 1].number + 1 : 1
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
export async function setMatchPostponed(id: string, postponed: boolean) {
  await supabase.from('matches').update({ postponed }).eq('id', id); await loadAll()
}
// jogos que contam para a jornada (sem os adiados)
export const scoredMatches = (jornadaId: string) => listMatches(jornadaId).filter((m) => !m.postponed)
// jogo "despachado": tem resultado ou foi adiado
export const matchDone = (m: Match) => m.postponed || matchResult(m) !== null

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

// ---------- multas (admin) ----------
// month no formato YYYY-MM
// multas e cota mensal (balneário); as cotas de jornada dos adeptos ficam fora
export const listFines = (month: string) =>
  cache.fines.filter((f) => f.date.startsWith(month) && f.code !== JORNADA_CODE).sort((a, b) => a.date.localeCompare(b.date))

// equipa técnica (sem conta)
export const listStaff = () => cache.staff
export const isStaff = (personId: string) => cache.staff.some((s) => s.id === personId)
export async function addStaff(name: string) {
  if (!name.trim()) return
  await supabase.from('staff').insert({ name: name.trim() }); await loadAll()
}
export async function deleteStaff(id: string) {
  await supabase.from('staff').delete().eq('id', id); await loadAll()
}

const fineRow = (personId: string, code: string, amount: number, date: string) =>
  ({ user_id: isStaff(personId) ? null : personId, staff_id: isStaff(personId) ? personId : null, code, amount, date })

export async function addFine(personId: string, code: string, amount: number, date: string) {
  await supabase.from('fines').insert(fineRow(personId, code, amount, date)); await loadAll()
}
// lança a cota do mês a plantel e equipa técnica que ainda não a têm (adeptos pagam por jornada, não entram)
export async function addCotaToAll(month: string) {
  const have = new Set(listFines(month).filter((f) => f.code === COTA_CODE).map((f) => f.personId))
  const people = [...players().map((u) => ({ id: u.id, staff: false })), ...cache.staff.map((s) => ({ id: s.id, staff: true }))]
  const rows = people.filter((p) => !have.has(p.id)).map((p) => fineRow(p.id, COTA_CODE, COTA_VALUE, `${month}-01`))
  if (rows.length) { await supabase.from('fines').insert(rows); await loadAll() }
}
// adepto tem a cota desta jornada paga? Espelha can_bet() no servidor.
export const cotaPaid = (userId: string, j: Jornada) => cache.fines.some((f) => f.personId === userId && f.jornadaId === j.id && f.paid)
// admin recebeu o MBWay: cria a linha já paga; desmarcar apaga-a
export async function setAdeptoPaid(userId: string, jornadaId: string, paid: boolean) {
  if (paid) await supabase.from('fines').insert({ ...fineRow(userId, JORNADA_CODE, ADEPTO_COTA, new Date().toISOString().slice(0, 10)), paid: true, jornada_id: jornadaId })
  else await supabase.from('fines').delete().eq('user_id', userId).eq('jornada_id', jornadaId)
  await loadAll()
}
// por pagar (todos os meses), mais antigas primeiro
export const unpaidFines = (personId: string) =>
  cache.fines.filter((f) => f.personId === personId && !f.paid).sort((a, b) => a.date.localeCompare(b.date))
export const owedByUser = (userId: string) => unpaidFines(userId).reduce((t, f) => t + f.amount, 0)
export async function setFinePaid(id: string, paid: boolean) {
  await supabase.from('fines').update({ paid }).eq('id', id); await loadAll()
}
export async function deleteFine(id: string) {
  await supabase.from('fines').delete().eq('id', id); await loadAll()
}

// ---------- lógica ----------
export const isLocked = (j: Jornada) => Date.now() >= new Date(j.deadline).getTime()

export function jornadaHasResults(jornadaId: string): boolean {
  return scoredMatches(jornadaId).some((m) => matchResult(m) !== null)
}
export function jornadaFinished(jornadaId: string): boolean {
  const ms = listMatches(jornadaId)
  return ms.length > 0 && ms.every(matchDone) && scoredMatches(jornadaId).length > 0
}
// última jornada terminada (para o banner da página inicial)
export const lastFinishedJornada = (season = CURRENT_SEASON) =>
  listJornadas(season).filter((j) => jornadaFinished(j.id)).at(-1) ?? null

export interface ScoreResult { answered: number; total: number; correct: number; wrong: number; isWinner: boolean }

export function userScore(userId: string, jornadaId: string): ScoreResult {
  const ms = scoredMatches(jornadaId)
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
    .filter((u) => u.status === 'approved' && u.role !== 'admin')
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
