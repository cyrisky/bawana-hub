import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getAccounts } from "@/modules/finance/queries";
import { ImportFlow } from "@/modules/finance/import/components/import-flow";

// parseBcaStatement uses node:crypto / pdf-parse and must run on the Node
// runtime, not the edge — this segment covers the server actions it calls.
export const runtime = "nodejs";

export default async function ImportStatementPage() {
  const accounts = await getAccounts();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Import statement</h1>
        <Link href="/finance" className="text-xs font-medium text-ink-muted hover:text-signal">
          ← Back to Finance
        </Link>
      </div>

      <Card title="BCA e-statement">
        {accounts.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Add an account first from the Finance page, then come back here.
          </p>
        ) : (
          <ImportFlow accounts={accounts} />
        )}
      </Card>
    </div>
  );
}
