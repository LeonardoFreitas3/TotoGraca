-- ============================================================
--  TotoGraça — jogo das Águias da Graça em cada jornada, só para adeptos.
--  Correr uma vez no SQL Editor (depois de cota-para-apostar.sql).
--  Jogadores do plantel não veem nem apostam neste jogo (não entra na chave deles);
--  adeptos apostam nele como nos outros. Resultado entra pelo robô como os restantes.
-- ============================================================

-- Procurar equipa pelo nome (a mesma função do importador; recriar não faz mal)
create or replace function public.tid(p_name text, p_season text)
returns uuid language sql stable as $f$
  select id from public.teams where name = p_name and season = p_season limit 1;
$f$;

-- A nossa equipa passa a existir na tabela de equipas (só para estes jogos)
insert into public.teams (name, season)
select 'Águias da Graça', '2026/2027'
where not exists (select 1 from public.teams where name = 'Águias da Graça' and season = '2026/2027');

-- Os 28 jogos (calendário zerozero 2026/27; folga na J12 e na J27). Repetir não duplica.
insert into public.matches (jornada_id, home_team_id, away_team_id)
select j.id, public.tid(v.home, '2026/2027'), public.tid(v.away, '2026/2027')
from (values
    (1, 'Dumiense FC B', 'Águias da Graça'),
    (2, 'Águias da Graça', 'Os Ceramistas'),
    (3, 'Granja FC', 'Águias da Graça'),
    (4, 'Águias da Graça', 'AD Carreira'),
    (5, 'Sequeirense', 'Águias da Graça'),
    (6, 'Águias da Graça', 'AC Panoiense FC'),
    (7, 'Fão', 'Águias da Graça'),
    (8, 'Águias da Graça', 'Parada de Tibães'),
    (9, 'Antas FC', 'Águias da Graça'),
    (10, 'Águias da Graça', 'GFC Pousa'),
    (11, 'Ass. Merelim S. Paio', 'Águias da Graça'),
    (13, 'Águias da Graça', 'Realense FC'),
    (14, 'FC Tadim', 'Águias da Graça'),
    (15, 'Águias da Graça', 'Estrelas do Faro'),
    (16, 'Águias da Graça', 'Dumiense FC B'),
    (17, 'Os Ceramistas', 'Águias da Graça'),
    (18, 'Águias da Graça', 'Granja FC'),
    (19, 'AD Carreira', 'Águias da Graça'),
    (20, 'Águias da Graça', 'Sequeirense'),
    (21, 'AC Panoiense FC', 'Águias da Graça'),
    (22, 'Águias da Graça', 'Fão'),
    (23, 'Parada de Tibães', 'Águias da Graça'),
    (24, 'Águias da Graça', 'Antas FC'),
    (25, 'GFC Pousa', 'Águias da Graça'),
    (26, 'Águias da Graça', 'Ass. Merelim S. Paio'),
    (28, 'Realense FC', 'Águias da Graça'),
    (29, 'Águias da Graça', 'FC Tadim'),
    (30, 'Estrelas do Faro', 'Águias da Graça')
) v(n, home, away)
join public.jornadas j on j.number = v.n and j.season = '2026/2027'
where public.tid(v.home, '2026/2027') is not null and public.tid(v.away, '2026/2027') is not null
  and not exists (
    select 1 from public.matches m
    where m.jornada_id = j.id
      and m.home_team_id = public.tid(v.home, '2026/2027') and m.away_team_id = public.tid(v.away, '2026/2027')
  );

-- Jogo "só adeptos" = jogo em que entra a Águias da Graça
create or replace function public.fans_only(m uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.matches mt
    join public.teams t on t.id in (mt.home_team_id, mt.away_team_id)
    where mt.id = m and t.name = 'Águias da Graça'
  );
$$;

-- Regra completa: jornada da semana e ainda aberta; jogadores não apostam no jogo das Águias;
-- adeptos não apostam na Taça e precisam da cota da jornada paga.
create or replace function public.can_bet(m uuid)
returns boolean language sql security definer stable as $$
  select j.deadline > now()
     and not exists (
       select 1 from public.jornadas j2
       where j2.season = j.season and j2.deadline > now() and j2.number < j.number
     )
     and case (select role from public.profiles where id = auth.uid())
       when 'adepto' then j.number <> 0 and exists (
         select 1 from public.fines f
         where f.user_id = auth.uid() and f.jornada_id = j.id and f.paid
       )
       else not public.fans_only(m)
     end
  from public.matches mt
  join public.jornadas j on j.id = mt.jornada_id
  where mt.id = m;
$$;

select j.number, th.name as casa, ta.name as fora
from public.matches m join public.jornadas j on j.id = m.jornada_id
join public.teams th on th.id = m.home_team_id join public.teams ta on ta.id = m.away_team_id
where 'Águias da Graça' in (th.name, ta.name) order by j.number;
