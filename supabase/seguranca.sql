-- ============================================================
--  TotoGraça — endurecer a segurança com registo aberto a adeptos.
--  Correr uma vez no SQL Editor (depois de adeptos-sem-taca.sql). Pode repetir-se.
--
--  O que fecha:
--   1. Conta acabada de criar (nunca pagou) só lê o próprio perfil: não vê nomes,
--      palpites nem nada de outras pessoas.
--   2. Só contas ativas (status approved) apostam, mesmo que a app seja contornada.
--   3. Apagar um adepto no admin apaga também o login (auth.users), não só o perfil.
--   4. Nome limitado a 40 caracteres.
--
--  No painel do Supabase (não dá para fazer por SQL):
--   - Authentication → Sign In / Providers → Email: "Minimum password length" = 8.
--   - Authentication → Sign In / Providers: "Allow anonymous sign-ins" DESLIGADO.
--   - Authentication → Attack Protection: ligar "Enable Captcha protection" com
--     Cloudflare Turnstile e pôr a Secret key; a Site key vai para VITE_TURNSTILE_SITE_KEY
--     no Vercel (Settings → Environment Variables) e faz-se redeploy. Sem a variável
--     a app funciona sem captcha, por isso liga as duas coisas ao mesmo tempo.
--   - Authentication → Rate Limits: baixar "sign ups" (ex: 10 por hora) se vires abuso.
-- ============================================================

-- Conta ativa? (admin conta sempre)
create or replace function public.is_approved()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (status = 'approved' or role = 'admin')
  );
$$;

-- 1. Perfis: o próprio vê-se sempre; os outros só quem está ativo
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (auth.uid() = id or public.is_approved());

-- Palpites: o próprio sempre; os dos outros só depois do fecho e só para contas ativas
drop policy if exists tips_select on public.tips;
create policy tips_select on public.tips for select using (
  user_id = auth.uid()
  or public.is_admin()
  or (public.is_approved() and now() >= public.match_deadline(match_id))
);

-- 2. Apostar exige conta ativa (além das regras de jornada, Taça, cota e jogo das Águias)
create or replace function public.can_bet(m uuid)
returns boolean language sql security definer stable as $$
  with me as (select role, status from public.profiles where id = auth.uid())
  select (select status from me) = 'approved'
     and j.deadline > now()
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

-- 3. Apagar conta (admin): remove o login; o perfil, palpites e cotas vão por cascade
create or replace function public.delete_user(uid uuid)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then
    raise exception 'Só o admin pode apagar contas';
  end if;
  if exists (select 1 from public.profiles where id = uid and role = 'admin') then
    raise exception 'Não se apaga o admin';
  end if;
  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_user(uuid) from public, anon;
grant execute on function public.delete_user(uuid) to authenticated;

-- 4. Nome com tamanho razoável (o trigger já impede mudar papel/estado)
update public.profiles set name = left(name, 40) where char_length(name) > 40;
alter table public.profiles drop constraint if exists profiles_name_len;
alter table public.profiles add constraint profiles_name_len check (char_length(name) between 1 and 40);

-- Funções internas não precisam de ser chamadas por anónimos
revoke execute on function public.adepto_contacts() from anon;
revoke execute on function public.can_bet(uuid) from anon;
revoke execute on function public.fans_only(uuid) from anon;
revoke execute on function public.is_approved() from anon;
