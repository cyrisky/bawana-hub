-- Health module: gym plans + workout logging + generic body metrics

create table public.gym_exercises (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null,
  muscle_group text,                -- e.g. chest, back, legs, shoulders, arms, core
  equipment    text,                -- e.g. barbell, dumbbell, machine, bodyweight, cable
  notes        text,
  is_archived  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.gym_plans (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  goal       text,                  -- e.g. hypertrophy, strength, cut
  is_active  boolean not null default false,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A named day within a plan (Push / Pull / Legs, or Mon/Wed/Fri)
create table public.gym_plan_days (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  plan_id    uuid not null references public.gym_plans (id) on delete cascade,
  title      text not null,
  weekday    int check (weekday between 0 and 6), -- optional: 0=Sunday..6=Saturday
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gym_plan_exercises (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  plan_day_id    uuid not null references public.gym_plan_days (id) on delete cascade,
  exercise_id    uuid not null references public.gym_exercises (id) on delete cascade,
  sort_order     int not null default 0,
  target_sets    int,
  target_reps    text,              -- text to allow ranges like '8-12' or 'AMRAP'
  target_weight_kg numeric(6, 2),
  rest_seconds   int,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- An actual visit to the gym
create table public.gym_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  plan_day_id uuid references public.gym_plan_days (id) on delete set null,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Every logged set
create table public.gym_session_sets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  session_id  uuid not null references public.gym_sessions (id) on delete cascade,
  exercise_id uuid not null references public.gym_exercises (id) on delete cascade,
  set_number  int not null default 1,
  reps        int,
  weight_kg   numeric(6, 2),
  rpe         numeric(3, 1) check (rpe between 1 and 10),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Generic time-series for body/health measurements (weight, body fat, sleep, ...)
create table public.health_metrics (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  metric      text not null,        -- e.g. weight_kg, body_fat_pct, resting_hr
  value       numeric(10, 2) not null,
  recorded_at timestamptz not null default now(),
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index gym_sessions_user_started_idx on public.gym_sessions (user_id, started_at desc);
create index gym_session_sets_session_idx on public.gym_session_sets (session_id);
create index health_metrics_user_metric_idx on public.health_metrics (user_id, metric, recorded_at desc);

do $$
declare t text;
begin
  foreach t in array array[
    'gym_exercises', 'gym_plans', 'gym_plan_days', 'gym_plan_exercises',
    'gym_sessions', 'gym_session_sets', 'health_metrics']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "own rows" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format(
      'create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end;
$$;
