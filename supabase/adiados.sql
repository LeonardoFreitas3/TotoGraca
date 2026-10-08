-- ============================================================
--  TotoGraça — jogos adiados. Correr uma vez no SQL Editor.
-- ============================================================

-- jogo adiado: não conta para a jornada (nem para a chave certa)
alter table public.matches add column if not exists postponed boolean not null default false;
