// Pure rule-matching + external-id + dedup-marking logic for the e-statement
// import flow. Kept separate from actions.ts (which is "use server" and talks
// to Supabase) so it can be exercised directly — with real parsed statement
// data and mocked rules — from a plain node script.
import { computeExternalId, type ParsedTransaction } from "./parse-bca-statement";
import type { TxnKind } from "../types";

export type RuleKind = Exclude<TxnKind, "transfer">;

export type RuleRow = {
  pattern: string;
  applies_to: RuleKind;
  category_name: string;
  priority: number;
  is_active: boolean;
};

export type CategoryRow = {
  id: string;
  name: string;
  kind: RuleKind;
};

export type PreparedRow = {
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  kind: RuleKind;
  categoryId: string | null;
  categoryName: string | null;
  externalId: string;
  duplicate: boolean;
};

/**
 * Find the category name for a transaction by testing active rules —
 * filtered to the transaction's kind — in ascending priority order (lowest
 * number wins, first match short-circuits). Mirrors the convention in
 * seed.ts's DEFAULT_RULES, where priority restarts at 10 for each
 * applies_to group and is only meaningful within that group, not globally.
 * Rules whose pattern fails to compile as a RegExp are skipped.
 */
export function matchRuleCategoryName(
  rules: RuleRow[],
  kind: RuleKind,
  text: string
): string | null {
  const candidates = rules
    .filter((r) => r.is_active && r.applies_to === kind)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of candidates) {
    let re: RegExp;
    try {
      re = new RegExp(rule.pattern, "i");
    } catch {
      continue; // rule pattern doesn't compile — skip it
    }
    if (re.test(text)) return rule.category_name;
  }
  return null;
}

/** Case-insensitive lookup of a category by name, scoped to kind. */
export function resolveCategory(
  categories: CategoryRow[],
  kind: RuleKind,
  categoryName: string
): CategoryRow | null {
  const needle = categoryName.toLowerCase();
  return (
    categories.find((c) => c.kind === kind && c.name.toLowerCase() === needle) ??
    null
  );
}

/**
 * Turn parsed transactions into preview/import rows: kind derived from
 * direction, category resolved via rules, external_id computed for dedup.
 * Does not know about duplicates yet — call markDuplicates with the set of
 * external_ids already present in the DB for the account.
 */
export function prepareRows(input: {
  transactions: ParsedTransaction[];
  accountId: string;
  rules: RuleRow[];
  categories: CategoryRow[];
}): Omit<PreparedRow, "duplicate">[] {
  const { transactions, accountId, rules, categories } = input;

  return transactions.map((t) => {
    const kind: RuleKind = t.direction === "debit" ? "expense" : "income";
    const matchText = t.merchant ?? t.description;
    const ruleCategoryName = matchRuleCategoryName(rules, kind, matchText);
    const category = ruleCategoryName
      ? resolveCategory(categories, kind, ruleCategoryName)
      : null;

    const externalId = computeExternalId({
      accountId,
      date: t.date,
      amount: t.amount,
      description: t.description,
      ordinal: t.ordinal,
    });

    return {
      date: t.date,
      description: t.description,
      merchant: t.merchant,
      amount: t.amount,
      kind,
      categoryId: category?.id ?? null,
      categoryName: category?.name ?? null,
      externalId,
    };
  });
}

/** Mark rows whose external_id already exists in the DB for this account. */
export function markDuplicates(
  rows: Omit<PreparedRow, "duplicate">[],
  existingExternalIds: Set<string> | string[]
): PreparedRow[] {
  const existing =
    existingExternalIds instanceof Set
      ? existingExternalIds
      : new Set(existingExternalIds);
  return rows.map((r) => ({ ...r, duplicate: existing.has(r.externalId) }));
}
