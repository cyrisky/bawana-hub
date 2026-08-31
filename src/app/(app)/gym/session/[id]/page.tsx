import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { getExercises, getSession } from "@/modules/gym/queries";
import { SessionLogger } from "@/modules/gym/components/session-logger";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ session, sets }, exercises] = await Promise.all([
    getSession(id),
    getExercises(),
  ]);

  if (!session) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Workout</h1>
        <Link
          href="/gym"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← Back to gym
        </Link>
      </div>
      <Card
        title={`${formatDateTime(session.started_at)}${session.ended_at ? " — finished" : " — in progress"}`}
      >
        <SessionLogger session={session} sets={sets} exercises={exercises} />
      </Card>
    </div>
  );
}
