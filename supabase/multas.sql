-- ============================================================
--  TotoGraça — multas (correr uma vez no SQL Editor do Supabase)
-- ============================================================

create table if not exists public.fines (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  code       text not null,          -- A..Q (tabela de multas)
  amount     numeric(6,2) not null,  -- valor na altura (se a tabela mudar, o histórico fica igual)
  date       date not null default current_date,
  paid       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.fines enable row level security;

-- Só o admin vê e gere multas
drop policy if exists fines_admin on public.fines;
create policy fines_admin on public.fines for all
  using (public.is_admin()) with check (public.is_admin());
