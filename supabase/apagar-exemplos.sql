-- ============================================================
--  TotoGraça — APAGAR as jornadas/jogos/palpites de exemplo
--  Correr quando tiveres os dados reais da época nova.
--  Apaga tudo da época '2026/2027' (jornadas, jogos, palpites e equipas).
-- ============================================================

delete from public.tips    where match_id in (select m.id from public.matches m join public.jornadas j on j.id = m.jornada_id where j.season = '2026/2027');
delete from public.matches where jornada_id in (select id from public.jornadas where season = '2026/2027');
delete from public.jornadas where season = '2026/2027';
delete from public.teams    where season = '2026/2027';

-- confirmar (deve devolver 0 em tudo):
select
  (select count(*) from public.jornadas where season='2026/2027') as jornadas,
  (select count(*) from public.teams    where season='2026/2027') as equipas;
