export interface FinancePlanItem {
  title: string;
  detail: string;
}

export interface FinancePlanSection {
  id: "import" | "add" | "improve" | "remove";
  name: string;
  blurb: string;
  items: FinancePlanItem[];
}

export const financePlan: FinancePlanSection[] = [
  {
    id: "import",
    name: "Import from BawanaPocket",
    blurb:
      "BawanaPocket is retired — we harvest its proven parts, then archive the repo.",
    items: [
      {
        title: "BCA e-statement parser",
        detail:
          "Port the battle-tested PDF text parser (line-grouping state machine + regexes) into src/modules/finance/import; strip the hardcoded personal boilerplate; output a parsed preview instead of writing directly.",
      },
      {
        title: "Merchant categorization rules",
        detail:
          "~60 Indonesian merchant regex rules (Indomaret, SPBU, warteg, Kredivo, …) become seed rows in a new finance_rules table, editable from the UI later.",
      },
      {
        title: "AI categorization prompt",
        detail:
          "Reuse the OpenRouter backfill prompt with modern transport and schema validation; runs only on uncategorized rows.",
      },
      {
        title: "Import screen flow",
        detail:
          "Drag-drop → parse → preview → confirm, rebuilt native to the hub with server actions.",
      },
    ],
  },
  {
    id: "add",
    name: "Add",
    blurb: "New capabilities BawanaPocket never had.",
    items: [
      {
        title: "Gmail realtime expenses",
        detail:
          "OAuth to Gmail, poll for payment-notification emails (BCA first, parser registry per sender) → transactions land minutes after paying, tagged source: gmail.",
      },
      {
        title: "Statement reconciliation",
        detail:
          "Monthly e-statement is authoritative: statement lines merge with matching gmail rows (account + date window + amount) instead of duplicating; unmatched statement lines are created; stale gmail rows get flagged.",
      },
      {
        title: "Idempotent imports",
        detail:
          "Deterministic external_id (hash of account, date, amount, description, ordinal) + unique index — re-importing the same statement or email is always safe.",
      },
      {
        title: "Transaction source tracking",
        detail: "source column: manual, gmail, or statement.",
      },
      {
        title: "Paylater + liability accounts",
        detail:
          "Paylater account type; credit cards and paylater count negative in net worth, each with bill due dates — Kredivo, ShopeePayLater, TikTok PayLater, SPinjam, BliBli PayLater, BRI, Yup!.",
      },
      {
        title: "Transfer pairing",
        detail:
          "Ewallet top-ups and credit/paylater repayments are paired transfers between own accounts (transfer_group_id), not expenses.",
      },
      {
        title: "Real account seed",
        detail:
          "All 13 real accounts plus recurring anchors: Rukita rent, salary, DataAnnotation freelance via PayPal (USD).",
      },
    ],
  },
  {
    id: "improve",
    name: "Improve",
    blurb: "Fixes for BawanaPocket's known weaknesses.",
    items: [
      {
        title: "Correct dedup",
        detail:
          "Deterministic external ids replace the old date+amount key that collapsed distinct same-day, same-amount transactions.",
      },
      {
        title: "True multi-account",
        detail:
          "The old app hardcoded one account and dropped the sub-account; every account is first-class here.",
      },
      {
        title: "Editable rules",
        detail:
          "Categorization rules live in the database instead of hardcoded arrays.",
      },
      {
        title: "Sync-ready storage",
        detail:
          "Postgres + RLS + versioned migrations instead of local SQLite — the same schema goes hosted later.",
      },
    ],
  },
  {
    id: "remove",
    name: "Remove",
    blurb: "Deliberately left behind.",
    items: [
      {
        title: "Advisor chat",
        detail: "Superseded by the hub-wide Assistant phase later.",
      },
      {
        title: "SQLite storage",
        detail: "The better-sqlite3 layer and its import log.",
      },
      {
        title: "BawanaPocket v2 (web/)",
        detail:
          "The unfinished Supabase rewrite — bawana-hub replaces it entirely.",
      },
    ],
  },
];

export interface FinanceFeature {
  feature: string;
  func: string;
  phase: "now" | "later";
}

export const financeFeatures: FinanceFeature[] = [
  {
    feature: "Accounts & debts",
    func: "All 13 accounts in one list. Credit cards + paylater count as debt with due dates. Net worth is honest.",
    phase: "now",
  },
  {
    feature: "E-statement import",
    func: "Drop the BCA PDF → preview → confirm. Re-importing is always safe.",
    phase: "now",
  },
  {
    feature: "Auto-categorization",
    func: "~60 merchant rules label each transaction the moment it lands.",
    phase: "now",
  },
  {
    feature: "Transfer pairing",
    func: "Top-ups and repayments move money — they don't count as spending.",
    phase: "now",
  },
  {
    feature: "Gmail realtime",
    func: "Payment email arrives → transaction appears in minutes. No typing.",
    phase: "now",
  },
  {
    feature: "Reconciliation",
    func: "Monthly statement confirms the realtime rows. Duplicates die automatically.",
    phase: "later",
  },
  {
    feature: "Budgets",
    func: "Set a monthly cap per category, watch the bar fill.",
    phase: "later",
  },
  {
    feature: "Month views",
    func: "Pick a month, filter by account or category, see where money went.",
    phase: "later",
  },
  {
    feature: "AI backfill",
    func: "AI labels whatever the rules missed.",
    phase: "later",
  },
  {
    feature: "Multi-currency",
    func: "PayPal USD income shows up in IDR totals.",
    phase: "later",
  },
];

export const financeArchitecture: { title: string; detail: string }[] = [
  {
    title: "Three paths, one table",
    detail:
      "Manual entry (instant), Gmail notifications (near-realtime), monthly e-statement (authoritative) all feed finance_transactions.",
  },
  {
    title: "Local-first Gmail",
    detail:
      "OAuth + polling from the local server — no public webhook needed; push delivery becomes an option once hosted.",
  },
  {
    title: "Statement wins",
    detail:
      "On conflict the statement is truth; matched gmail rows upgrade to statement-confirmed.",
  },
];
