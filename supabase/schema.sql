-- ============================================================
--  TotoGraça — esquema da base de dados (Supabase / PostgreSQL)
--  Cola tudo isto no Supabase  →  SQL Editor  →  New query  →  Run
--  Pode ser executado mais do que uma vez sem problema.
-- ============================================================

-- ---------- TABELAS ----------

-- Perfis (ligados às contas de login do Supabase Auth)
create table if not exists public.profiles (
  id     uuid primary key references auth.users(id) on delete cascade,
  name   text not null default 'Jogador',
  role   text not null default 'user' check (role in ('admin','user')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id     uuid primary key default gen_random_uuid(),
  name   text not null,
  season text not null default '2026/2027',
  created_at timestamptz not null default now()
);

create table if not exists public.jornadas (
  id       uuid primary key default gen_random_uuid(),
  number   int  not null,
  season   text not null default '2026/2027',
  deadline timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id           uuid primary key default gen_random_uuid(),
  jornada_id   uuid not null references public.jornadas(id) on delete cascade,
  home_team_id uuid not null references public.teams(id),
  away_team_id uuid not null references public.teams(id),
  home_score   int,
  away_score   int,
  created_at   timestamptz not null default now()
);

create table if not exists public.tips (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  match_id  uuid not null references public.matches(id) on delete cascade,
  pick      text not null check (pick in ('V1','X','V2')),
  created_at timestamptz not null default now(),
  unique (user_id, match_id)
);

-- ---------- FUNÇÕES AUXILIARES ----------

-- É admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Prazo de fecho do jogo (deadline da jornada a que pertence)
create or replace function public.match_deadline(m uuid)
returns timestamptz language sql security definer stable as $$
  select j.deadline from public.matches mt
  join public.jornadas j on j.id = mt.jornada_id
  where mt.id = m;
$$;

-- Cria automaticamente o perfil quando se cria uma conta de login
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- SEGURANÇA (Row Level Security) ----------

alter table public.profiles enable row level security;
alter table public.teams    enable row level security;
alter table public.jornadas enable row level security;
alter table public.matches  enable row level security;
alter table public.tips     enable row level security;

-- PROFILES: cada um vê/edita o seu; admin vê e gere todos
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (auth.uid() = id or public.is_admin() or true);  -- todos os autenticados veem nomes (para a classificação)

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- TEAMS / JORNADAS / MATCHES: todos leem; só admin escreve
drop policy if exists teams_read on public.teams;
create policy teams_read on public.teams for select using (auth.role() = 'authenticated');
drop policy if exists teams_admin on public.teams;
create policy teams_admin on public.teams for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists jornadas_read on public.jornadas;
create policy jornadas_read on public.jornadas for select using (auth.role() = 'authenticated');
drop policy if exists jornadas_admin on public.jornadas;
create policy jornadas_admin on public.jornadas for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists matches_read on public.matches;
create policy matches_read on public.matches for select using (auth.role() = 'authenticated');
drop policy if exists matches_admin on public.matches;
create policy matches_admin on public.matches for all using (public.is_admin()) with check (public.is_admin());

-- TIPS: vês o teu palpite sempre; os dos outros só DEPOIS do fecho; admin vê tudo
drop policy if exists tips_select on public.tips;
create policy tips_select on public.tips for select using (
  user_id = auth.uid()
  or public.is_admin()
  or now() >= public.match_deadline(match_id)
);

-- Inserir/alterar palpite: só o próprio e SÓ antes do fecho (sábado 09:00)
drop policy if exists tips_insert on public.tips;
create policy tips_insert on public.tips for insert with check (
  user_id = auth.uid() and now() < public.match_deadline(match_id)
);
drop policy if exists tips_update on public.tips;
create policy tips_update on public.tips for update
  using (user_id = auth.uid() and now() < public.match_deadline(match_id))
  with check (user_id = auth.uid() and now() < public.match_deadline(match_id));
