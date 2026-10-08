-- ============================================================
--  TotoGraça — equipa técnica SEM conta (só para multas e cotas).
--  Correr uma vez no SQL Editor. Seguro repetir.
-- ============================================================

create table if not exists public.staff (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;
drop policy if exists staff_admin on public.staff;
create policy staff_admin on public.staff for all
  using (public.is_admin()) with check (public.is_admin());

-- uma multa pertence a um jogador (user_id) OU a alguém da equipa técnica (staff_id)
alter table public.fines alter column user_id drop not null;
alter table public.fines add column if not exists staff_id uuid references public.staff(id) on delete cascade;
alter table public.fines drop constraint if exists fines_one_person;
alter table public.fines add constraint fines_one_person check ((user_id is null) <> (staff_id is null));

-- nomes iniciais (o admin pode acrescentar/apagar na app)
insert into public.staff (name)
select v.n from (values ('Mister Zequinha'), ('Mister Edu Pinto'), ('Mister Mauro'), ('Dir. Desp. Artur Borges')) as v(n)
where not exists (select 1 from public.staff s where s.name = v.n);

select name from public.staff order by name;
