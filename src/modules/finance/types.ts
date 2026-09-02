export type AccountType =
  | "cash"
  | "bank"
  | "ewallet"
  | "credit_card"
  | "investment"
  | "paylater"
  | "other";

export type TxnKind = "income" | "expense" | "transfer";

export interface FinanceAccount {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  opening_balance: number;
  is_archived: boolean;
  sort_order: number;
}

export interface FinanceCategory {
  id: string;
  name: string;
  kind: TxnKind;
  parent_id: string | null;
}

export interface FinanceTransaction {
  id: string;
  account_id: string;
  category_id: string | null;
  kind: TxnKind;
  amount: number;
  currency: string;
  transfer_account_id: string | null;
  occurred_at: string;
  note: string | null;
  tags: string[];
}
