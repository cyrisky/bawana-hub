// BCA e-statement (rekening koran) PDF parser.
//
// Ported from BawanaPocket's proven parser (app/lib/parser.ts). The regex
// ladder that extracts amounts/balances from BCA's line-wrapped table layout
// is battle-tested against real statements — it is preserved as-is here.
//
// Differences from the original:
//   - No hardcoded personal data. The original BOILERPLATE list contained the
//     statement owner's literal name/address lines. Those are gone; instead
//     the repeated per-page letterhead (account-type header, branch, the
//     customer's name/address block, and the disclaimer paragraph) is
//     stripped POSITIONALLY: whenever a page-break/footer marker is seen,
//     table mode is turned off, and everything before the next "TANGGAL
//     KETERANGAN" table header (or the next dd/mm "SALDO AWAL" row) is
//     skipped regardless of its content. This works for any account holder's
//     name/address, not just one specific person's.
//   - Callers can additionally pass `extraBoilerplate` regexes to strip any
//     other lines they know to be noise (e.g. a memo line containing PII).
//   - Return shape is a flat, storage-oriented ParsedStatement/ParsedTransaction
//     (nullable account/period/balances/merchant, ISO dates, ordinal index)
//     instead of the original's UI-flavoured shape (uuid ids, categories,
//     "account"/"period" stamped on every transaction, etc).
//
// NODE RUNTIME ONLY: this module uses `node:crypto` and Node Buffers. Any
// Next.js route/server action that imports it must declare
// `export const runtime = "nodejs"` (it will not work on the edge runtime).

import { createHash } from "node:crypto";

export type ParsedTransaction = {
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** Full raw description text for this transaction (all wrapped lines joined) */
  description: string;
  /** Best-effort extracted merchant/counterparty name, if one could be found */
  merchant: string | null;
  amount: number;
  direction: "debit" | "credit";
  /** Running account balance after this transaction, if BCA printed one */
  balance: number | null;
  /** 0-based position of this transaction within the statement */
  ordinal: number;
};

export type ParsedStatement = {
  accountNumber: string | null;
  /** YYYY-MM, derived from the statement's "PERIODE" header */
  period: string | null;
  openingBalance: number | null;
  closingBalance: number | null;
  transactions: ParsedTransaction[];
};

export type ParseBcaStatementOptions = {
  /** Extra caller-supplied line patterns to strip, applied on top of the built-in boilerplate patterns. */
  extraBoilerplate?: RegExp[];
};

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/,/g, ""));
}

function toIsoDate(ddmm: string, periodYear: number, periodMonth: number): string {
  const [dd, mm] = ddmm.split("/").map(Number);
  let year = periodYear;
  if (mm < periodMonth - 1) year = periodYear + 1;
  if (mm > periodMonth + 1) year = periodYear - 1;
  return `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

const INDONESIAN_MONTHS: Record<string, number> = {
  JANUARI: 1,
  FEBRUARI: 2,
  MARET: 3,
  APRIL: 4,
  MEI: 5,
  JUNI: 6,
  JULI: 7,
  AGUSTUS: 8,
  SEPTEMBER: 9,
  OKTOBER: 10,
  NOVEMBER: 11,
  DESEMBER: 12,
};

function parsePeriod(fullText: string): { year: number; month: number; period: string | null } {
  const m = fullText
    .toUpperCase()
    .match(
      /(JANUARI|FEBRUARI|MARET|APRIL|MEI|JUNI|JULI|AGUSTUS|SEPTEMBER|OKTOBER|NOVEMBER|DESEMBER)\s+(\d{4})/,
    );
  if (!m) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, period: null };
  }
  const month = INDONESIAN_MONTHS[m[1]];
  const year = parseInt(m[2], 10);
  return { year, month, period: `${year}-${String(month).padStart(2, "0")}` };
}

function parseAccountNumber(text: string): string | null {
  const m = text.match(/NO\.\s*REKENING\s*:\s*(\d+)/);
  return m ? m[1] : null;
}

// Extract a human-readable merchant/name from a transaction's wrapped lines
// (lines[0] is always the transaction-type line, e.g. "TRANSAKSI DEBIT TGL: 01/01").
function extractMerchant(lines: string[]): string | null {
  for (let i = 0; i < lines.length; i++) {
    const cleaned = lines[i].trim();
    if (!cleaned) continue;

    // Pattern: 00000.00MERCHANTNAME (QR transaction merchant)
    const qrMerchant = cleaned.match(/^\d{5}\.\d{2}(.+)$/);
    if (qrMerchant && qrMerchant[1].trim()) return qrMerchant[1].trim();

    // Skip first line (transaction type)
    if (i === 0) continue;

    // Skip pure dates
    if (/^\d{2}\/\d{2}$/.test(cleaned)) continue;
    if (/^TGL:\s*\d{2}\/\d{2}$/.test(cleaned)) continue;
    if (/^TANGGAL\s*:\s*\d{2}\/\d{2}$/.test(cleaned)) continue;

    // Skip QR codes
    if (/^QRC?\d+$/.test(cleaned)) continue;
    if (/^QR\s+\d+$/.test(cleaned)) continue;

    // Skip bare reference amounts like "870000.00"
    if (/^\d+\.\d{2}$/.test(cleaned)) continue;

    // Skip CBG + amount line like "0938 1,192,278.03"
    if (/^\d{4}\s+[\d,]+\.\d{2}$/.test(cleaned)) continue;

    // Skip long purely alphanumeric references
    if (/^[A-Z0-9]{12,}$/.test(cleaned)) continue;

    // Skip transaction reference codes like "0301/FTSCY/WS95271"
    if (/^\d{4}\/[A-Z]+\/[A-Z0-9]+$/.test(cleaned)) continue;

    // Skip "TOPUP" lines (Flazz card number reference)
    if (/^TOPUP\d+$/.test(cleaned)) continue;

    // Lines starting with numeric reference codes like "38165/SAMAKITA" → extract name part
    const refMatch = cleaned.match(/^\d{5}\/(.+)$/);
    if (refMatch) return refMatch[1].trim();

    // This looks readable — return it
    return cleaned;
  }

  // Fallback: strip date prefix from first line
  const fallback = lines[0]
    ?.replace(/^\d{2}\/\d{2}\s+/, "")
    .replace(/TGL:\s*\d{2}\/\d{2}/, "")
    .trim();
  return fallback ? fallback : null;
}

type TxGroup = { dateStr: string; lines: string[] };

// Generic, account-holder-agnostic boilerplate: bank headers/labels, footers,
// page markers. Deliberately does NOT include the customer name/address
// block — that varies per statement and is stripped positionally instead
// (see the inTable/page-break handling in the parse loop below).
const DEFAULT_BOILERPLATE: RegExp[] = [
  /^REKENING\s+(TAHAPAN|GIRO|TAPRES|SIMPANAN|PRIMA)/i, // account product header line
  /^NO\.\s*REKENING/,
  /^HALAMAN\s*:/,
  /^PERIODE\s*:/,
  /^MATA UANG\s*:/,
  /^FASILITAS\s*:/,
  /^KETERANGAN\s*:/,
  /^Bersambung ke halaman/i, // "continued on next page" footer
  /^-- \d+ of \d+ --$/, // page-extraction marker
  /^\d+ \/\d+$/, // page indicator like "1 /8"
];

export async function parseBcaStatement(
  buffer: Buffer | Uint8Array,
  opts?: ParseBcaStatementOptions,
): Promise<ParsedStatement> {
  const { PDFParse } = await import("pdf-parse");
  // BCA statement PDFs are AES-encrypted with an empty user password.
  // pdf.js/pdf-parse decrypts automatically, but pass an explicit empty
  // password so the behavior doesn't depend on that default.
  const parser = new PDFParse({ data: new Uint8Array(buffer), password: "" });
  const result = await parser.getText();
  const fullText = result.text;
  await parser.destroy();

  const { year, month, period } = parsePeriod(fullText);
  const accountNumber = parseAccountNumber(fullText);

  const saldoAwalM = fullText.match(/SALDO AWAL\s*:\s*([\d,]+\.\d{2})/);
  const saldoAkhirM = fullText.match(/SALDO AKHIR\s*:\s*([\d,]+\.\d{2})/);

  const openingBalance = saldoAwalM ? parseAmount(saldoAwalM[1]) : null;
  const closingBalance = saldoAkhirM ? parseAmount(saldoAkhirM[1]) : null;

  const extraBoilerplate = opts?.extraBoilerplate ?? [];

  const allLines = fullText
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0);

  // --- Build transaction groups by collecting lines between date markers ---
  const groups: TxGroup[] = [];
  let current: TxGroup | null = null;
  let inTable = false;
  let done = false;

  for (const line of allLines) {
    if (done) break;

    if (DEFAULT_BOILERPLATE.some((re) => re.test(line))) {
      // Page-break/footer markers additionally drop us out of table mode:
      // everything that follows (the next page's letterhead — account
      // header, branch, customer name/address, disclaimer paragraph) is
      // positionally boilerplate until the table header repeats, regardless
      // of its content. This is what lets us avoid hardcoding anyone's
      // literal name/address.
      if (/^Bersambung ke halaman/i.test(line) || /^-- \d+ of \d+ --$/.test(line)) {
        inTable = false;
      }
      continue;
    }
    if (extraBoilerplate.some((re) => re.test(line))) continue;

    // Stop permanently at first SALDO AKHIR (main account summary)
    if (/^SALDO AKHIR\s*:/.test(line)) {
      done = true;
      break;
    }
    if (/^SALDO AWAL\s*:/.test(line)) {
      inTable = false;
      continue;
    }
    if (/^MUTASI (CR|DB)\s*:/.test(line)) continue;

    if (!inTable) {
      if (/^TANGGAL\s+KETERANGAN/.test(line)) {
        inTable = true;
        continue;
      }
      if (/^\d{2}\/\d{2}\s+SALDO AWAL/.test(line)) {
        inTable = true;
      }
      if (!inTable) continue;
    }

    // New transaction starts with date
    const dateMatch = line.match(/^(\d{2}\/\d{2})\s+(.+)/);
    if (dateMatch) {
      if (current) groups.push(current);
      current = { dateStr: dateMatch[1], lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) groups.push(current);

  const transactions: ParsedTransaction[] = [];

  for (const { dateStr, lines } of groups) {
    const firstLineContent = lines[0].replace(/^\d{2}\/\d{2}\s+/, "").trim();

    // Skip opening balance marker
    if (/^SALDO AWAL/.test(firstLineContent)) continue;

    const isCredit =
      /^KR OTOMATIS/.test(firstLineContent) ||
      /^TRSF E-BANKING CR/.test(firstLineContent) ||
      /^BUNGA/.test(firstLineContent);

    const fullDesc = lines.join(" ");
    let amount: number | null = null;
    let balance: number | null = null;
    let direction: "debit" | "credit" = isCredit ? "credit" : "debit";

    // ── Special case: single-line transactions (BUNGA, BIAYA ADM, TARIKAN ATM, KARTU KREDIT) ──
    // These have amount inline on the first line
    const inlineDebit = lines[0].match(/([\d,]+\.\d{2})\s+DB\s+([\d,]+\.\d{2})$/);
    if (inlineDebit) {
      amount = parseAmount(inlineDebit[1]);
      balance = parseAmount(inlineDebit[2]);
      direction = "debit";
    }

    const inlineCredit = lines[0].match(/([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$/);
    if (!inlineDebit && inlineCredit && isCredit) {
      // BUNGA line: "31/01 BUNGA 56.64 3,617,507.57"
      amount = parseAmount(inlineCredit[1]);
      balance = parseAmount(inlineCredit[2]);
    }

    // ── Multi-line: scan from the end for amount ──
    if (amount === null) {
      for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i];

        // "AMOUNT DB BALANCE"
        const m1 = l.match(/([\d,]+\.\d{2})\s+(DB|CR)\s+([\d,]+\.\d{2})$/);
        if (m1) {
          amount = parseAmount(m1[1]);
          direction = m1[2] === "CR" ? "credit" : "debit";
          balance = parseAmount(m1[3]);
          break;
        }

        // "AMOUNT DB" (no balance shown)
        const m2 = l.match(/([\d,]+\.\d{2})\s+(DB|CR)$/);
        if (m2) {
          amount = parseAmount(m2[1]);
          direction = m2[2] === "CR" ? "credit" : "debit";
          // Look ahead for balance
          if (i + 1 < lines.length) {
            const nb = lines[i + 1].match(/^([\d,]+\.\d{2})$/);
            if (nb) balance = parseAmount(nb[1]);
          }
          break;
        }

        // KR OTOMATIS / TRSF E-BANKING CR: "CBG AMOUNT" (credit, no DB/CR tag)
        const m3 = l.match(/^(\d{4})\s+([\d,]+\.\d{2})$/);
        if (m3 && isCredit) {
          amount = parseAmount(m3[2]);
          direction = "credit";
          break;
        }

        // Bare amount line "AMOUNT" (TRSF E-BANKING CR last line)
        const m4 = l.match(/^([\d,]+\.\d{2})$/);
        if (m4 && isCredit && i > 0) {
          amount = parseAmount(m4[1]);
          direction = "credit";
          break;
        }
      }
    }

    if (amount === null || amount === 0) continue;

    let merchant = extractMerchant(lines);
    if (merchant) {
      // For inline single-line transactions, strip the trailing amount/balance from merchant name
      if (merchant.includes(" DB ") || merchant.includes(" CR ")) {
        merchant = merchant.split(/\s+(?:DB|CR)\s+/)[0].trim();
      }
      // Strip trailing amount-like suffixes (e.g. "TARIKAN ATM 26/01 300,000.00")
      merchant = merchant.replace(/\s+[\d,]+\.\d{2}$/, "").trim();
      // Strip trailing date (e.g. "TARIKAN ATM 26/01")
      merchant = merchant.replace(/\s+\d{2}\/\d{2}$/, "").trim();
      if (!merchant) merchant = null;
    }

    const isoDate = toIsoDate(dateStr, year, month);

    transactions.push({
      date: isoDate,
      description: fullDesc,
      merchant,
      amount,
      direction,
      balance,
      ordinal: transactions.length,
    });
  }

  return {
    accountNumber,
    period,
    openingBalance,
    closingBalance,
    transactions,
  };
}

/**
 * Deterministic external id for a parsed transaction, used to dedupe imports.
 * sha256 hex of the fields joined with "|". `ordinal` makes same-day,
 * same-amount duplicate transactions (e.g. two identical QR payments) distinct.
 */
export function computeExternalId(input: {
  accountId: string;
  date: string;
  amount: number;
  description: string;
  ordinal: number;
}): string {
  const joined = [
    input.accountId,
    input.date,
    String(input.amount),
    input.description,
    String(input.ordinal),
  ].join("|");
  return createHash("sha256").update(joined).digest("hex");
}
