# Bawana Hub

One single super app documenting my whole life — work, personal, finance, health, and whatever comes next. Local-first on this machine now; the same schema syncs to hosted Supabase later for multi-device access.

## Current modules

- **Finance** — accounts, categories, transactions (income/expense/transfer), monthly summary, net worth
- **Gym** — exercise library, workout plans (days → exercises with targets), live session logging (sets/reps/weight/RPE)
- **Profile** — personal data + body metrics time-series (weight, body fat, …)

## Stack

- Next.js (App Router) + React + TypeScript + Tailwind v4
- Supabase (Postgres, Auth, RLS) — runs locally via the Supabase CLI, schema in versioned migrations
- Server Components + Server Actions for data flow; module-per-domain code layout

## Architecture

```
src/
  app/            routes only — thin pages that compose module components
    (app)/        authenticated shell (sidebar) → dashboard, finance, gym, profile
    login/        auth
  modules/        one folder per life domain
    finance/      types.ts · queries.ts · actions.ts · components/
    gym/
    profile/
  components/
    ui/           shared primitives (Card, Button, Field, Stat)
    layout/       app shell pieces
  lib/            supabase clients, formatting helpers
supabase/
  migrations/     the source of truth for the database schema
```

**Adding a new life module:** create `src/modules/<domain>` (types/queries/actions/components), add a migration `supabase/migrations/*_<domain>.sql` with RLS (`user_id = auth.uid()`), add a route under `src/app/(app)/<domain>`, and a link in `src/components/layout/sidebar.tsx`.

## Running locally

```bash
supabase start        # local Postgres + Auth (needs Docker)
supabase db reset     # apply migrations
npm run dev           # http://localhost:3000
```

`.env.local` points at the local Supabase instance. First visit: create an account on the login page (local auth, no email confirmation).

## Going online later

1. Create a hosted Supabase project
2. `supabase link --project-ref <ref>` then `supabase db push`
3. Point `.env.local` (or deployment env) at the hosted URL + anon key
4. Deploy the Next.js app anywhere (Vercel, VPS) — every device then shares the same data
