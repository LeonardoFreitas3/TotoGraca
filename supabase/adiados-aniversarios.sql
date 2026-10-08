-- ============================================================
--  TotoGraça — jogos adiados + aniversários. Correr uma vez no SQL Editor.
-- ============================================================

-- jogo adiado: não conta para a jornada (nem para a chave certa)
alter table public.matches add column if not exists postponed boolean not null default false;

-- data de nascimento (cada um mete no perfil)
alter table public.profiles add column if not exists birthday date;
