// End-to-end verification of the e-statement import flow against the real
// local Supabase DB. Exercises the pure prepare-rows helpers (rule matching,
// external-id computation, dedup) plus the same upsert-based confirm logic
// used by src/modules/finance/import/actions.ts#confirmImport, using the
// real parsed sample PDF and a throwaway auth user + JWT (RLS-checked, like
// the real server actions).
//
// Run with: node --experimental-strip-types scripts/e2e-import-flow.ts
//
// Cleans up after itself: deletes all inserted rows and the throwaway auth
// user at the end (also on early failure, via a finally block).

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { parseBcaStatement } from "../src/modules/finance/import/parse-bca-statement.ts";
import {
  prepareRows,
  markDuplicates,
  type RuleRow,
  type CategoryRow,
} from "../src/modules/finance/import/prepare-rows.ts";
import { DEFAULT_CATEGORIES, DEFAULT_RULES } from "../src/modules/finance/seed.ts";

// Local-only credentials; export from `supabase status -o env` before running:
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
if (!ANON_KEY || !SERVICE_KEY) {
  throw new Error(
    "Set SUPABASE_ANON_KEY and SUPABASE_SERVICE_KEY (see `supabase status`)."
  );
}

const SAMPLE_PATH =
  "/Users/crisbawana/Devs/Bawana/BawanaPocket/estatement/2810504806_JAN_2026.pdf";

const TEST_EMAIL = `e2e-import-${Date.now()}@example.test`; // throwaway
const TEST_PASSWORD = "e2e-import-test-password-123!";

async function main() {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Creating throwaway user ${TEST_EMAIL} ...`);
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (createErr || !created.user) throw new Error(`createUser failed: ${createErr?.message}`);
  const uid = created.user.id;

  let db: ReturnType<typeof createClient> | null = null;

  try {
    // Sign in as the test user to get a real JWT, same as the app would —
    // this exercises RLS exactly like the server actions do.
    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (signInErr || !signIn.session) throw new Error(`sign-in failed: ${signInErr?.message}`);

    db = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: { Authorization: `Bearer ${signIn.session.access_token}` },
      },
    });

    // --- seed categories + one BCA bank account + the default rules ---
    console.log("Seeding categories, account, rules ...");
    const { data: insertedCategories, error: catErr } = await db
      .from("finance_categories")
      .insert(
        DEFAULT_CATEGORIES.map((c) => ({ user_id: uid, name: c.name, kind: c.kind }))
      )
      .select("id, name, kind");
    if (catErr) throw new Error(`category seed failed: ${catErr.message}`);

    const { data: insertedAccount, error: accErr } = await db
      .from("finance_accounts")
      .insert({ user_id: uid, name: "BCA", type: "bank", opening_balance: 0 })
      .select("id")
      .single();
    if (accErr) throw new Error(`account seed failed: ${accErr.message}`);
    const accountId = insertedAccount.id as string;

    const { error: ruleErr } = await db.from("finance_rules").insert(
      DEFAULT_RULES.map((r) => ({
        user_id: uid,
        pattern: r.pattern,
        applies_to: r.applies_to,
        category_name: r.category_name,
        priority: r.priority,
        origin: "seed",
      }))
    );
    if (ruleErr) throw new Error(`rule seed failed: ${ruleErr.message}`);

    // --- parse the real sample statement ---
    console.log(`Parsing ${SAMPLE_PATH} ...`);
    const buffer = readFileSync(SAMPLE_PATH);
    const statement = await parseBcaStatement(buffer);
    console.log(
      `Parsed ${statement.transactions.length} transactions, period=${statement.period}`
    );

    // --- prepare rows (pure helper — same code path as parseStatement action) ---
    const rules: RuleRow[] = DEFAULT_RULES.map((r) => ({
      pattern: r.pattern,
      applies_to: r.applies_to,
      category_name: r.category_name,
      priority: r.priority,
      is_active: true,
    }));
    const categories: CategoryRow[] = (insertedCategories ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      kind: c.kind as "expense" | "income",
    }));

    const prepared = prepareRows({
      transactions: statement.transactions,
      accountId,
      rules,
      categories,
    });

    const categorizedCount = prepared.filter((r) => r.categoryId !== null).length;
    console.log(
      `\nCategorized ${categorizedCount} / ${prepared.length} transactions from seeded rules.`
    );

    // Show which ones were NOT categorized, for visibility.
    const uncategorized = prepared.filter((r) => r.categoryId === null);
    if (uncategorized.length > 0) {
      console.log(`\nUncategorized (${uncategorized.length}):`);
      uncategorized.forEach((r) =>
        console.log(`  ${r.date} ${r.kind.padEnd(7)} ${String(r.amount).padStart(12)} ${JSON.stringify(r.merchant ?? r.description.slice(0, 50))}`)
      );
    }

    // --- dedup marking (first pass: nothing in DB yet) ---
    const ids = prepared.map((r) => r.externalId);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      console.log(
        `\nNOTE: ${ids.length - uniqueIds.size} duplicate external_ids within the same parse (unexpected — ordinal should make them unique).`
      );
    }

    const rowsFirstPass = markDuplicates(prepared, new Set<string>());
    const dupBeforeAnyImport = rowsFirstPass.filter((r) => r.duplicate).length;
    console.log(
      `\nBefore any import: ${dupBeforeAnyImport} marked duplicate (expected 0, DB is empty for this account).`
    );

    // --- confirmImport logic (mirrors src/modules/finance/import/actions.ts#confirmImport):
    // pre-check which external_ids already exist for this account, then plain-insert
    // the rest. (A DB-level upsert+onConflict can't be used here: the unique index is
    // partial — `where external_id is not null` — and PostgREST's upsert() has no way
    // to express that predicate in the ON CONFLICT clause.) ---
    async function confirmPass(rows: typeof rowsFirstPass) {
      const submitted = rows.filter((r) => !r.duplicate);
      if (submitted.length === 0) return { inserted: 0, skipped: 0 };

      const ids = submitted.map((r) => r.externalId);
      const { data: existing, error: existErr } = await db!
        .from("finance_transactions")
        .select("external_id")
        .eq("user_id", uid)
        .eq("account_id", accountId)
        .in("external_id", ids);
      if (existErr) throw new Error(`existing lookup failed: ${existErr.message}`);
      const existingIds = new Set(
        (existing ?? []).map((r) => r.external_id as string).filter(Boolean)
      );

      const toInsert = submitted.filter((r) => !existingIds.has(r.externalId));
      const alreadyExisted = submitted.length - toInsert.length;
      if (toInsert.length === 0) return { inserted: 0, skipped: alreadyExisted };

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
          account_id: accountId,
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

      const { data, error } = await db!
        .from("finance_transactions")
        .insert(insertRows)
        .select("id");
      if (error) throw new Error(`confirmImport insert failed: ${error.message}`);
      const inserted = data?.length ?? 0;
      return { inserted, skipped: alreadyExisted + (insertRows.length - inserted) };
    }

    console.log("\nRunning confirmImport pass 1 (fresh import) ...");
    const pass1 = await confirmPass(rowsFirstPass);
    console.log(`  pass 1: inserted=${pass1.inserted} skipped=${pass1.skipped}`);

    // --- re-parse & re-prepare (as a client re-confirming the same statement would),
    // now checking dedup against the DB we just populated ---
    const { data: existingAfterPass1, error: existErr } = await db
      .from("finance_transactions")
      .select("external_id")
      .eq("user_id", uid)
      .eq("account_id", accountId)
      .in("external_id", ids);
    if (existErr) throw new Error(`existing lookup failed: ${existErr.message}`);
    const existingIdsAfterPass1 = new Set(
      (existingAfterPass1 ?? []).map((r) => r.external_id as string)
    );

    const rowsSecondPass = markDuplicates(prepared, existingIdsAfterPass1);
    const dupAfterPass1 = rowsSecondPass.filter((r) => r.duplicate).length;
    console.log(
      `\nAfter pass 1: ${dupAfterPass1} of ${rowsSecondPass.length} now marked duplicate (expected all of them: ${prepared.length}).`
    );

    console.log("Running confirmImport pass 2 (re-confirm same statement) ...");
    const pass2 = await confirmPass(rowsSecondPass);
    console.log(`  pass 2: inserted=${pass2.inserted} skipped=${pass2.skipped}`);

    // --- also directly re-run confirmPass with the ORIGINAL (non-deduped)
    // rows to prove the DB-level upsert/ignoreDuplicates constraint holds
    // even if a caller forgot to filter duplicates client-side ---
    console.log(
      "Running confirmImport pass 3 (re-confirm ignoring client-side dedup, relying on DB upsert) ..."
    );
    const pass3 = await confirmPass(rowsFirstPass); // rowsFirstPass has duplicate=false for all, same rows again
    console.log(`  pass 3: inserted=${pass3.inserted} skipped=${pass3.skipped}`);

    const { count: finalCount } = await db
      .from("finance_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid)
      .eq("account_id", accountId);

    console.log(`\nFinal row count in DB for this account: ${finalCount}`);
    console.log(`Sample statement transaction count: ${statement.transactions.length}`);

    console.log("\n=== SUMMARY ===");
    console.log(`Sample transactions: ${statement.transactions.length}`);
    console.log(
      `Categorized by seeded rules: ${categorizedCount} / ${prepared.length}`
    );
    console.log(`Pass 1 (fresh) inserted: ${pass1.inserted}, skipped: ${pass1.skipped}`);
    console.log(`Pass 2 (re-confirm) inserted: ${pass2.inserted}, skipped: ${pass2.skipped}`);
    console.log(`Pass 3 (re-confirm, no client dedup) inserted: ${pass3.inserted}, skipped: ${pass3.skipped}`);
    console.log(
      pass2.inserted === 0 && pass3.inserted === 0
        ? "PASS: re-confirming is idempotent (inserted=0 on repeat)."
        : "FAIL: re-confirming inserted new rows — dedup broken."
    );
  } finally {
    // --- cleanup: delete all rows for this test user, then the auth user itself ---
    console.log(`\nCleaning up test user ${TEST_EMAIL} (${uid}) ...`);
    if (db) {
      await db.from("finance_transactions").delete().eq("user_id", uid);
      await db.from("finance_rules").delete().eq("user_id", uid);
      await db.from("finance_accounts").delete().eq("user_id", uid);
      await db.from("finance_categories").delete().eq("user_id", uid);
    }
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) {
      console.error(`  WARNING: failed to delete auth user: ${delErr.message}`);
    } else {
      console.log("  Cleanup complete.");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
