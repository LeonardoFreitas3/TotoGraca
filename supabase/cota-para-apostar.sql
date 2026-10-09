-- ============================================================
--  TotoGraça — grupo Adeptos: regista-se na app, paga 2 € por jornada (em mão ou
--  MBWay) e só aposta na jornada paga. Não aposta na Taça (jornada 0). Jogadores (role 'user') não passam por esta
--  verificação (a deles é a cota mensal do balneário, à parte).
--  Correr uma vez no SQL Editor (depois de multas.sql e apostar-so-jornada-atual.sql).
--  Adeptos registam-se com nome, email e palavra-passe e ficam pendentes até o admin
--  aprovar. Sem confirmação por link: Supabase → Authentication → Providers → Email
--  → "Confirm email" DESLIGADO.
-- ============================================================

-- Papel 'adepto'. Quem se regista na app fica adepto; jogadores continuam a ser criados por SQL com role 'user'.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin','user','adepto'));
alter table public.profiles alter column role set default 'adepto';

-- Emails dos adeptos (ficam no auth.users, não nos perfis que todos leem). Só o admin recebe linhas.
create or replace function public.adepto_contacts()
returns table (id uuid, email text) language sql security definer stable as $$
  select u.id, u.email::text
  from auth.users u
  where public.is_admin();
$$;

-- Cota de jornada do adepto: linha na tabela de multas com code 'JORNADA' ligada à jornada.
-- O admin cria-a já paga quando recebe o MBWay (ecrã da jornada).
alter table public.fines add column if not exists jornada_id uuid references public.jornadas(id) on delete cascade;

create or replace function public.can_bet(m uuid)
returns boolean language sql security definer stable as $$
  select j.deadline > now()
     and not exists (
       select 1 from public.jornadas j2
       where j2.season = j.season and j2.deadline > now() and j2.number < j.number
     )
     and (
       (select role from public.profiles where id = auth.uid()) <> 'adepto'
       or (j.number <> 0 and exists (
         select 1 from public.fines f
         where f.user_id = auth.uid() and f.jornada_id = j.id and f.paid
       ))
     )
  from public.matches mt
  join public.jornadas j on j.id = mt.jornada_id
  where mt.id = m;
$$;
