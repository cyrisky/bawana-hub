// Verification harness for the BCA statement parser.
// Run with: node --experimental-strip-types scripts/verify-parser.ts
//
// Parses the real sample statement and prints a summary so the parser's
// output can be eyeballed against manual inspection of the PDF.

import { readFileSync } from "node:fs";
import { parseBcaStatement } from "../src/modules/finance/import/parse-bca-statement.ts";

const SAMPLE_PATH =
  "/Users/crisbawana/Devs/Bawana/BawanaPocket/estatement/2810504806_JAN_2026.pdf";

function fmtTx(tx: {
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  direction: string;
  balance: number | null;
  ordinal: number;
}): string {
  return `  #${tx.ordinal} ${tx.date} ${tx.direction.padEnd(6)} ${String(tx.amount).padStart(12)} bal=${tx.balance ?? "null"} merchant=${JSON.stringify(tx.merchant)} desc=${JSON.stringify(tx.description.slice(0, 60))}`;
}

async function main() {
  const buffer = readFileSync(SAMPLE_PATH);
  const statement = await parseBcaStatement(buffer);

  console.log("accountNumber:", statement.accountNumber);
  console.log("period:", statement.period);
  console.log("openingBalance:", statement.openingBalance);
  console.log("closingBalance:", statement.closingBalance);
  console.log("transaction count:", statement.transactions.length);

  const nanCount = statement.transactions.filter((t) => Number.isNaN(t.amount)).length;
  console.log("NaN amounts:", nanCount);

  console.log("\nFirst 3 transactions:");
  statement.transactions.slice(0, 3).forEach((t) => console.log(fmtTx(t)));

  console.log("\nLast 3 transactions:");
  statement.transactions.slice(-3).forEach((t) => console.log(fmtTx(t)));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
