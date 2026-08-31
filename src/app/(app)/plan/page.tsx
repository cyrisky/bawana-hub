import { Card } from "@/components/ui/card";
import { roadmap, type PhaseStatus } from "@/modules/plan/roadmap";

const phaseBadgeClasses: Record<PhaseStatus, string> = {
  done: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  "in-progress":
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  planned: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

const phaseBadgeLabel: Record<PhaseStatus, string> = {
  done: "Done",
  "in-progress": "In progress",
  planned: "Planned",
};

const itemDotClasses: Record<PhaseStatus, string> = {
  done: "bg-teal-500 dark:bg-teal-400",
  "in-progress": "bg-amber-500 dark:bg-amber-400",
  planned: "bg-zinc-300 dark:bg-zinc-600",
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
              <span className="text-xs text-zinc-400">{phase.timeframe}</span>
            )}
          </div>

          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
            {phase.summary}
          </p>

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
                    <div className="text-xs text-zinc-400">{item.detail}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
