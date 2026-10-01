// Lógica pura do robô de resultados: extrair jogos do zerozero e emparelhar com os nossos.
// Corre no PC (o zerozero bloqueia IPs de servidores cloud como o Vercel — testado: 403).

// Época 2026/27 — mudar no início de cada época (ver docs/zerozero-robot.md)
export const ZZ_EDICAO = '226029'
export const ZZ_FASE = '250699'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36'

export async function fetchJornadaPage(n) {
  const url = `https://www.zerozero.pt/edition.php?id_edicao=${ZZ_EDICAO}&fase=${ZZ_FASE}&jornada_in=${n}`
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'pt-PT,pt;q=0.9' } })
  return { status: r.status, html: await r.text() }
}

// Jogos jogados → class="result" com "H-A"; por jogar → class="vs" com a hora.
export function parseGames(html) {
  const out = []
  const GAME = /<td id="tdl_(\d+)" class="(?:result|vs)[^"]*"><a href="\/jogo\/(\d{4}-\d{2}-\d{2})[^"]*">\s*([^<]*?)\s*<\/a><\/td>/g
  const TEAM = /<td class="text"[^>]*><a href="\/equipa\/[^/]+\/(\d+)[^"]*">(?:<b>)?([^<]+?)(?:<\/b>)?<\/a>/g
  let m
  while ((m = GAME.exec(html))) {
    const [full, gameId, date, content] = m
    const sc = content.match(/^(\d+)\s*-\s*(\d+)$/)
    const homeM = [...html.slice(Math.max(0, m.index - 800), m.index).matchAll(TEAM)].pop()
    const awayM = [...html.slice(m.index + full.length, m.index + full.length + 800).matchAll(TEAM)][0]
    if (!homeM || !awayM) continue
    out.push({
      gameId, date,
      homeName: homeM[2].trim(), awayName: awayM[2].trim(),
      homeScore: sc ? Number(sc[1]) : null, awayScore: sc ? Number(sc[2]) : null,
    })
  }
  return out
}

// Siglas e palavras que variam entre fontes (FPF diz "Fc Tadim", zerozero "FC Tadim", etc.)
const STOP = new Set(['fc', 'cf', 'ad', 'gd', 'dr', 'ac', 'ass', 'cd', 'ud', 'sc', 'gfc', 'acdr', 'cdrc', 'gcdr',
  'acd', 'grc', 'gdr', 'ccd', 'ccr', 'agd', 'sd', 'cr', 'do', 'da', 'de', 'dos', 'das', 'e', 'futebol', 'clube'])

export function tokens(name) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((t) => t && !STOP.has(t))
}

export function similarity(a, b) {
  const A = new Set(tokens(a)), B = new Set(tokens(b))
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  return inter / (A.size + B.size - inter)
}

// Casa e fora têm de bater ambos (≥ 0.5); numa época a duas voltas o par (casa, fora) é único.
export function findGame(homeName, awayName, zzGames) {
  let best = null, bestScore = 0
  for (const g of zzGames) {
    const s = Math.min(similarity(homeName, g.homeName), similarity(awayName, g.awayName))
    if (s > bestScore) { best = g; bestScore = s }
  }
  return bestScore >= 0.5 ? best : null
}
