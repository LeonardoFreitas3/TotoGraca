-- ============================================================
--  TotoGraça — para adeptos a Taça (jornada 0) não conta como "jornada da semana":
--  enquanto a Taça está aberta, o adepto já aposta na jornada 1.
--  Correr uma vez no SQL Editor (substitui o can_bet de adeptos-jogo-aguias.sql).
-- ============================================================

create or replace function public.can_bet(m uuid)
returns boolean language sql security definer stable as $$
  with me as (select role from public.profiles where id = auth.uid())
  select j.deadline > now()
     and not exists (
       select 1 from public.jornadas j2
       where j2.season = j.season and j2.deadline > now() and j2.number < j.number
         and (j2.number > 0 or (select role from me) <> 'adepto')  -- Taça não bloqueia adeptos
     )
     and case (select role from me)
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
