-- Finance module: accounts, categories, transactions, budgets

create type public.finance_account_type as enum
  ('cash', 'bank', 'ewallet', 'credit_card', 'investment', 'other');

create type public.finance_txn_kind as enum ('income', 'expense', 'transfer');

create table public.finance_accounts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  type            public.finance_account_type not null default 'bank',
  currency        text not null default 'IDR',
  opening_balance numeric(16, 2) not null default 0,
  is_archived     boolean not null default false,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.finance_categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  parent_id   uuid references public.finance_categories (id) on delete set null,
  name        text not null,
  kind        public.finance_txn_kind not null default 'expense',
  icon        text,
  color       text,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.finance_transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  account_id  uuid not null references public.finance_accounts (id) on delete cascade,
  category_id uuid references public.finance_categories (id) on delete set null,
  kind        public.finance_txn_kind not null,
  -- always positive; kind determines direction
  amount      numeric(16, 2) not null check (amount >= 0),
  currency    text not null default 'IDR',
  -- destination account when kind = 'transfer'
  transfer_account_id uuid references public.finance_accounts (id) on delete cascade,
  occurred_at timestamptz not null default now(),
  note        text,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (kind <> 'transfer' or transfer_account_id is not null)
);

create table public.finance_budgets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.finance_categories (id) on delete cascade,
  amount      numeric(16, 2) not null check (amount > 0),
  -- month the budget applies to, always the 1st (e.g. 2026-08-01)
  month       date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, category_id, month)
);

create index finance_transactions_user_occurred_idx
  on public.finance_transactions (user_id, occurred_at desc);
create index finance_transactions_account_idx
  on public.finance_transactions (account_id);
create index finance_transactions_category_idx
  on public.finance_transactions (category_id);

-- RLS: owner-only, same pattern for every table
do $$
declare t text;
begin
  foreach t in array array['finance_accounts', 'finance_categories', 'finance_transactions', 'finance_budgets']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "own rows" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format(
      'create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end;
$$;
