-- ============================================================
--  TotoGraça — 2 JORNADAS DE EXEMPLO (para testar o aspeto)
--  Correr no Supabase → SQL Editor → New query → Run.
--  É seguro correr várias vezes (limpa e recria).
--
--  Jornada 1 = TERMINADA (com resultados + vencedor)
--  Jornada 2 = A APOSTAR (fecha no próximo sábado às 09:00)
--
--  >>> Para APAGAR estes exemplos quando vier a época nova,
--      corre o ficheiro  apagar-exemplos.sql
-- ============================================================

-- função auxiliar temporária: id da equipa pelo nome
create or replace function public.tid(p_name text, p_season text)
returns uuid language sql stable as $f$
  select id from public.teams where name = p_name and season = p_season limit 1;
$f$;

do $$
declare
  s    text := '2026/2027';
  j1   uuid;
  j2   uuid;
  leo  uuid;
  lelo uuid;
  sat  timestamptz;
begin
  select id into leo  from public.profiles where name = 'leo'  limit 1;
  select id into lelo from public.profiles where name = 'lelo' limit 1;

  -- próximo sábado às 09:00 (hora de Lisboa ≈ 08:00 UTC)
  sat := date_trunc('day', now()) + (((6 - extract(dow from now())::int) + 7) % 7) * interval '1 day' + interval '8 hour';
  if sat <= now() then sat := sat + interval '7 day'; end if;

  -- limpar exemplos anteriores desta época
  delete from public.tips    where match_id in (select m.id from public.matches m join public.jornadas j on j.id = m.jornada_id where j.season = s);
  delete from public.matches where jornada_id in (select id from public.jornadas where season = s);
  delete from public.jornadas where season = s;

  -- garantir as equipas (só insere as que faltarem)
  insert into public.teams (name, season)
  select v.name, s from (values
    ('UD São Veríssimo'),('«Os Ceramistas»'),('FC Tadim'),
    ('Sequeirense'),('Fão'),('Antas FC'),('Realense FC'),('Granja FC'),
    ('Estrelas do Faro'),('Parada de Tibães'),('CD Celeirós B'),('Panoiense FC'),('Dumiense FC B')
  ) v(name)
  where not exists (select 1 from public.teams t where t.name = v.name and t.season = s);

  -- jornadas
  insert into public.jornadas (number, season, deadline) values (1, s, now() - interval '7 day') returning id into j1;
  insert into public.jornadas (number, season, deadline) values (2, s, sat)                   returning id into j2;

  -- ---- Jornada 1 (terminada, com resultados) — sem a Águias ----
  insert into public.matches (jornada_id, home_team_id, away_team_id, home_score, away_score) values
    (j1, tid('UD São Veríssimo', s), tid('Fão', s),               2, 0),
    (j1, tid('Realense FC', s),      tid('Granja FC', s),          1, 1),
    (j1, tid('Sequeirense', s),      tid('CD Celeirós B', s),      0, 1),
    (j1, tid('Antas FC', s),         tid('Panoiense FC', s),       3, 1),
    (j1, tid('FC Tadim', s),         tid('Parada de Tibães', s),   2, 2),
    (j1, tid('Dumiense FC B', s),    tid('«Os Ceramistas»', s),    0, 3);

  -- ---- Jornada 2 (a apostar, sem resultados) — sem a Águias ----
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j2, tid('«Os Ceramistas»', s), tid('UD São Veríssimo', s)),
    (j2, tid('Fão', s),             tid('Estrelas do Faro', s)),
    (j2, tid('Granja FC', s),       tid('Antas FC', s)),
    (j2, tid('CD Celeirós B', s),   tid('FC Tadim', s)),
    (j2, tid('Panoiense FC', s),    tid('Dumiense FC B', s)),
    (j2, tid('Parada de Tibães', s),tid('Realense FC', s));

  -- ---- palpites de exemplo na Jornada 1 ----
  -- leo acertou TUDO (chave certa = vencedor)
  if leo is not null then
    insert into public.tips (user_id, match_id, pick)
    select leo, m.id, res.pick
    from public.matches m
    cross join lateral (select (case when m.home_score > m.away_score then 'V1'
                                     when m.home_score < m.away_score then 'V2' else 'X' end) as pick) res
    where m.jornada_id = j1;
  end if;

  -- lelo falhou 2 jogos (não é vencedor)
  if lelo is not null then
    insert into public.tips (user_id, match_id, pick)
    select lelo, x.id,
      case when x.rn <= 5 then x.res
           else case when x.res = 'V1' then 'V2' else 'V1' end end
    from (
      select m.id,
        (case when m.home_score > m.away_score then 'V1'
              when m.home_score < m.away_score then 'V2' else 'X' end) res,
        row_number() over (order by m.id) rn
      from public.matches m where m.jornada_id = j1
    ) x;
  end if;
end $$;

-- remover a função auxiliar
drop function if exists public.tid(text, text);

-- ver o que ficou criado:
select j.number as jornada, count(m.*) as jogos,
       count(m.home_score) as com_resultado
from public.jornadas j
left join public.matches m on m.jornada_id = j.id
where j.season = '2026/2027'
group by j.number order by j.number;
