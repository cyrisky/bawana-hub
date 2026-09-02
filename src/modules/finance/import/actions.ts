"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseBcaStatement } from "./parse-bca-statement";
import {
  prepareRows,
  markDuplicates,
  type RuleRow,
  type CategoryRow,
  type PreparedRow,
} from "./prepare-rows";

async function userId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, uid: user.id };
}

export type ImportPreview = {
  period: string | null;
  openingBalance: number | null;
  closingBalance: number | null;
  count: number;
  newCount: number;
  dupCount: number;
  rows: PreparedRow[];
};

/**
 * Parse an uploaded BCA e-statement PDF and build an import preview:
 * category-matched, deduped-against-the-DB, but not yet inserted.
 */
export async function parseStatement(formData: FormData): Promise<ImportPreview> {
  const { supabase, uid } = await userId();

  const file = formData.get("file");
  const accountId = String(formData.get("account_id") || "");
  if (!(file instanceof File)) throw new Error("No file provided");
  if (!accountId) throw new Error("Account is required");

  const buffer = Buffer.from(await file.arrayBuffer());
  const statement = await parseBcaStatement(buffer);

  const [{ data: rules, error: rulesError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from("finance_rules")
        .select("pattern, applies_to, category_name, priority, is_active")
        .eq("user_id", uid)
        .eq("is_active", true),
      supabase
        .from("finance_categories")
        .select("id, name, kind")
        .eq("user_id", uid)
        .eq("is_archived", false),
    ]);
  if (rulesError) throw new Error(rulesError.message);
  if (categoriesError) throw new Error(categoriesError.message);

  const preparedRows = prepareRows({
    transactions: statement.transactions,
    accountId,
    rules: (rules ?? []) as RuleRow[],
    categories: (categories ?? []) as CategoryRow[],
  });

  const ids = preparedRows.map((r) => r.externalId);
  let existingIds = new Set<string>();
  if (ids.length > 0) {
    const { data: existing, error: existingError } = await supabase
      .from("finance_transactions")
      .select("external_id")
      .eq("user_id", uid)
      .eq("account_id", accountId)
      .in("external_id", ids);
    if (existingError) throw new Error(existingError.message);
    existingIds = new Set(
      (existing ?? []).map((r) => r.external_id as string).filter(Boolean)
    );
  }

  const rows = markDuplicates(preparedRows, existingIds);
  const dupCount = rows.filter((r) => r.duplicate).length;

  return {
    period: statement.period,
    openingBalance: statement.openingBalance,
    closingBalance: statement.closingBalance,
    count: rows.length,
    newCount: rows.length - dupCount,
    dupCount,
    rows,
  };
}

export type ConfirmImportRow = Pick<
  PreparedRow,
  "date" | "description" | "merchant" | "amount" | "kind" | "categoryId" | "externalId"
>;

export type ConfirmImportPayload = {
  account_id: string;
  rows: ConfirmImportRow[];
};

export type ConfirmImportResult = { inserted: number; skipped: number };

/**
 * Insert the (non-duplicate) rows a client sends back from a preview.
 *
 * finance_transactions_external_uidx (see the finance_v2 migration) is a
 * *partial* unique index — `unique (user_id, account_id, external_id) where
 * external_id is not null` — and Postgres only lets ON CONFLICT infer a
 * partial index when the conflict clause repeats its exact WHERE predicate,
 * which PostgREST/supabase-js's upsert() has no way to express. So instead
 * of upsert+ignoreDuplicates, re-check which of the submitted external_ids
 * already exist for this account and insert only the rest — same
 * idempotency guarantee (re-confirming the same preview inserts nothing new
 * the second time), just via a pre-check instead of ON CONFLICT.
 */
export async function confirmImport(
  payload: ConfirmImportPayload
): Promise<ConfirmImportResult> {
  const { supabase, uid } = await userId();
  const { account_id, rows } = payload;
  if (!account_id) throw new Error("Account is required");
  if (!rows || rows.length === 0) return { inserted: 0, skipped: 0 };

  const ids = rows.map((r) => r.externalId);
  const { data: existing, error: existingError } = await supabase
    .from("finance_transactions")
    .select("external_id")
    .eq("user_id", uid)
    .eq("account_id", account_id)
    .in("external_id", ids);
  if (existingError) throw new Error(existingError.message);
  const existingIds = new Set(
    (existing ?? []).map((r) => r.external_id as string).filter(Boolean)
  );

  const toInsert = rows.filter((r) => !existingIds.has(r.externalId));
  const alreadyExisted = rows.length - toInsert.length;

  if (toInsert.length === 0) {
    return { inserted: 0, skipped: alreadyExisted };
  }

  const insertRows = toInsert.map((r) => {
    const noteSource = (r.merchant ?? r.description ?? "").trim();
    const note =
      noteSource.length > 0
        ? noteSource.length > 200
          ? `${noteSource.slice(0, 199)}…`
          : noteSource
        : null;

    return {
      user_id: uid,
      account_id,
      category_id: r.categoryId,
      kind: r.kind,
      amount: r.amount,
      occurred_at: new Date(`${r.date}T00:00:00`).toISOString(),
      note,
      source: "statement",
      status: "cleared",
      external_id: r.externalId,
    };
  });

  const { data, error } = await supabase
    .from("finance_transactions")
    .insert(insertRows)
    .select("id");

  if (error) throw new Error(error.message);

  const inserted = data?.length ?? 0;
  const skipped = alreadyExisted + (insertRows.length - inserted);

  revalidatePath("/finance");
  revalidatePath("/");

  return { inserted, skipped };
}
