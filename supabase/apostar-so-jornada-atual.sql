-- ============================================================
--  TotoGraça — só se aposta na jornada da semana (a primeira ainda aberta).
--  Correr uma vez no SQL Editor. A app já bloqueia no ecrã; isto garante no servidor.
-- ============================================================

create or replace function public.can_bet(m uuid)
returns boolean language sql security definer stable as $$
  select j.deadline > now()
     and not exists (
       select 1 from public.jornadas j2
       where j2.season = j.season and j2.deadline > now() and j2.number < j.number
     )
  from public.matches mt
  join public.jornadas j on j.id = mt.jornada_id
  where mt.id = m;
$$;

drop policy if exists tips_insert on public.tips;
create policy tips_insert on public.tips for insert with check (
  user_id = auth.uid() and not public.is_admin() and public.can_bet(match_id)
);
drop policy if exists tips_update on public.tips;
create policy tips_update on public.tips for update
  using (user_id = auth.uid() and not public.is_admin() and public.can_bet(match_id))
  with check (user_id = auth.uid() and not public.is_admin() and public.can_bet(match_id));
