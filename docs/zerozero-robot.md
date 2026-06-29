# Robô zerozero — importar jogos + resultados automáticos (PLANO, por ativar)

Estado: **investigação feita e extrator testado**. A construir/ativar **quando o calendário 2026/27 for publicado** na AF Braga (tipicamente ago/set).

## Porque ainda não está ativo
- A época 2026/27 ainda não foi sorteada → não há jogos para importar nem resultados para buscar.
- É *scraping* (o zerozero não tem API pública) → pode partir se o site mudar; melhor construir perto da época.

## Fonte de dados (testada e a funcionar)
Endpoint por jornada (devolve a jornada pedida + a seguinte, ~14 jogos):
```
https://www.zerozero.pt/edition.php?id_edicao=<ID_EDICAO>&fase=<FASE>&jornada_in=<N>
```
Exemplo 2025/26: `id_edicao=205653`, `fase=224182`, `N=1..26`.

Cada época tem novo `id_edicao`/`fase` — descobre-se na página da edição nova.

Notas confirmadas em testes:
- É preciso header `Accept-Language: pt-PT,pt;q=0.9` e um `User-Agent` de browser, senão vem página diferente.
- **Rate-limit**: pedidos seguidos sem pausa vêm vazios → meter pausa ~1,2 s entre pedidos.
- ⚠️ **Risco por validar**: os IPs de datacenter do Vercel podem ser bloqueados pelo zerozero. Testar no deploy real; se bloquear, usar outro executor (ex: GitHub Actions, ou um proxy).

## Extrator testado (Node, sem dependências)
Resultado do teste contra 2025/26: 14 equipas, 174/182 jogos com resultado.
A casa vem **sem** `<b>` (td com `style`), a de fora **com** `<b>` — a regex aceita ambos.

```js
function parseGames(html) {
  const out = []
  const RESULT = /<td id="tdl_(\d+)" class="result"><a href="\/jogo\/(\d{4}-\d{2}-\d{2})[^"]*">\s*(?:(\d+)\s*-\s*(\d+))?\s*<\/a><\/td>/g
  const TEAM = /<td class="text"[^>]*><a href="\/equipa\/[^/]+\/(\d+)[^"]*">(?:<b>)?([^<]+?)(?:<\/b>)?<\/a>/g
  let m
  while ((m = RESULT.exec(html))) {
    const [full, gameId, date, hs, as] = m
    const before = html.slice(Math.max(0, m.index - 800), m.index)
    const homeM = [...before.matchAll(TEAM)].pop()
    const after = html.slice(m.index + full.length, m.index + full.length + 800)
    const awayM = [...after.matchAll(TEAM)][0]
    if (!homeM || !awayM) continue
    out.push({
      gameId, date,
      homeId: homeM[1], homeName: homeM[2].trim(),
      awayId: awayM[1], awayName: awayM[2].trim(),
      homeScore: hs !== undefined ? Number(hs) : null,
      awayScore: as !== undefined ? Number(as) : null,
    })
  }
  return out
}
```
Iterar N=1..26 com pausa, deduplicar por `gameId`. Equipas "B" trazem `<span class="small_faded">B</span>` a seguir ao nome (acrescentar " B").

## Desenho robusto (decidido)
- **Importador** (1x por época, **revisto pelo admin**): cria equipas + jornadas + jogos. O agrupamento por jornada é a parte frágil (jogos adiados baralham) → o admin confirma/corrige no painel.
- **Resultados automáticos** (robusto): o robô **não** depende da estrutura das jornadas. Só emparelha cada jogo já existente na app (`home_team_id` vs `away_team_id`) com o do zerozero (por nome de equipa) e preenche o `home_score`/`away_score` em falta. Usa só nomes + placar → fiável.

## Arquitetura a construir
- Função serverless no Vercel: `app/api/sync.ts` (Node).
- Autenticação: aceita (a) JWT de admin do Supabase — para o botão "Sincronizar" no painel; ou (b) `Authorization: Bearer <CRON_SECRET>` — para o Vercel Cron.
- Escrita com a **service_role key** (ignora RLS) — só no servidor.
- Vercel Cron (em `vercel.json`) a chamar `/api/sync` nos fins de semana (ex: dom 20h, seg 10h).
- UI: botão "Sincronizar com zerozero" + data da última sincronização no painel admin.

## Variáveis de ambiente (a adicionar no Vercel quando ativar)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Settings → API → service_role (SECRETA, nunca no cliente nem no git)
- `CRON_SECRET` — segredo aleatório para o cron
- `ZZ_EDICAO_ID`, `ZZ_FASE` — da edição 2026/27
- (opcional) `ZZ_SEASON` — etiqueta da época, ex: `2026/2027`

## Esquema — colunas a juntar quando ativar (idempotência)
- `teams.zz_team_id` (int) — mapear equipa ao zerozero
- `matches.zz_game_id` (text) — mapear jogo, para atualizar resultado sem duplicar

## Checklist de ativação (quando o calendário 26/27 sair)
1. Ir à edição 26/27 no zerozero e apanhar `id_edicao` e `fase`.
2. Confirmar que o extrator ainda casa com o HTML (correr o teste).
3. Adicionar colunas `zz_*` ao Supabase.
4. Criar `app/api/sync.ts` + `vercel.json` (cron).
5. Adicionar as variáveis de ambiente no Vercel.
6. Deploy e **testar o acesso a partir do Vercel** (risco do IP). Se bloquear, mudar de executor.
7. Importar a época, o admin revê, e ligar o cron dos resultados.
