// Default categories, accounts, and categorization rules for a fresh finance
// setup. Ported from BawanaPocket's app/lib/categories.ts. Transfers are
// first-class in this schema (kind = 'transfer' + transfer_group_id), so the
// original 'internal_transfer' category and its rules are dropped here.
import type { AccountType } from "./types";

export type SeedCategory = {
  name: string;
  kind: "income" | "expense";
};

export type SeedRule = {
  // Regex source (no delimiters/flags) — matched case-insensitively at apply time.
  pattern: string;
  applies_to: "expense" | "income";
  category_name: string;
  priority: number;
};

export type SeedAccount = {
  name: string;
  type: AccountType;
};

export const DEFAULT_CATEGORIES: SeedCategory[] = [
  { name: "Food & Drink", kind: "expense" },
  { name: "Groceries", kind: "expense" },
  { name: "Fuel", kind: "expense" },
  { name: "Transport", kind: "expense" },
  { name: "E-Commerce", kind: "expense" },
  { name: "E-Wallet Top-up", kind: "expense" },
  { name: "Debt Payment", kind: "expense" },
  { name: "Salary", kind: "income" },
  { name: "Freelance", kind: "income" },
  { name: "Utilities", kind: "expense" },
  { name: "Health", kind: "expense" },
  { name: "Entertainment", kind: "expense" },
  { name: "Bank Fee", kind: "expense" },
  { name: "ATM / Cash", kind: "expense" },
  { name: "Interest", kind: "income" },
  { name: "Reimbursement", kind: "income" },
  { name: "Investment", kind: "expense" },
  { name: "Other Income", kind: "income" },
  { name: "Family", kind: "expense" },
  { name: "Self Grooming", kind: "expense" },
  { name: "Other", kind: "expense" },
  { name: "Rent / Kost", kind: "expense" },
  { name: "Vehicle Service", kind: "expense" },
  { name: "Shopping", kind: "expense" },
  { name: "Miscellaneous", kind: "expense" },
  { name: "Misc Income", kind: "income" },
];

// Rules are evaluated in ascending priority order (lowest number first,
// mirroring the original first-match-wins list order); the first active
// match wins.
export const DEFAULT_RULES: SeedRule[] = [
  // --- debit (expense) rules --------------------------------------------
  { pattern: "SPBU", applies_to: "expense", category_name: "Fuel", priority: 10 },
  { pattern: "IDM INDOMA|INDOMARET", applies_to: "expense", category_name: "Groceries", priority: 20 },
  { pattern: "ALFAMART", applies_to: "expense", category_name: "Groceries", priority: 30 },
  { pattern: "MIDI REGUL|LAWSON|CIRCLE K", applies_to: "expense", category_name: "Groceries", priority: 40 },
  { pattern: "SUPERIN", applies_to: "expense", category_name: "Groceries", priority: 50 },
  { pattern: "KARTU KREDIT|KARTU KR", applies_to: "expense", category_name: "Debt Payment", priority: 60 },
  { pattern: "KREDIVO", applies_to: "expense", category_name: "Debt Payment", priority: 70 },
  { pattern: "SAMAKITA", applies_to: "expense", category_name: "Debt Payment", priority: 80 },
  { pattern: "SPAYLATER", applies_to: "expense", category_name: "Debt Payment", priority: 90 },
  { pattern: "TVLK PAYLATE|TRAVELOKA PAY", applies_to: "expense", category_name: "Debt Payment", priority: 100 },
  { pattern: "SPINJAM", applies_to: "expense", category_name: "Debt Payment", priority: 110 },
  { pattern: "FLAZZ BCA|FLAZZ", applies_to: "expense", category_name: "E-Wallet Top-up", priority: 120 },
  { pattern: "OVO", applies_to: "expense", category_name: "E-Wallet Top-up", priority: 130 },
  { pattern: "SHOPEEPAY|SHOPEE", applies_to: "expense", category_name: "E-Wallet Top-up", priority: 140 },
  { pattern: "GO-PAY|GOPAY", applies_to: "expense", category_name: "E-Wallet Top-up", priority: 150 },
  { pattern: "DANA", applies_to: "expense", category_name: "E-Wallet Top-up", priority: 160 },
  { pattern: "TOKOPEDIA|PT Tokoped", applies_to: "expense", category_name: "E-Commerce", priority: 170 },
  { pattern: "BLIBLI", applies_to: "expense", category_name: "E-Commerce", priority: 180 },
  { pattern: "LAZADA", applies_to: "expense", category_name: "E-Commerce", priority: 190 },
  { pattern: "TARIKAN ATM", applies_to: "expense", category_name: "ATM / Cash", priority: 200 },
  { pattern: "BIAYA ADM", applies_to: "expense", category_name: "Bank Fee", priority: 210 },
  { pattern: "BIF BIAYA TXN", applies_to: "expense", category_name: "Bank Fee", priority: 220 },
  { pattern: "PLN|TOKEN LISTRIK|NEW PLN", applies_to: "expense", category_name: "Utilities", priority: 230 },
  { pattern: "PDAM|TELKOM|TELP", applies_to: "expense", category_name: "Utilities", priority: 240 },
  { pattern: "KLINIK|APOTEK|KIMIA FARMA|RS ", applies_to: "expense", category_name: "Health", priority: 250 },
  { pattern: "GRAB TRANS|GOJEK TRANS|MAXIM", applies_to: "expense", category_name: "Transport", priority: 260 },
  { pattern: "KCIC", applies_to: "expense", category_name: "Transport", priority: 270 },
  { pattern: "MORANG MOT", applies_to: "expense", category_name: "Transport", priority: 280 },
  { pattern: "RUKITA", applies_to: "expense", category_name: "Rent / Kost", priority: 290 },
  { pattern: "MAMIKOS", applies_to: "expense", category_name: "Rent / Kost", priority: 300 },
  { pattern: "BENGKEL", applies_to: "expense", category_name: "Vehicle Service", priority: 310 },
  { pattern: "SERVIS.*NMAX|SERVIS.*MOTOR|SERVIS.*MOBIL", applies_to: "expense", category_name: "Vehicle Service", priority: 320 },
  { pattern: "DECATHLON", applies_to: "expense", category_name: "Shopping", priority: 330 },
  { pattern: "K3 MART", applies_to: "expense", category_name: "Shopping", priority: 340 },
  { pattern: "PLUANG", applies_to: "expense", category_name: "Investment", priority: 350 },
  { pattern: "BIBIT|AJAIB|BAREKSA|STOCKBIT", applies_to: "expense", category_name: "Investment", priority: 360 },
  { pattern: "GRAB FOOD|GOFOOD", applies_to: "expense", category_name: "Food & Drink", priority: 370 },
  { pattern: "warteg|Warteg|WARTEG", applies_to: "expense", category_name: "Food & Drink", priority: 380 },
  { pattern: "WARUNG|WAROENG|WARJO", applies_to: "expense", category_name: "Food & Drink", priority: 390 },
  { pattern: "Bakmi|BAKMI|bakmi", applies_to: "expense", category_name: "Food & Drink", priority: 400 },
  { pattern: "Wizzmie|WIZZMIE", applies_to: "expense", category_name: "Food & Drink", priority: 410 },
  { pattern: "KWETIAU|MISOA", applies_to: "expense", category_name: "Food & Drink", priority: 420 },
  { pattern: "\\bMIE\\b", applies_to: "expense", category_name: "Food & Drink", priority: 430 },
  { pattern: "Nasi|NASI", applies_to: "expense", category_name: "Food & Drink", priority: 440 },
  { pattern: "KFC|McDonald|Burger|PIZZA", applies_to: "expense", category_name: "Food & Drink", priority: 450 },
  { pattern: "d'BestO|dBestO|DBESTO", applies_to: "expense", category_name: "Food & Drink", priority: 460 },
  { pattern: "Yoshinoya", applies_to: "expense", category_name: "Food & Drink", priority: 470 },
  { pattern: "BEARD PAPA", applies_to: "expense", category_name: "Food & Drink", priority: 480 },
  { pattern: "Chicken", applies_to: "expense", category_name: "Food & Drink", priority: 490 },
  { pattern: "ROTI O|Kopinaka|Kopi", applies_to: "expense", category_name: "Food & Drink", priority: 500 },
  { pattern: "CHATIME|Teazzi|CHAGEE", applies_to: "expense", category_name: "Food & Drink", priority: 510 },
  { pattern: "Coffee|COFFE", applies_to: "expense", category_name: "Food & Drink", priority: 520 },
  { pattern: "\\bTeh\\b", applies_to: "expense", category_name: "Food & Drink", priority: 530 },
  { pattern: "DIMSUM|HAKA", applies_to: "expense", category_name: "Food & Drink", priority: 540 },
  { pattern: "Ketoprak|Loteav|steak|STEA", applies_to: "expense", category_name: "Food & Drink", priority: 550 },
  { pattern: "Sate|Satee", applies_to: "expense", category_name: "Food & Drink", priority: 560 },
  { pattern: "Seafood|SEAFOOD", applies_to: "expense", category_name: "Food & Drink", priority: 570 },
  { pattern: "SOLARIA", applies_to: "expense", category_name: "Food & Drink", priority: 580 },
  { pattern: "MAISON", applies_to: "expense", category_name: "Food & Drink", priority: 590 },
  { pattern: "SUMODA", applies_to: "expense", category_name: "Food & Drink", priority: 600 },
  { pattern: "PHOTOTIME|Photobooth", applies_to: "expense", category_name: "Entertainment", priority: 610 },
  { pattern: "SELECT PS|GAME|STEAM", applies_to: "expense", category_name: "Entertainment", priority: 620 },
  { pattern: "GIMPI|ZARA|H&M|UNIQLO", applies_to: "expense", category_name: "Entertainment", priority: 630 },
  { pattern: "Youtube|YOUTUBE|NETFLIX|SPOTIFY", applies_to: "expense", category_name: "Entertainment", priority: 640 },

  // --- credit (income) rules ----------------------------------------------
  { pattern: "salary|gaji", applies_to: "income", category_name: "Salary", priority: 10 },
  { pattern: "\\bTHR\\b", applies_to: "income", category_name: "Salary", priority: 20 },
  { pattern: "PAYPAL", applies_to: "income", category_name: "Freelance", priority: 30 },
  { pattern: "BUNGA", applies_to: "income", category_name: "Interest", priority: 40 },
];

export const DEFAULT_ACCOUNTS: SeedAccount[] = [
  { name: "BCA", type: "bank" },
  { name: "Blu", type: "bank" },
  { name: "Dana", type: "ewallet" },
  { name: "ShopeePay", type: "ewallet" },
  { name: "OVO", type: "ewallet" },
  { name: "GoPay", type: "ewallet" },
  { name: "BRI", type: "credit_card" },
  { name: "Yup!", type: "credit_card" },
  { name: "Kredivo", type: "paylater" },
  { name: "ShopeePayLater", type: "paylater" },
  { name: "TikTok PayLater", type: "paylater" },
  { name: "SPinjam", type: "paylater" },
  { name: "BliBli PayLater", type: "paylater" },
];
