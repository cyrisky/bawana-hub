import { createClient } from "@/lib/supabase/server";
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
} from "./types";

export async function getAccounts(): Promise<FinanceAccount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("finance_accounts")
    .select("*")
    .eq("is_archived", false)
    .order("sort_order")
    .order("created_at");
  return (data ?? []) as FinanceAccount[];
}

export async function getCategories(): Promise<FinanceCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("finance_categories")
    .select("id, name, kind, parent_id")
    .eq("is_archived", false)
    .order("name");
  return (data ?? []) as FinanceCategory[];
}

export async function getRecentTransactions(
  limit = 20
): Promise<FinanceTransaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("finance_transactions")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as FinanceTransaction[];
}

/**
 * Account balances and current-month income/expense, computed from all
 * transactions. Fine at personal scale; move to a SQL view if it grows.
 */
export async function getFinanceSummary() {
  const supabase = await createClient();
  const [{ data: accounts }, { data: txns }] = await Promise.all([
    supabase
      .from("finance_accounts")
      .select("*")
      .eq("is_archived", false)
      .order("sort_order")
      .order("created_at"),
    supabase
      .from("finance_transactions")
      .select("account_id, transfer_account_id, kind, amount, occurred_at"),
  ]);

  const balances = new Map<string, number>();
  for (const a of accounts ?? []) {
    balances.set(a.id, Number(a.opening_balance));
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  let monthIncome = 0;
  let monthExpense = 0;

  for (const t of txns ?? []) {
    const amount = Number(t.amount);
    const bal = balances.get(t.account_id) ?? 0;
    if (t.kind === "income") {
      balances.set(t.account_id, bal + amount);
    } else if (t.kind === "expense") {
      balances.set(t.account_id, bal - amount);
    } else if (t.kind === "transfer" && t.transfer_account_id) {
      balances.set(t.account_id, bal - amount);
      balances.set(
        t.transfer_account_id,
        (balances.get(t.transfer_account_id) ?? 0) + amount
      );
    }

    if (new Date(t.occurred_at) >= monthStart) {
      if (t.kind === "income") monthIncome += amount;
      if (t.kind === "expense") monthExpense += amount;
    }
  }

  return {
    accounts: (accounts ?? []) as FinanceAccount[],
    balances,
    netWorth: [...balances.values()].reduce((a, b) => a + b, 0),
    monthIncome,
    monthExpense,
  };
}
