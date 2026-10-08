-- ============================================================
--  TotoGraça — equipa técnica com conta (cota mensal 5 €; jogadores 2,5 €)
--  Correr no Supabase → SQL Editor → New query → Run. Seguro repetir.
--  Login por USERNAME: zequinha, edu.pinto, mauro, artur.borges. Pass inicial: 1234.
-- ============================================================

-- marca quem é da equipa técnica (cota diferente)
alter table public.profiles add column if not exists staff boolean not null default false;

do $$
declare uid uuid;
begin

  if not exists (select 1 from auth.users where email = 'zequinha@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'zequinha@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Mister Zequinha"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'zequinha@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status, staff) values (uid, 'Mister Zequinha', 'user', 'approved', true)
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved', staff = true;
  end if;

  if not exists (select 1 from auth.users where email = 'edu.pinto@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'edu.pinto@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Mister Edu Pinto"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'edu.pinto@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status, staff) values (uid, 'Mister Edu Pinto', 'user', 'approved', true)
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved', staff = true;
  end if;

  if not exists (select 1 from auth.users where email = 'mauro@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'mauro@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Mister Mauro"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'mauro@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status, staff) values (uid, 'Mister Mauro', 'user', 'approved', true)
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved', staff = true;
  end if;

  if not exists (select 1 from auth.users where email = 'artur.borges@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'artur.borges@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Dir. Desp. Artur Borges"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'artur.borges@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status, staff) values (uid, 'Dir. Desp. Artur Borges', 'user', 'approved', true)
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved', staff = true;
  end if;

end $$;

-- garante o marcador mesmo que as contas já existissem
update public.profiles set staff = true
where id in (select id from auth.users where email in ('zequinha@totograca.local', 'edu.pinto@totograca.local', 'mauro@totograca.local', 'artur.borges@totograca.local'));

select name, staff from public.profiles where staff order by name;
