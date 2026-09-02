"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_CATEGORIES,
  DEFAULT_RULES,
} from "./seed";

async function userId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, uid: user.id };
}

export async function createAccount(formData: FormData) {
  const { supabase, uid } = await userId();
  const { error } = await supabase.from("finance_accounts").insert({
    user_id: uid,
    name: String(formData.get("name")),
    type: String(formData.get("type")),
    opening_balance: Number(formData.get("opening_balance") || 0),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}

export async function createCategory(formData: FormData) {
  const { supabase, uid } = await userId();
  const { error } = await supabase.from("finance_categories").insert({
    user_id: uid,
    name: String(formData.get("name")),
    kind: String(formData.get("kind")),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
}

export async function createTransaction(formData: FormData) {
  const { supabase, uid } = await userId();
  const kind = String(formData.get("kind"));
  const categoryId = formData.get("category_id");
  const transferAccountId = formData.get("transfer_account_id");
  const { error } = await supabase.from("finance_transactions").insert({
    user_id: uid,
    account_id: String(formData.get("account_id")),
    category_id: kind !== "transfer" && categoryId ? String(categoryId) : null,
    kind,
    amount: Number(formData.get("amount")),
    transfer_account_id:
      kind === "transfer" && transferAccountId
        ? String(transferAccountId)
        : null,
    occurred_at: new Date(
      String(formData.get("occurred_at") || new Date().toISOString())
    ).toISOString(),
    note: String(formData.get("note") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  const { supabase } = await userId();
  const { error } = await supabase
    .from("finance_transactions")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/finance");
  revalidatePath("/");
}

/**
 * Seed a fresh account with the default categories, accounts, and
 * categorization rules. Idempotent: each table is only populated if it is
 * currently empty for this user, so re-running (or racing) is safe.
 */
export async function seedFinanceDefaults() {
  const { supabase, uid } = await userId();

  const [{ count: categoryCount }, { count: accountCount }, { count: ruleCount }] =
    await Promise.all([
      supabase
        .from("finance_categories")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid),
      supabase
        .from("finance_accounts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid),
      supabase
        .from("finance_rules")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid),
    ]);

  if (!categoryCount) {
    const { error } = await supabase.from("finance_categories").insert(
      DEFAULT_CATEGORIES.map((c) => ({
        user_id: uid,
        name: c.name,
        kind: c.kind,
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (!accountCount) {
    const { error } = await supabase.from("finance_accounts").insert(
      DEFAULT_ACCOUNTS.map((a) => ({
        user_id: uid,
        name: a.name,
        type: a.type,
        opening_balance: 0,
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (!ruleCount) {
    const { error } = await supabase.from("finance_rules").insert(
      DEFAULT_RULES.map((r) => ({
        user_id: uid,
        pattern: r.pattern,
        applies_to: r.applies_to,
        category_name: r.category_name,
        priority: r.priority,
        origin: "seed",
      }))
    );
    if (error) throw new Error(error.message);
  }

  revalidatePath("/finance");
}
