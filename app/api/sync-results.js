// Robô de resultados — corre todos os dias (Vercel Cron, ver vercel.json).
// Preenche os resultados de jornadas já fechadas, a partir do zerozero.
//   /api/sync-results?ping=1      → só testa se o Vercel consegue ler o zerozero (sem BD)
//   /api/sync-results?key=SEGREDO → corre já (manual)
import { createClient } from '@supabase/supabase-js'
import { fetchJornadaPage, findGame, parseGames } from './_zz.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const MAX_PAGES = 8 // ponytail: ~1,2 s por página; 8 cabem nos 60 s da função

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')

  if (url.searchParams.get('ping')) {
    const { status, html } = await fetchJornadaPage(1)
    return res.status(200).json({ zerozero: status, jogos_lidos: parseGames(html).length })
  }

  const secret = process.env.CRON_SECRET
  const okAuth = secret && (req.headers.authorization === `Bearer ${secret}` || url.searchParams.get('key') === secret)
  if (!okAuth) return res.status(401).json({ error: 'não autorizado' })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supaUrl = process.env.VITE_SUPABASE_URL
  if (!serviceKey || !supaUrl) return res.status(500).json({ error: 'faltam SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_URL' })
  const db = createClient(supaUrl, serviceKey, { auth: { persistSession: false } })

  const { data: jornadas, error: e1 } = await db.from('jornadas').select('id, number').lt('deadline', new Date().toISOString())
  if (e1) return res.status(500).json({ error: e1.message })
  if (!jornadas?.length) return res.json({ atualizados: 0, msg: 'sem jornadas fechadas' })

  const { data: pending, error: e2 } = await db.from('matches')
    .select('id, jornada_id, home_team_id, away_team_id')
    .in('jornada_id', jornadas.map((j) => j.id))
    .or('home_score.is.null,away_score.is.null')
  if (e2) return res.status(500).json({ error: e2.message })
  if (!pending?.length) return res.json({ atualizados: 0, msg: 'nada por lançar' })

  const { data: teams } = await db.from('teams').select('id, name')
  const teamName = Object.fromEntries((teams ?? []).map((t) => [t.id, t.name]))
  const numberOf = Object.fromEntries(jornadas.map((j) => [j.id, j.number]))

  // a página N do zerozero traz a jornada N e a N+1 → pedir N-1 e N cobre diferenças de ±1 na numeração
  const pages = new Set()
  for (const m of pending) { const n = numberOf[m.jornada_id]; pages.add(Math.max(1, n - 1)); pages.add(n) }
  const zz = []
  for (const n of [...pages].sort((a, b) => b - a).slice(0, MAX_PAGES)) {
    const { status, html } = await fetchJornadaPage(n)
    if (status !== 200) return res.status(502).json({ error: `zerozero respondeu ${status}` })
    zz.push(...parseGames(html).filter((g) => g.homeScore !== null))
    await sleep(1200) // o zerozero devolve páginas vazias a pedidos seguidos
  }

  const atualizados = [], semResultado = []
  for (const m of pending) {
    const home = teamName[m.home_team_id], away = teamName[m.away_team_id]
    const g = findGame(home, away, zz)
    if (!g) { semResultado.push(`${home} vs ${away}`); continue }
    const { error } = await db.from('matches').update({ home_score: g.homeScore, away_score: g.awayScore }).eq('id', m.id)
    if (error) semResultado.push(`${home} vs ${away} (erro: ${error.message})`)
    else atualizados.push(`${home} ${g.homeScore}-${g.awayScore} ${away}`)
  }

  return res.json({ atualizados: atualizados.length, jogos: atualizados, ainda_sem_resultado: semResultado })
}
