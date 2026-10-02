-- ============================================================
--  TotoGraça — criar os 5 jogadores que faltaram
--  Correr no Supabase → SQL Editor → New query → Run.
--  Login por USERNAME (nome.apelido). Pass inicial: 1234.
--  (O email abaixo é só técnico do Supabase; ninguém o vê nem usa.)
--  Seguro repetir: salta contas que já existam.
-- ============================================================

do $$
declare uid uuid;
begin

  if not exists (select 1 from auth.users where email = 'diogo.costa@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'diogo.costa@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Diogo Costa"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'diogo.costa@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Diogo Costa', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'flavio.peixoto@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'flavio.peixoto@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Flávio Peixoto"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'flavio.peixoto@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Flávio Peixoto', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'pedro.costa2@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'pedro.costa2@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Pedro Costa"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'pedro.costa2@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Pedro Costa', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'pedro.araujo@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'pedro.araujo@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Pedro Araújo"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'pedro.araujo@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Pedro Araújo', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'pedro.gomes@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'pedro.gomes@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Pedro Gomes"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'pedro.gomes@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Pedro Gomes', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;
end $$;

select p.name, p.status from public.profiles p
where p.name in ('Diogo Costa','Flávio Peixoto','Pedro Costa','Pedro Araújo','Pedro Gomes') order by p.name;