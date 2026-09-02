import { Card } from "@/components/ui/card";
import { ScenarioList } from "@/modules/qa/components/scenario-list";
import { qaRounds, type QaRound } from "@/modules/qa/scenarios";

const statusBadgeClasses: Record<QaRound["status"], string> = {
  "in-progress": "bg-refraction text-ink",
  ready: "bg-trace text-ink",
};

const statusBadgeLabel: Record<QaRound["status"], string> = {
  "in-progress": "In progress",
  ready: "Ready",
};

export default function QaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">QA</h1>

      {qaRounds.map((round) => (
        <Card key={round.id} title={round.title}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses[round.status]}`}
            >
              {statusBadgeLabel[round.status]}
            </span>
            <span className="text-xs text-ink-muted">{round.date}</span>
          </div>

          <ScenarioList roundId={round.id} scenarios={round.scenarios} />
        </Card>
      ))}
    </div>
  );
}
