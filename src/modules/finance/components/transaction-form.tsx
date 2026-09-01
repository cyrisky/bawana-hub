"use client";

import { useRef, useState } from "react";
import { createTransaction } from "../actions";
import type { FinanceAccount, FinanceCategory, TxnKind } from "../types";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function TransactionForm({
  accounts,
  categories,
}: {
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<TxnKind>("expense");
  const kindCategories = categories.filter((c) => c.kind === kind);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createTransaction(formData);
        formRef.current?.reset();
      }}
      className="grid grid-cols-2 gap-3 md:grid-cols-3"
    >
      <Field label="Type">
        <Select
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as TxnKind)}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
        </Select>
      </Field>
      <Field label="Amount (IDR)">
        <Input name="amount" type="number" min="0" step="any" required />
      </Field>
      <Field label="Date">
        <Input name="occurred_at" type="date" defaultValue={today} required />
      </Field>
      <Field label={kind === "transfer" ? "From account" : "Account"}>
        <Select name="account_id" required>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </Field>
      {kind === "transfer" ? (
        <Field label="To account">
          <Select name="transfer_account_id" required>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <Field label="Category">
          <Select name="category_id">
            <option value="">—</option>
            {kindCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Note">
        <Input name="note" placeholder="Optional" />
      </Field>
      <div className="col-span-2 md:col-span-3">
        <Button type="submit" disabled={accounts.length === 0}>
          Add transaction
        </Button>
        {accounts.length === 0 && (
          <span className="ml-3 text-sm text-ink-muted">
            Add an account first.
          </span>
        )}
      </div>
    </form>
  );
}
