-- Finance module v2: sources/status on transactions, paylater accounts,
-- transfer pairing, idempotent import ids, and DB-backed categorization rules.
--
-- NOTE: `alter type ... add value` cannot run in the same transaction as a
-- statement that uses the new value, and the whole file runs as one
-- transaction. Do not reference 'paylater' anywhere else in this file.
alter type public.finance_account_type add value if not exists 'paylater';

-- ---------------------------------------------------------------------------
-- finance_accounts: paylater/credit-card billing metadata
-- ---------------------------------------------------------------------------
alter table public.finance_accounts
  add column due_day      int check (due_day between 1 and 31),
  add column credit_limit numeric(16, 2);

comment on column public.finance_accounts.due_day is
  'Billing due day of month (1-31) for credit_card/paylater accounts.';

-- ---------------------------------------------------------------------------
-- finance_transactions: source, status, idempotent import id, transfer pairing
-- ---------------------------------------------------------------------------
alter table public.finance_transactions
  add column source  text not null default 'manual'
    check (source in ('manual', 'gmail', 'statement')),
  add column status  text not null default 'cleared'
    check (status in ('pending', 'cleared', 'reconciled')),
  add column external_id        text,
  add column transfer_group_id  uuid;

-- idempotent import: the same external_id from the same source account can
-- only be inserted once per user
create unique index finance_transactions_external_uidx
  on public.finance_transactions (user_id, account_id, external_id)
  where external_id is not null;

create index finance_transactions_user_status_idx
  on public.finance_transactions (user_id, status);

-- ---------------------------------------------------------------------------
-- finance_rules: DB-backed categorization rules (seeded, user-edited, or
-- AI-suggested), applied by pattern match against transaction descriptions
-- ---------------------------------------------------------------------------
create table public.finance_rules (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  -- regex, matched case-insensitively at apply time
  pattern        text not null,
  applies_to     text not null default 'expense' check (applies_to in ('expense', 'income')),
  -- resolved to finance_categories by name (per user, per kind) at apply time
  category_name  text not null,
  priority       int not null default 100,
  origin         text not null default 'seed' check (origin in ('seed', 'user', 'ai')),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.finance_rules enable row level security;

create policy "own rows" on public.finance_rules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger finance_rules_updated_at
  before update on public.finance_rules
  for each row execute function public.set_updated_at();
