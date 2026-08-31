-- Core: profile + shared plumbing
-- Every domain module gets its own prefixed table group (finance_*, gym_*, health_*).
-- All tables carry user_id + RLS so the same schema works single-user locally
-- and multi-user/multi-device when hosted.

create extension if not exists "uuid-ossp";

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profile
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null default '',
  full_name     text,
  date_of_birth date,
  sex           text check (sex in ('male', 'female', 'other')),
  height_cm     numeric(5, 1),
  timezone      text not null default 'Asia/Jakarta',
  avatar_url    text,
  -- open-ended personal data (socials, blood type, shirt size, ...) without
  -- forcing a migration for every small fact
  attributes    jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
