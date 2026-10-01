// Robô de resultados — preenche os resultados de jornadas já fechadas, a partir do zerozero.
// Corre no PC (agendado no Windows). Precisa em app/.env:
//   VITE_SUPABASE_URL=...            (já existe)
//   SUPABASE_SERVICE_ROLE_KEY=...    (Supabase → Project Settings → API → service_role)
// Uso:  node scripts/sync-results.mjs          (grava)
//       node scripts/sync-results.mjs --dry    (só mostra o que faria)
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'node:url'
import { fetchJornadaPage, findGame, parseGames } from './zz.js'

process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
const DRY = process.argv.includes('--dry')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (...a) => console.log(new Date().toISOString(), ...a)

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supaUrl = process.env.VITE_SUPABASE_URL
if (!serviceKey || !supaUrl) { log('ERRO: falta SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_URL em app/.env'); process.exit(1) }
const db = createClient(supaUrl, serviceKey, { auth: { persistSession: false } })

const { data: jornadas, error: e1 } = await db.from('jornadas').select('id, number').lt('deadline', new Date().toISOString())
if (e1) { log('ERRO:', e1.message); process.exit(1) }

const { data: pending, error: e2 } = jornadas.length
  ? await db.from('matches').select('id, jornada_id, home_team_id, away_team_id')
      .in('jornada_id', jornadas.map((j) => j.id)).or('home_score.is.null,away_score.is.null')
  : { data: [] }
if (e2) { log('ERRO:', e2.message); process.exit(1) }
if (!pending.length) { log('nada por lançar'); process.exit(0) }

const { data: teams } = await db.from('teams').select('id, name')
const teamName = Object.fromEntries(teams.map((t) => [t.id, t.name]))
const numberOf = Object.fromEntries(jornadas.map((j) => [j.id, j.number]))

// a página N do zerozero traz a jornada N e a N+1 → pedir N-1 e N cobre diferenças de ±1 na numeração
const pages = new Set()
for (const m of pending) { const n = numberOf[m.jornada_id]; pages.add(Math.max(1, n - 1)); pages.add(n) }
const zz = []
for (const n of pages) {
  const { status, html } = await fetchJornadaPage(n)
  if (status !== 200) { log(`ERRO: zerozero respondeu ${status} (página ${n})`); process.exit(1) }
  zz.push(...parseGames(html).filter((g) => g.homeScore !== null))
  await sleep(1200) // o zerozero devolve páginas vazias a pedidos seguidos
}

let ok = 0
for (const m of pending) {
  const home = teamName[m.home_team_id], away = teamName[m.away_team_id]
  const g = findGame(home, away, zz)
  if (!g) { log(`sem resultado ainda: ${home} vs ${away} (J${numberOf[m.jornada_id]})`); continue }
  if (!DRY) {
    const { error } = await db.from('matches').update({ home_score: g.homeScore, away_score: g.awayScore }).eq('id', m.id)
    if (error) { log(`ERRO a gravar ${home} vs ${away}: ${error.message}`); continue }
  }
  ok++
  log(`${DRY ? '[dry] ' : ''}J${numberOf[m.jornada_id]} ${home} ${g.homeScore}-${g.awayScore} ${away}`)
}
log(`feito: ${ok} resultado(s) ${DRY ? 'por gravar' : 'gravados'}, ${pending.length - ok} em falta`)
