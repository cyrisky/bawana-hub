import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { getExercises, getPlans, getRecentSessions } from "@/modules/gym/queries";
import { ExerciseForm, PlanForm } from "@/modules/gym/components/exercise-form";
import { PlanView } from "@/modules/gym/components/plan-view";

export default async function GymPage() {
  const [exercises, plans, sessions] = await Promise.all([
    getExercises(),
    getPlans(),
    getRecentSessions(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Gym</h1>

      {plans.length === 0 ? (
        <Card title="Create your plan">
          <PlanForm />
        </Card>
      ) : (
        plans.map((plan) => (
          <Card key={plan.id} title="Plan">
            <PlanView plan={plan} exercises={exercises} />
          </Card>
        ))
      )}

      <Card title="Exercise library">
        {exercises.length > 0 && (
          <ul className="mb-4 divide-y divide-edge text-sm">
            {exercises.map((e) => (
              <li key={e.id} className="flex justify-between py-1.5">
                <span>{e.name}</span>
                <span className="text-xs text-ink-muted">
                  {[e.muscle_group, e.equipment].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
        <ExerciseForm />
      </Card>

      {plans.length > 0 && (
        <Card title="New plan">
          <PlanForm />
        </Card>
      )}

      <Card title="Recent sessions">
        {sessions.length === 0 ? (
          <p className="text-sm text-ink-muted">No workouts logged yet.</p>
        ) : (
          <ul className="divide-y divide-edge text-sm">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/gym/session/${s.id}`}
                  className="flex justify-between py-2 hover:text-signal"
                >
                  <span>{formatDateTime(s.started_at)}</span>
                  <span className="text-xs text-ink-muted">
                    {s.ended_at ? "finished" : "in progress"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
