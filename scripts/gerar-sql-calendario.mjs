// Gera o SQL de importação da época a partir do JSON extraído do zerozero.
//   node scripts/gerar-sql-calendario.mjs data/calendario-2026-27.json > supabase/calendario-2026-27.sql
//
// - Os jogos da nossa equipa (Águias da Graça) ficam de fora, e a equipa não é criada.
// - Fecho de cada jornada: sábado às 09:00 (hora de Lisboa) do fim de semana do
//   primeiro jogo da jornada (se o primeiro jogo for antes de sábado, é o sábado anterior).

import { readFileSync } from 'node:fs'

const SEASON = '2026/2027'
const CLUB_ZZ_NAME = /^Águias da Graça$/i

const file = process.argv[2]
if (!file) {
  console.error('uso: node scripts/gerar-sql-calendario.mjs <calendario.json>')
  process.exit(1)
}
const cal = JSON.parse(readFileSync(file, 'utf8'))

const q = (s) => `'${String(s).replace(/'/g, "''")}'`

// Sábado (YYYY-MM-DD) do fim de semana a que a data pertence: sábado/domingo → esse fim de
// semana; segunda a sexta → sábado anterior (as apostas fecham antes do 1.º jogo).
function saturdayFor(isoDate) {
  const d = new Date(`${isoDate}T12:00:00Z`)
  const dow = d.getUTCDay()
  const back = dow === 6 ? 0 : dow === 0 ? 1 : dow + 1
  d.setUTCDate(d.getUTCDate() - back)
  return d.toISOString().slice(0, 10)
}

const teams = cal.teams.filter((t) => !CLUB_ZZ_NAME.test(t.name))
const out = []

out.push(`-- ============================================================
--  TotoGraça — CALENDÁRIO REAL ${SEASON} (AF Braga 1.ª Divisão, Série A)
--  Gerado por scripts/gerar-sql-calendario.mjs a partir de ${file}
--  (zerozero: id_edicao=${cal.id_edicao}, fase=${cal.fase}, extraído em ${cal.fetched_at})
--
--  Correr no Supabase → SQL Editor → New query → Run.
--  APAGA tudo o que houver da época ${SEASON} (inclui os exemplos e os
--  palpites desses exemplos) e cria equipas, jornadas e jogos reais.
--  Os jogos da Águias da Graça não entram.
-- ============================================================

-- ligações ao zerozero (para o robô de resultados poder atualizar sem duplicar)
alter table public.teams   add column if not exists zz_team_id int;
alter table public.matches add column if not exists zz_game_id text;

do $$
declare
  s text := ${q(SEASON)};
  j uuid;
begin
  -- limpar a época (exemplos incluídos)
  delete from public.tips    where match_id in (select m.id from public.matches m join public.jornadas jj on jj.id = m.jornada_id where jj.season = s);
  delete from public.matches where jornada_id in (select id from public.jornadas where season = s);
  delete from public.jornadas where season = s;
  delete from public.teams    where season = s;

  -- equipas
  insert into public.teams (name, season, zz_team_id) values
${teams.map((t) => `    (${q(t.name)}, s, ${Number(t.zzId)})`).join(',\n')};
`)

for (const jor of cal.jornadas) {
  const games = jor.games.filter((g) => !CLUB_ZZ_NAME.test(g.homeName) && !CLUB_ZZ_NAME.test(g.awayName))
  const dates = games.map((g) => g.date).filter(Boolean).sort()
  if (!dates.length) throw new Error(`Jornada ${jor.number} sem datas`)
  const sat = saturdayFor(dates[0])
  out.push(`
  -- Jornada ${jor.number} (1.º jogo ${dates[0]}; fecha sáb ${sat} 09:00)
  insert into public.jornadas (number, season, deadline)
    values (${jor.number}, s, (${q(`${sat} 09:00`)}::timestamp at time zone 'Europe/Lisbon')) returning id into j;
  insert into public.matches (jornada_id, home_team_id, away_team_id, home_score, away_score, zz_game_id)
  select j, h.id, a.id, v.hs, v.as_, v.gid
  from (values
${games
  .map((g) => `    (${Number(g.homeId)}, ${Number(g.awayId)}, ${g.homeScore ?? 'null::int'}, ${g.awayScore ?? 'null::int'}, ${q(g.gameId)})`)
  .join(',\n')}
  ) v(hz, az, hs, as_, gid)
  join public.teams h on h.zz_team_id = v.hz and h.season = s
  join public.teams a on a.zz_team_id = v.az and a.season = s;`)
}

out.push(`
end $$;

-- ver o que ficou criado (cada jornada deve ter ${(cal.teams.length >> 1) - 1} jogos — a Águias fica de fora):
select j.number as jornada,
       to_char(j.deadline at time zone 'Europe/Lisbon', 'Dy DD/MM HH24:MI') as fecha,
       count(m.*) as jogos
from public.jornadas j
left join public.matches m on m.jornada_id = j.id
where j.season = '${SEASON}'
group by j.id order by j.number;
`)

process.stdout.write(out.join('\n'))
