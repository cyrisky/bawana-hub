export interface QaScenario {
  id: string;
  title: string;
  steps: string[];
  expect: string;
}

export interface QaRound {
  id: string;
  title: string;
  date: string;
  status: "ready" | "in-progress";
  scenarios: QaScenario[];
}

export const qaRounds: QaRound[] = [
  {
    id: "round-1",
    title: "Round 1 — Finance foundation",
    date: "2026-09-02",
    status: "ready",
    scenarios: [
      {
        id: "signup",
        title: "Sign up & land on the dashboard",
        steps: [
          "Run `supabase start`, then `npm run dev`",
          "Open http://localhost:3000 — you get redirected to the login page",
          "Click \"First time? Create an account\", enter an email + password, submit",
        ],
        expect:
          "Dashboard loads with the greeting, Finance + Gym cards, and Plan + QA in the sidebar.",
      },
      {
        id: "seed",
        title: "One-click seed",
        steps: [
          "Open Finance from the sidebar",
          "Click \"Seed my accounts & rules\"",
        ],
        expect:
          "13 accounts appear (BCA, Blu, Dana, ShopeePay, OVO, GoPay, BRI, Yup!, Kredivo, ShopeePayLater, TikTok PayLater, SPinjam, BliBli PayLater), all Rp 0, and category chips show under Categories.",
      },
      {
        id: "manual-expense",
        title: "Manual expense",
        steps: [
          "In \"Add transaction\": type Expense, amount 50000, today's date, account BCA, pick any expense category",
          "Click \"Add transaction\"",
        ],
        expect:
          "Row appears in Recent transactions as −Rp 50.000; BCA balance shows −Rp 50.000; \"Spent this month\" is Rp 50.000.",
      },
      {
        id: "statement-import",
        title: "Import the January e-statement",
        steps: [
          "Click \"Import statement →\" (Recent transactions header)",
          "Account: BCA",
          "Choose file: Devs/Bawana/BawanaPocket/estatement/2810504806_JAN_2026.pdf",
          "Click Parse — preview should say period 2026-01 with 74 transactions, most rows showing a category",
          "Click the Import/Confirm button",
        ],
        expect:
          "Success message with 74 imported; back on Finance, BCA's balance moved and imported rows carry a small \"statement\" label.",
      },
      {
        id: "reimport-dedup",
        title: "Re-import the same PDF (dedup guard)",
        steps: [
          "Open Import statement again",
          "Same account (BCA), same PDF, click Parse",
        ],
        expect:
          "Preview reports 0 new / 74 duplicates and the confirm button is disabled — importing twice is impossible.",
      },
      {
        id: "transfer-pairing",
        title: "Transfer is not spending",
        steps: [
          "Note the current \"Spent this month\" number",
          "Add transaction: type Transfer, amount 100000, from BCA to GoPay",
        ],
        expect:
          "BCA drops Rp 100.000, GoPay gains Rp 100.000, and \"Spent this month\" does NOT change.",
      },
    ],
  },
];
