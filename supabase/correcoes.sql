-- ============================================================
--  TotoGraça — correções (segurança + hora de fecho)
--  Correr no Supabase → SQL Editor → New query → Run.
--  Seguro repetir.
-- ============================================================

-- 1) SEGURANÇA: um jogador pode mudar o próprio nome, mas NUNCA o papel (admin)
--    nem o estado (aprovado). Só o admin pode. O SQL Editor (sem sessão) continua a poder.
create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and auth.uid() is not null and not public.is_admin() then
    raise exception 'Sem permissão para alterar o papel ou o estado da conta';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- 2) HORA DE FECHO: passar as jornadas 2026/27 para sábado 09:00 hora de Lisboa
--    (estavam a 09:00 UTC = 10:00 em Lisboa no horário de verão).
update public.jornadas
set deadline = ((deadline at time zone 'UTC')::date + time '09:00') at time zone 'Europe/Lisbon'
where season = '2026/2027';

-- confirmar (hora em Lisboa deve ser 09:00 em todas):
select number, deadline at time zone 'Europe/Lisbon' as fecho_lisboa
from public.jornadas where season = '2026/2027' order by number;
