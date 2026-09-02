import { Card } from "@/components/ui/card";
import { roadmap, type PhaseStatus } from "@/modules/plan/roadmap";
import {
  financePlan,
  financeArchitecture,
  financeFeatures,
  type FinanceFeature,
} from "@/modules/plan/finance-plan";

function FeatureTable({ rows }: { rows: FinanceFeature[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-edge">
          {rows.map((row, index) => (
            <tr key={row.feature}>
              <td className="py-2 pr-3 text-ink-muted tabular-nums">
                {index + 1}
              </td>
              <td className="py-2 pr-3 font-medium whitespace-nowrap">
                {row.feature}
              </td>
              <td className="py-2 text-ink-muted">{row.func}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const phaseBadgeClasses: Record<PhaseStatus, string> = {
  done: "bg-trace text-ink",
  "in-progress": "bg-refraction text-ink",
  planned: "bg-edge text-ink-muted",
};

const phaseBadgeLabel: Record<PhaseStatus, string> = {
  done: "Done",
  "in-progress": "In progress",
  planned: "Planned",
};

const itemDotClasses: Record<PhaseStatus, string> = {
  done: "bg-trace",
  "in-progress": "bg-refraction",
  planned: "bg-edge",
};

export default function PlanPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Plan</h1>

      {roadmap.map((phase) => (
        <Card
          key={phase.id}
          title={`Phase ${phase.id.replace("phase-", "")} · ${phase.name}`}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${phaseBadgeClasses[phase.status]}`}
            >
              {phaseBadgeLabel[phase.status]}
            </span>
            {phase.timeframe && (
              <span className="text-xs text-ink-muted">{phase.timeframe}</span>
            )}
          </div>

          <p className="mb-4 text-sm text-ink-muted">{phase.summary}</p>

          <ul className="space-y-3">
            {phase.items.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${itemDotClasses[item.status]}`}
                  aria-hidden
                />
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  {item.detail && (
                    <div className="text-xs text-ink-muted">{item.detail}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <h2 className="mt-2 text-lg font-semibold">Finance — detailed plan</h2>

      <Card title="Feature spec">
        <div className="space-y-6">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Build now
            </div>
            <FeatureTable
              rows={financeFeatures.filter((f) => f.phase === "now")}
            />
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Next up
            </div>
            <FeatureTable
              rows={financeFeatures.filter((f) => f.phase === "next")}
            />
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Later — insight
            </div>
            <FeatureTable
              rows={financeFeatures.filter((f) => f.phase === "later-insight")}
            />
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Later — capture & automation
            </div>
            <FeatureTable
              rows={financeFeatures.filter((f) => f.phase === "later-capture")}
            />
          </div>
        </div>
      </Card>

      {financePlan.map((section) => (
        <Card key={section.id} title={section.name}>
          <p className="mb-4 text-sm text-ink-muted">{section.blurb}</p>

          <ul className="space-y-3">
            {section.items.map((item) => (
              <li key={item.title}>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-ink-muted">{item.detail}</div>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Card title="How the data flows">
        <ul className="space-y-3">
          {financeArchitecture.map((item) => (
            <li key={item.title}>
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-ink-muted">{item.detail}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
