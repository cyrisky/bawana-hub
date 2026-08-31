"use client";

import { deleteTransaction } from "../actions";
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
} from "../types";
import { formatIDR, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function TransactionList({
  transactions,
  accounts,
  categories,
}: {
  transactions: FinanceTransaction[];
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
}) {
  const accountName = (id: string | null) =>
    accounts.find((a) => a.id === id)?.name ?? "?";
  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name;

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No transactions yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          {transactions.map((t) => (
            <tr
              key={t.id}
              className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
            >
              <td className="py-2 pr-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                {formatDate(t.occurred_at)}
              </td>
              <td className="py-2 pr-3">
                <div className="font-medium">
                  {t.kind === "transfer"
                    ? `${accountName(t.account_id)} → ${accountName(t.transfer_account_id)}`
                    : (categoryName(t.category_id) ??
                      (t.kind === "income" ? "Income" : "Expense"))}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.kind !== "transfer" && accountName(t.account_id)}
                  {t.note ? ` · ${t.note}` : ""}
                </div>
              </td>
              <td
                className={`py-2 pr-3 text-right font-medium tabular-nums whitespace-nowrap ${
                  t.kind === "income"
                    ? "text-teal-600 dark:text-teal-400"
                    : t.kind === "expense"
                      ? "text-red-600 dark:text-red-400"
                      : "text-zinc-500"
                }`}
              >
                {t.kind === "expense" ? "−" : t.kind === "income" ? "+" : ""}
                {formatIDR(t.amount)}
              </td>
              <td className="py-2 text-right">
                <Button
                  variant="danger"
                  onClick={() => deleteTransaction(t.id)}
                  aria-label="Delete transaction"
                >
                  ✕
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
