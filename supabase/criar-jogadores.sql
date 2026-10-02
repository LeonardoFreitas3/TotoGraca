-- ============================================================
--  TotoGraça — criar contas dos jogadores (plantel zerozero)
--  Correr no Supabase → SQL Editor → New query → Run.
--  Login por USERNAME (nome.apelido). Pass inicial: 1234.
--  (O email abaixo é só técnico do Supabase; ninguém o vê nem usa.)
--  Seguro repetir: salta contas que já existam.
-- ============================================================

do $$
declare uid uuid;
begin

  if not exists (select 1 from auth.users where email = 'bruno.silva@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'bruno.silva@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Bruno Silva"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'bruno.silva@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Bruno Silva', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'kapa@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'kapa@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Kapa"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'kapa@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Kapa', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'bruno.santos@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'bruno.santos@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Bruno Santos"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'bruno.santos@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Bruno Santos', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'rodrigo.peixoto@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'rodrigo.peixoto@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Rodrigo Peixoto"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'rodrigo.peixoto@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Rodrigo Peixoto', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'nuno.queiros@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'nuno.queiros@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Nuno Queirós"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'nuno.queiros@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Nuno Queirós', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'leonardo.freitas@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'leonardo.freitas@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Leonardo Freitas"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'leonardo.freitas@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Leonardo Freitas', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'pedro.lima@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'pedro.lima@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Pedro Lima"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'pedro.lima@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Pedro Lima', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'bruno.torres@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'bruno.torres@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Bruno Torres"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'bruno.torres@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Bruno Torres', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'daniel.costa@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'daniel.costa@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Daniel Costa"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'daniel.costa@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Daniel Costa', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'ze.pedro@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'ze.pedro@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Zé Pedro"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'ze.pedro@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Zé Pedro', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'pedro.costa@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'pedro.costa@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Pedro Costa"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'pedro.costa@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Pedro Costa', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'jardel@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'jardel@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Jardel"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'jardel@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Jardel', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'goncalo.francisco@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'goncalo.francisco@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Gonçalo Francisco"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'goncalo.francisco@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Gonçalo Francisco', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'leonel.fernandes@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'leonel.fernandes@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Leonel Fernandes"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'leonel.fernandes@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Leonel Fernandes', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'leandro.fernandes@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'leandro.fernandes@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Leandro Fernandes"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'leandro.fernandes@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Leandro Fernandes', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'tiago.soares@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'tiago.soares@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Tiago Soares"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'tiago.soares@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Tiago Soares', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'tiago.oliveira@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'tiago.oliveira@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Tiago Oliveira"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'tiago.oliveira@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Tiago Oliveira', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'joao.nuno@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'joao.nuno@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"João Nuno"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'joao.nuno@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'João Nuno', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'goncalo.coelho@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'goncalo.coelho@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Gonçalo Coelho"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'goncalo.coelho@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Gonçalo Coelho', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'tiago.alves@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'tiago.alves@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Tiago Alves"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'tiago.alves@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Tiago Alves', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;

  if not exists (select 1 from auth.users where email = 'tiago.borges@totograca.local') then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', 'tiago.borges@totograca.local',
      crypt('1234', gen_salt('bf')), now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Tiago Borges"}', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'tiago.borges@totograca.local'), 'email', now(), now(), now());
    insert into public.profiles (id, name, role, status) values (uid, 'Tiago Borges', 'user', 'approved')
      on conflict (id) do update set name = excluded.name, role = 'user', status = 'approved';
  end if;





end $$;

select p.name, u.email, p.status from public.profiles p join auth.users u on u.id = p.id
where u.email like '%@totograca.local' order by p.name;
