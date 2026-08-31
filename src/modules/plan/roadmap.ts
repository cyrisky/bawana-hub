export type PhaseStatus = "done" | "in-progress" | "planned";

export interface RoadmapItem {
  title: string;
  detail?: string;
  status: PhaseStatus;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  timeframe?: string;
  status: PhaseStatus;
  summary: string;
  items: RoadmapItem[];
}

export const roadmap: RoadmapPhase[] = [
  {
    id: "phase-0",
    name: "Foundation",
    timeframe: "Aug 2026",
    status: "done",
    summary:
      "Local-first skeleton: app shell, auth, database schema, first three modules.",
    items: [
      {
        title: "Next.js + local Supabase stack",
        detail:
          "App Router, Tailwind v4, Supabase CLI with versioned migrations, RLS on every table",
        status: "done",
      },
      {
        title: "Auth + profile",
        detail:
          "Email/password login, auto-created profile row, personal data form",
        status: "done",
      },
      {
        title: "Finance module v1",
        detail:
          "Accounts, categories, income/expense/transfer transactions, monthly summary, net worth",
        status: "done",
      },
      {
        title: "Gym module v1",
        detail:
          "Exercise library, workout plans with days and targets, live session logging with sets/reps/weight/RPE",
        status: "done",
      },
      {
        title: "Body metrics",
        detail: "Weight, body fat, resting HR, sleep time-series",
        status: "done",
      },
    ],
  },
  {
    id: "phase-1",
    name: "Daily driver",
    timeframe: "Sep 2026",
    status: "in-progress",
    summary:
      "Finance first: harvest BawanaPocket's assets, then realtime + statement ingestion.",
    items: [
      {
        title: "BawanaPocket harvest",
        detail: "Port the BCA parser and categorization rules",
        status: "planned",
      },
      {
        title: "Finance schema v2",
        detail:
          "finance_rules table; source, external_id, transfer_group_id columns; paylater type; bill due dates",
        status: "planned",
      },
      {
        title: "E-statement import",
        detail: "Upload → parse → preview → confirm, idempotent",
        status: "planned",
      },
      {
        title: "Gmail realtime expenses",
        detail: "Poll payment-notification emails into transactions",
        status: "planned",
      },
      {
        title: "Reconciliation",
        detail: "Statement merges with gmail rows; no duplicates",
        status: "planned",
      },
      {
        title: "Real account seed",
        detail: "13 accounts, Rukita rent, salary, PayPal USD income",
        status: "planned",
      },
    ],
  },
  {
    id: "phase-2",
    name: "More of life",
    timeframe: "Q4 2026",
    status: "planned",
    summary:
      "Finance polish, gym progress views, then new life domains.",
    items: [
      {
        title: "Budgets UI",
        detail:
          "Monthly budget per category with progress bars — table already exists",
        status: "planned",
      },
      {
        title: "Finance views",
        detail: "Month picker, filter by account/category, category breakdown",
        status: "planned",
      },
      {
        title: "Gym progress",
        detail: "Per-exercise history, personal records, volume over time",
        status: "planned",
      },
      {
        title: "Profile attributes",
        detail: "Edit the open-ended jsonb attributes from the UI",
        status: "planned",
      },
      {
        title: "Work module",
        detail: "Projects, tasks, and time across Satu Persen / Nex / Exo",
        status: "planned",
      },
      {
        title: "Personal module",
        detail: "Journal, notes, people, important dates",
        status: "planned",
      },
      {
        title: "Documents",
        detail: "IDs, contracts, receipts — file storage per domain",
        status: "planned",
      },
    ],
  },
  {
    id: "phase-3",
    name: "Go online",
    timeframe: "2027",
    status: "planned",
    summary: "Same schema, hosted — every device shares one hub.",
    items: [
      {
        title: "Hosted Supabase",
        detail: "supabase link + db push, point env at hosted project",
        status: "planned",
      },
      {
        title: "Deploy web app",
        detail: "Vercel or VPS",
        status: "planned",
      },
      {
        title: "PWA for phone",
        detail: "Installable, fast logging at the gym and the checkout line",
        status: "planned",
      },
    ],
  },
  {
    id: "phase-4",
    name: "Intelligence",
    status: "planned",
    summary: "The hub starts working for me.",
    items: [
      {
        title: "Statement imports",
        detail: "BCA e-statement PDF import with auto-categorization",
        status: "planned",
      },
      {
        title: "Insights",
        detail: "Spending trends, training progression, health correlations",
        status: "planned",
      },
      {
        title: "Assistant",
        detail: "Ask the hub questions about my own life data",
        status: "planned",
      },
    ],
  },
];
