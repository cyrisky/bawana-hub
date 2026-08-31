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
          <ul className="mb-4 divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {exercises.map((e) => (
              <li key={e.id} className="flex justify-between py-1.5">
                <span>{e.name}</span>
                <span className="text-xs text-zinc-500">
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No workouts logged yet.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/gym/session/${s.id}`}
                  className="flex justify-between py-2 hover:text-teal-600 dark:hover:text-teal-400"
                >
                  <span>{formatDateTime(s.started_at)}</span>
                  <span className="text-xs text-zinc-500">
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
