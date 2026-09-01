import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { formatDateTime, formatIDR } from "@/lib/format";
import { getFinanceSummary } from "@/modules/finance/queries";
import { getRecentSessions } from "@/modules/gym/queries";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [finance, sessions, { data: profile }, { data: weight }] =
    await Promise.all([
      getFinanceSummary(),
      getRecentSessions(1),
      supabase.from("profiles").select("display_name").maybeSingle(),
      supabase
        .from("health_metrics")
        .select("value, recorded_at")
        .eq("metric", "weight_kg")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const lastSession = sessions[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">
        Hey{profile?.display_name ? `, ${profile.display_name}` : ""} 👋
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Finance" action={<ModuleLink href="/finance" />}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Net worth" value={formatIDR(finance.netWorth)} />
            <Stat
              label="In (month)"
              value={formatIDR(finance.monthIncome)}
              tone="positive"
            />
            <Stat
              label="Out (month)"
              value={formatIDR(finance.monthExpense)}
              tone="negative"
            />
          </div>
        </Card>

        <Card title="Gym" action={<ModuleLink href="/gym" />}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat
              label="Last workout"
              value={lastSession ? formatDateTime(lastSession.started_at) : "—"}
            />
            <Stat
              label="Weight"
              value={weight ? `${weight.value} kg` : "—"}
            />
          </div>
        </Card>
      </div>

      <p className="text-sm text-ink-muted">
        More life modules (work, personal, …) plug in here as they land.
      </p>
    </div>
  );
}

function ModuleLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-medium text-ink-muted hover:text-signal"
    >
      Open →
    </Link>
  );
}
