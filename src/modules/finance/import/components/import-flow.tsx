"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { parseStatement, confirmImport } from "../actions";
import type { ImportPreview } from "../actions";
import type { FinanceAccount } from "../../types";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { formatIDR, formatDate } from "@/lib/format";

export function ImportFlow({ accounts }: { accounts: FinanceAccount[] }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isParsing, startParse] = useTransition();
  const [isConfirming, startConfirm] = useTransition();

  function handleParse() {
    if (!file || !accountId) return;
    setError(null);
    startParse(async () => {
      try {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("account_id", accountId);
        const p = await parseStatement(fd);
        setPreview(p);
        setResult(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to parse statement");
      }
    });
  }

  function handleConfirm() {
    if (!preview) return;
    setError(null);
    startConfirm(async () => {
      try {
        const rows = preview.rows
          .filter((r) => !r.duplicate)
          .map((r) => ({
            date: r.date,
            description: r.description,
            merchant: r.merchant,
            amount: r.amount,
            kind: r.kind,
            categoryId: r.categoryId,
            externalId: r.externalId,
          }));
        const res = await confirmImport({ account_id: accountId, rows });
        setResult(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to import");
      }
    });
  }

  if (result) {
    return (
      <div className="space-y-3">
        <p className="text-sm">
          Imported <span className="font-semibold">{result.inserted}</span>{" "}
          transaction{result.inserted === 1 ? "" : "s"}
          {result.skipped > 0 ? ` (${result.skipped} already existed)` : ""}.
        </p>
        <Link
          href="/finance"
          className="text-sm font-medium text-signal hover:underline"
        >
          ← Back to Finance
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Account" className="min-w-40">
          <Select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Statement (PDF)" className="min-w-56 flex-1">
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border file:border-edge file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink file:transition-colors hover:file:bg-ground"
          />
        </Field>
        <Button
          type="button"
          onClick={handleParse}
          disabled={!file || !accountId || isParsing}
        >
          {isParsing ? "Parsing…" : "Parse"}
        </Button>
      </div>

      {error && <p className="text-sm text-signal">{error}</p>}

      {preview && (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            {preview.period ?? "Unknown period"} ·{" "}
            {preview.openingBalance !== null
              ? formatIDR(preview.openingBalance)
              : "—"}
            {" → "}
            {preview.closingBalance !== null
              ? formatIDR(preview.closingBalance)
              : "—"}
            {" · "}
            <span className="font-medium text-ink">
              {preview.newCount} new
            </span>{" "}
            / {preview.dupCount} duplicate{preview.dupCount === 1 ? "" : "s"}
          </p>

          <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-lg border border-edge">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-edge text-left text-xs text-ink-muted">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr
                    key={r.externalId}
                    className="border-b border-edge last:border-0"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-ink-muted">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-3 py-2">{r.merchant ?? r.description}</td>
                    <td className="px-3 py-2 text-ink-muted">
                      {r.categoryName ?? "—"}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums ${
                        r.kind === "income" ? "text-signal" : "text-ink"
                      }`}
                    >
                      {r.kind === "income" ? "+" : "−"}
                      {formatIDR(r.amount)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.duplicate && (
                        <span className="rounded-full border border-edge px-2 py-0.5 text-xs text-ink-muted">
                          dup
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={preview.newCount === 0 || isConfirming}
          >
            {isConfirming
              ? "Importing…"
              : `Import ${preview.newCount} transaction${preview.newCount === 1 ? "" : "s"}`}
          </Button>
        </div>
      )}
    </div>
  );
}
