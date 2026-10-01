-- ============================================================
--  TotoGraça — IMPORTAR época 2026/2027 (dados reais do zerozero)
--  Correr no Supabase → SQL Editor → New query → Run.
--  Substitui tudo o que estava em '2026/2027'. Sem a Águias da Graça.
--  Fecho de cada jornada: sábado 09:00 (ajusta no painel se precisares).
-- ============================================================

create or replace function public.tid(p_name text, p_season text)
returns uuid language sql stable as $f$
  select id from public.teams where name = p_name and season = p_season limit 1;
$f$;

do $$
declare s text := '2026/2027';
  j1 uuid;
  j2 uuid;
  j3 uuid;
  j4 uuid;
  j5 uuid;
  j6 uuid;
  j7 uuid;
  j8 uuid;
  j9 uuid;
  j10 uuid;
  j11 uuid;
  j12 uuid;
  j13 uuid;
  j14 uuid;
  j15 uuid;
  j16 uuid;
  j17 uuid;
  j18 uuid;
  j19 uuid;
  j20 uuid;
  j21 uuid;
  j22 uuid;
  j23 uuid;
  j24 uuid;
  j25 uuid;
  j26 uuid;
  j27 uuid;
  j28 uuid;
  j29 uuid;
  j30 uuid;
begin
  delete from public.tips    where match_id in (select m.id from public.matches m join public.jornadas j on j.id = m.jornada_id where j.season = s);
  delete from public.matches where jornada_id in (select id from public.jornadas where season = s);
  delete from public.jornadas where season = s;

  insert into public.teams (name, season)
  select v.name, s from (values
    ('AC Panoiense FC'),
    ('AD Carreira'),
    ('Antas FC'),
    ('Ass. Merelim S. Paio'),
    ('Dumiense FC B'),
    ('Estrelas do Faro'),
    ('FC Tadim'),
    ('Fão'),
    ('GFC Pousa'),
    ('Granja FC'),
    ('Parada de Tibães'),
    ('Realense FC'),
    ('Sequeirense'),
    ('«Os Ceramistas»')
  ) v(name)
  where not exists (select 1 from public.teams t where t.name = v.name and t.season = s);

  insert into public.jornadas (number, season, deadline) values (1, s, '2026-10-17T09:00:00+00:00') returning id into j1;
  insert into public.jornadas (number, season, deadline) values (2, s, '2026-10-24T09:00:00+00:00') returning id into j2;
  insert into public.jornadas (number, season, deadline) values (3, s, '2026-11-07T09:00:00+00:00') returning id into j3;
  insert into public.jornadas (number, season, deadline) values (4, s, '2026-11-14T09:00:00+00:00') returning id into j4;
  insert into public.jornadas (number, season, deadline) values (5, s, '2026-11-21T09:00:00+00:00') returning id into j5;
  insert into public.jornadas (number, season, deadline) values (6, s, '2026-11-28T09:00:00+00:00') returning id into j6;
  insert into public.jornadas (number, season, deadline) values (7, s, '2026-12-05T09:00:00+00:00') returning id into j7;
  insert into public.jornadas (number, season, deadline) values (8, s, '2026-12-12T09:00:00+00:00') returning id into j8;
  insert into public.jornadas (number, season, deadline) values (9, s, '2026-12-19T09:00:00+00:00') returning id into j9;
  insert into public.jornadas (number, season, deadline) values (10, s, '2027-01-09T09:00:00+00:00') returning id into j10;
  insert into public.jornadas (number, season, deadline) values (11, s, '2027-01-16T09:00:00+00:00') returning id into j11;
  insert into public.jornadas (number, season, deadline) values (12, s, '2027-01-23T09:00:00+00:00') returning id into j12;
  insert into public.jornadas (number, season, deadline) values (13, s, '2027-02-06T09:00:00+00:00') returning id into j13;
  insert into public.jornadas (number, season, deadline) values (14, s, '2027-02-13T09:00:00+00:00') returning id into j14;
  insert into public.jornadas (number, season, deadline) values (15, s, '2027-02-20T09:00:00+00:00') returning id into j15;
  insert into public.jornadas (number, season, deadline) values (16, s, '2027-02-27T09:00:00+00:00') returning id into j16;
  insert into public.jornadas (number, season, deadline) values (17, s, '2027-03-06T09:00:00+00:00') returning id into j17;
  insert into public.jornadas (number, season, deadline) values (18, s, '2027-03-13T09:00:00+00:00') returning id into j18;
  insert into public.jornadas (number, season, deadline) values (19, s, '2027-03-20T09:00:00+00:00') returning id into j19;
  insert into public.jornadas (number, season, deadline) values (20, s, '2027-04-03T09:00:00+00:00') returning id into j20;
  insert into public.jornadas (number, season, deadline) values (21, s, '2027-04-10T09:00:00+00:00') returning id into j21;
  insert into public.jornadas (number, season, deadline) values (22, s, '2027-04-17T09:00:00+00:00') returning id into j22;
  insert into public.jornadas (number, season, deadline) values (23, s, '2027-04-24T09:00:00+00:00') returning id into j23;
  insert into public.jornadas (number, season, deadline) values (24, s, '2027-05-01T09:00:00+00:00') returning id into j24;
  insert into public.jornadas (number, season, deadline) values (25, s, '2027-05-08T09:00:00+00:00') returning id into j25;
  insert into public.jornadas (number, season, deadline) values (26, s, '2027-05-15T09:00:00+00:00') returning id into j26;
  insert into public.jornadas (number, season, deadline) values (27, s, '2027-05-22T09:00:00+00:00') returning id into j27;
  insert into public.jornadas (number, season, deadline) values (28, s, '2027-05-22T09:00:00+00:00') returning id into j28;
  insert into public.jornadas (number, season, deadline) values (29, s, '2027-05-29T09:00:00+00:00') returning id into j29;
  insert into public.jornadas (number, season, deadline) values (30, s, '2027-06-05T09:00:00+00:00') returning id into j30;

  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j1, tid('Estrelas do Faro', s), tid('Realense FC', s)),
    (j1, tid('AC Panoiense FC', s), tid('Fão', s)),
    (j1, tid('Sequeirense', s), tid('Parada de Tibães', s)),
    (j1, tid('AD Carreira', s), tid('Antas FC', s)),
    (j1, tid('Granja FC', s), tid('GFC Pousa', s)),
    (j1, tid('«Os Ceramistas»', s), tid('Ass. Merelim S. Paio', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j2, tid('Parada de Tibães', s), tid('AC Panoiense FC', s)),
    (j2, tid('Antas FC', s), tid('Sequeirense', s)),
    (j2, tid('GFC Pousa', s), tid('AD Carreira', s)),
    (j2, tid('Ass. Merelim S. Paio', s), tid('Granja FC', s)),
    (j2, tid('Realense FC', s), tid('Dumiense FC B', s)),
    (j2, tid('FC Tadim', s), tid('Estrelas do Faro', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j3, tid('Fão', s), tid('Parada de Tibães', s)),
    (j3, tid('AC Panoiense FC', s), tid('Antas FC', s)),
    (j3, tid('Sequeirense', s), tid('GFC Pousa', s)),
    (j3, tid('AD Carreira', s), tid('Ass. Merelim S. Paio', s)),
    (j3, tid('«Os Ceramistas»', s), tid('Realense FC', s)),
    (j3, tid('Dumiense FC B', s), tid('FC Tadim', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j4, tid('Antas FC', s), tid('Fão', s)),
    (j4, tid('GFC Pousa', s), tid('AC Panoiense FC', s)),
    (j4, tid('Ass. Merelim S. Paio', s), tid('Sequeirense', s)),
    (j4, tid('Realense FC', s), tid('Granja FC', s)),
    (j4, tid('FC Tadim', s), tid('«Os Ceramistas»', s)),
    (j4, tid('Estrelas do Faro', s), tid('Dumiense FC B', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j5, tid('Parada de Tibães', s), tid('Antas FC', s)),
    (j5, tid('Fão', s), tid('GFC Pousa', s)),
    (j5, tid('AC Panoiense FC', s), tid('Ass. Merelim S. Paio', s)),
    (j5, tid('AD Carreira', s), tid('Realense FC', s)),
    (j5, tid('Granja FC', s), tid('FC Tadim', s)),
    (j5, tid('«Os Ceramistas»', s), tid('Estrelas do Faro', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j6, tid('GFC Pousa', s), tid('Parada de Tibães', s)),
    (j6, tid('Ass. Merelim S. Paio', s), tid('Fão', s)),
    (j6, tid('Realense FC', s), tid('Sequeirense', s)),
    (j6, tid('FC Tadim', s), tid('AD Carreira', s)),
    (j6, tid('Estrelas do Faro', s), tid('Granja FC', s)),
    (j6, tid('Dumiense FC B', s), tid('«Os Ceramistas»', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j7, tid('Antas FC', s), tid('GFC Pousa', s)),
    (j7, tid('Parada de Tibães', s), tid('Ass. Merelim S. Paio', s)),
    (j7, tid('AC Panoiense FC', s), tid('Realense FC', s)),
    (j7, tid('Sequeirense', s), tid('FC Tadim', s)),
    (j7, tid('AD Carreira', s), tid('Estrelas do Faro', s)),
    (j7, tid('Granja FC', s), tid('Dumiense FC B', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j8, tid('Ass. Merelim S. Paio', s), tid('Antas FC', s)),
    (j8, tid('Realense FC', s), tid('Fão', s)),
    (j8, tid('FC Tadim', s), tid('AC Panoiense FC', s)),
    (j8, tid('Estrelas do Faro', s), tid('Sequeirense', s)),
    (j8, tid('Dumiense FC B', s), tid('AD Carreira', s)),
    (j8, tid('«Os Ceramistas»', s), tid('Granja FC', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j9, tid('GFC Pousa', s), tid('Ass. Merelim S. Paio', s)),
    (j9, tid('Parada de Tibães', s), tid('Realense FC', s)),
    (j9, tid('Fão', s), tid('FC Tadim', s)),
    (j9, tid('AC Panoiense FC', s), tid('Estrelas do Faro', s)),
    (j9, tid('Sequeirense', s), tid('Dumiense FC B', s)),
    (j9, tid('AD Carreira', s), tid('«Os Ceramistas»', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j10, tid('Realense FC', s), tid('Antas FC', s)),
    (j10, tid('FC Tadim', s), tid('Parada de Tibães', s)),
    (j10, tid('Estrelas do Faro', s), tid('Fão', s)),
    (j10, tid('Dumiense FC B', s), tid('AC Panoiense FC', s)),
    (j10, tid('«Os Ceramistas»', s), tid('Sequeirense', s)),
    (j10, tid('Granja FC', s), tid('AD Carreira', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j11, tid('GFC Pousa', s), tid('Realense FC', s)),
    (j11, tid('Antas FC', s), tid('FC Tadim', s)),
    (j11, tid('Parada de Tibães', s), tid('Estrelas do Faro', s)),
    (j11, tid('Fão', s), tid('Dumiense FC B', s)),
    (j11, tid('AC Panoiense FC', s), tid('«Os Ceramistas»', s)),
    (j11, tid('Sequeirense', s), tid('Granja FC', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j12, tid('Realense FC', s), tid('Ass. Merelim S. Paio', s)),
    (j12, tid('FC Tadim', s), tid('GFC Pousa', s)),
    (j12, tid('Estrelas do Faro', s), tid('Antas FC', s)),
    (j12, tid('Dumiense FC B', s), tid('Parada de Tibães', s)),
    (j12, tid('«Os Ceramistas»', s), tid('Fão', s)),
    (j12, tid('Granja FC', s), tid('AC Panoiense FC', s)),
    (j12, tid('AD Carreira', s), tid('Sequeirense', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j13, tid('Ass. Merelim S. Paio', s), tid('FC Tadim', s)),
    (j13, tid('GFC Pousa', s), tid('Estrelas do Faro', s)),
    (j13, tid('Antas FC', s), tid('Dumiense FC B', s)),
    (j13, tid('Parada de Tibães', s), tid('«Os Ceramistas»', s)),
    (j13, tid('Fão', s), tid('Granja FC', s)),
    (j13, tid('AC Panoiense FC', s), tid('AD Carreira', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j14, tid('Estrelas do Faro', s), tid('Ass. Merelim S. Paio', s)),
    (j14, tid('Dumiense FC B', s), tid('GFC Pousa', s)),
    (j14, tid('«Os Ceramistas»', s), tid('Antas FC', s)),
    (j14, tid('Granja FC', s), tid('Parada de Tibães', s)),
    (j14, tid('AD Carreira', s), tid('Fão', s)),
    (j14, tid('Sequeirense', s), tid('AC Panoiense FC', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j15, tid('Realense FC', s), tid('FC Tadim', s)),
    (j15, tid('Ass. Merelim S. Paio', s), tid('Dumiense FC B', s)),
    (j15, tid('GFC Pousa', s), tid('«Os Ceramistas»', s)),
    (j15, tid('Antas FC', s), tid('Granja FC', s)),
    (j15, tid('Parada de Tibães', s), tid('AD Carreira', s)),
    (j15, tid('Fão', s), tid('Sequeirense', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j16, tid('Fão', s), tid('AC Panoiense FC', s)),
    (j16, tid('Parada de Tibães', s), tid('Sequeirense', s)),
    (j16, tid('Antas FC', s), tid('AD Carreira', s)),
    (j16, tid('GFC Pousa', s), tid('Granja FC', s)),
    (j16, tid('Ass. Merelim S. Paio', s), tid('«Os Ceramistas»', s)),
    (j16, tid('Realense FC', s), tid('Estrelas do Faro', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j17, tid('AC Panoiense FC', s), tid('Parada de Tibães', s)),
    (j17, tid('Sequeirense', s), tid('Antas FC', s)),
    (j17, tid('AD Carreira', s), tid('GFC Pousa', s)),
    (j17, tid('Granja FC', s), tid('Ass. Merelim S. Paio', s)),
    (j17, tid('Dumiense FC B', s), tid('Realense FC', s)),
    (j17, tid('Estrelas do Faro', s), tid('FC Tadim', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j18, tid('Parada de Tibães', s), tid('Fão', s)),
    (j18, tid('Antas FC', s), tid('AC Panoiense FC', s)),
    (j18, tid('GFC Pousa', s), tid('Sequeirense', s)),
    (j18, tid('Ass. Merelim S. Paio', s), tid('AD Carreira', s)),
    (j18, tid('Realense FC', s), tid('«Os Ceramistas»', s)),
    (j18, tid('FC Tadim', s), tid('Dumiense FC B', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j19, tid('Fão', s), tid('Antas FC', s)),
    (j19, tid('AC Panoiense FC', s), tid('GFC Pousa', s)),
    (j19, tid('Sequeirense', s), tid('Ass. Merelim S. Paio', s)),
    (j19, tid('Granja FC', s), tid('Realense FC', s)),
    (j19, tid('«Os Ceramistas»', s), tid('FC Tadim', s)),
    (j19, tid('Dumiense FC B', s), tid('Estrelas do Faro', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j20, tid('Antas FC', s), tid('Parada de Tibães', s)),
    (j20, tid('GFC Pousa', s), tid('Fão', s)),
    (j20, tid('Ass. Merelim S. Paio', s), tid('AC Panoiense FC', s)),
    (j20, tid('Realense FC', s), tid('AD Carreira', s)),
    (j20, tid('FC Tadim', s), tid('Granja FC', s)),
    (j20, tid('Estrelas do Faro', s), tid('«Os Ceramistas»', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j21, tid('Parada de Tibães', s), tid('GFC Pousa', s)),
    (j21, tid('Fão', s), tid('Ass. Merelim S. Paio', s)),
    (j21, tid('Sequeirense', s), tid('Realense FC', s)),
    (j21, tid('AD Carreira', s), tid('FC Tadim', s)),
    (j21, tid('Granja FC', s), tid('Estrelas do Faro', s)),
    (j21, tid('«Os Ceramistas»', s), tid('Dumiense FC B', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j22, tid('GFC Pousa', s), tid('Antas FC', s)),
    (j22, tid('Ass. Merelim S. Paio', s), tid('Parada de Tibães', s)),
    (j22, tid('Realense FC', s), tid('AC Panoiense FC', s)),
    (j22, tid('FC Tadim', s), tid('Sequeirense', s)),
    (j22, tid('Estrelas do Faro', s), tid('AD Carreira', s)),
    (j22, tid('Dumiense FC B', s), tid('Granja FC', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j23, tid('Antas FC', s), tid('Ass. Merelim S. Paio', s)),
    (j23, tid('Fão', s), tid('Realense FC', s)),
    (j23, tid('AC Panoiense FC', s), tid('FC Tadim', s)),
    (j23, tid('Sequeirense', s), tid('Estrelas do Faro', s)),
    (j23, tid('AD Carreira', s), tid('Dumiense FC B', s)),
    (j23, tid('Granja FC', s), tid('«Os Ceramistas»', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j24, tid('Ass. Merelim S. Paio', s), tid('GFC Pousa', s)),
    (j24, tid('Realense FC', s), tid('Parada de Tibães', s)),
    (j24, tid('FC Tadim', s), tid('Fão', s)),
    (j24, tid('Estrelas do Faro', s), tid('AC Panoiense FC', s)),
    (j24, tid('Dumiense FC B', s), tid('Sequeirense', s)),
    (j24, tid('«Os Ceramistas»', s), tid('AD Carreira', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j25, tid('Antas FC', s), tid('Realense FC', s)),
    (j25, tid('Parada de Tibães', s), tid('FC Tadim', s)),
    (j25, tid('Fão', s), tid('Estrelas do Faro', s)),
    (j25, tid('AC Panoiense FC', s), tid('Dumiense FC B', s)),
    (j25, tid('Sequeirense', s), tid('«Os Ceramistas»', s)),
    (j25, tid('AD Carreira', s), tid('Granja FC', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j26, tid('Realense FC', s), tid('GFC Pousa', s)),
    (j26, tid('FC Tadim', s), tid('Antas FC', s)),
    (j26, tid('Estrelas do Faro', s), tid('Parada de Tibães', s)),
    (j26, tid('Dumiense FC B', s), tid('Fão', s)),
    (j26, tid('«Os Ceramistas»', s), tid('AC Panoiense FC', s)),
    (j26, tid('Granja FC', s), tid('Sequeirense', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j27, tid('Ass. Merelim S. Paio', s), tid('Realense FC', s)),
    (j27, tid('GFC Pousa', s), tid('FC Tadim', s)),
    (j27, tid('Antas FC', s), tid('Estrelas do Faro', s)),
    (j27, tid('Parada de Tibães', s), tid('Dumiense FC B', s)),
    (j27, tid('Fão', s), tid('«Os Ceramistas»', s)),
    (j27, tid('AC Panoiense FC', s), tid('Granja FC', s)),
    (j27, tid('Sequeirense', s), tid('AD Carreira', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j28, tid('FC Tadim', s), tid('Ass. Merelim S. Paio', s)),
    (j28, tid('Estrelas do Faro', s), tid('GFC Pousa', s)),
    (j28, tid('Dumiense FC B', s), tid('Antas FC', s)),
    (j28, tid('«Os Ceramistas»', s), tid('Parada de Tibães', s)),
    (j28, tid('Granja FC', s), tid('Fão', s)),
    (j28, tid('AD Carreira', s), tid('AC Panoiense FC', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j29, tid('Ass. Merelim S. Paio', s), tid('Estrelas do Faro', s)),
    (j29, tid('GFC Pousa', s), tid('Dumiense FC B', s)),
    (j29, tid('Antas FC', s), tid('«Os Ceramistas»', s)),
    (j29, tid('Parada de Tibães', s), tid('Granja FC', s)),
    (j29, tid('Fão', s), tid('AD Carreira', s)),
    (j29, tid('AC Panoiense FC', s), tid('Sequeirense', s));
  insert into public.matches (jornada_id, home_team_id, away_team_id) values
    (j30, tid('FC Tadim', s), tid('Realense FC', s)),
    (j30, tid('Dumiense FC B', s), tid('Ass. Merelim S. Paio', s)),
    (j30, tid('«Os Ceramistas»', s), tid('GFC Pousa', s)),
    (j30, tid('Granja FC', s), tid('Antas FC', s)),
    (j30, tid('AD Carreira', s), tid('Parada de Tibães', s)),
    (j30, tid('Sequeirense', s), tid('Fão', s));
end $$;

drop function if exists public.tid(text, text);

select j.number as jornada, count(m.*) as jogos
from public.jornadas j left join public.matches m on m.jornada_id = j.id
where j.season = '2026/2027' group by j.number order by j.number;
