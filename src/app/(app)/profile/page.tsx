import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import {
  MetricForm,
  ProfileForm,
  type Profile,
} from "@/modules/profile/components/profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: metrics }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    supabase
      .from("health_metrics")
      .select("id, metric, value, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(15),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <Card title="Personal data">
        {profile ? (
          <ProfileForm profile={profile as Profile} />
        ) : (
          <p className="text-sm text-zinc-500">Profile not found.</p>
        )}
      </Card>

      <Card title="Body metrics">
        {(metrics ?? []).length > 0 && (
          <ul className="mb-4 divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {(metrics ?? []).map((m) => (
              <li key={m.id} className="flex justify-between py-1.5">
                <span className="text-zinc-500">{formatDate(m.recorded_at)}</span>
                <span>
                  {m.metric.replace(/_/g, " ")}:{" "}
                  <span className="font-medium tabular-nums">{m.value}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <MetricForm />
      </Card>
    </div>
  );
}
