-- ============================================================
--  TotoGraça — o admin passa a entrar com o username "admin" (sem email)
--  Correr no Supabase → SQL Editor → New query → Run.
--  A palavra-passe mantém-se a mesma.
-- ============================================================

update auth.users
set email = 'admin@totograca.local', email_confirmed_at = coalesce(email_confirmed_at, now())
where id = (select id from public.profiles where role = 'admin' limit 1);

update auth.identities
set identity_data = identity_data || jsonb_build_object('email', 'admin@totograca.local')
where provider = 'email'
  and user_id = (select id from public.profiles where role = 'admin' limit 1);

-- confirmar (deve mostrar admin@totograca.local):
select p.name, p.role, u.email from public.profiles p join auth.users u on u.id = p.id where p.role = 'admin';
