import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { formatIDR } from "@/lib/format";
import {
  getCategories,
  getFinanceSummary,
  getRecentTransactions,
} from "@/modules/finance/queries";
import { TransactionForm } from "@/modules/finance/components/transaction-form";
import {
  AccountForm,
  CategoryForm,
} from "@/modules/finance/components/account-form";
import { TransactionList } from "@/modules/finance/components/transaction-list";

export default async function FinancePage() {
  const [summary, categories, transactions] = await Promise.all([
    getFinanceSummary(),
    getCategories(),
    getRecentTransactions(30),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Finance</h1>

      <Card>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Net worth" value={formatIDR(summary.netWorth)} />
          <Stat
            label="Income this month"
            value={formatIDR(summary.monthIncome)}
            tone="positive"
          />
          <Stat
            label="Spent this month"
            value={formatIDR(summary.monthExpense)}
            tone="negative"
          />
        </div>
      </Card>

      <Card title="Add transaction">
        <TransactionForm accounts={summary.accounts} categories={categories} />
      </Card>

      <Card title="Accounts">
        {summary.accounts.length > 0 && (
          <ul className="mb-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            {summary.accounts.map((a) => (
              <li key={a.id} className="flex justify-between py-2 text-sm">
                <span>
                  {a.name}
                  <span className="ml-2 text-xs text-zinc-400">{a.type}</span>
                </span>
                <span className="font-medium tabular-nums">
                  {formatIDR(summary.balances.get(a.id) ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <AccountForm />
      </Card>

      <Card title="Categories">
        {categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  c.kind === "income"
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {c.name}
              </span>
            ))}
          </div>
        )}
        <CategoryForm />
      </Card>

      <Card title="Recent transactions">
        <TransactionList
          transactions={transactions}
          accounts={summary.accounts}
          categories={categories}
        />
      </Card>
    </div>
  );
}
