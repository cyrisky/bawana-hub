import { createClient } from "@/lib/supabase/server";
import type { GymExercise, GymPlan, GymSession, GymSessionSet } from "./types";

export async function getExercises(): Promise<GymExercise[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gym_exercises")
    .select("id, name, muscle_group, equipment")
    .eq("is_archived", false)
    .order("name");
  return (data ?? []) as GymExercise[];
}

export async function getPlans(): Promise<GymPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gym_plans")
    .select(
      `id, name, goal, is_active,
       gym_plan_days (
         id, title, weekday, sort_order,
         gym_plan_exercises (
           id, exercise_id, sort_order, target_sets, target_reps,
           target_weight_kg, rest_seconds
         )
       )`
    )
    .order("created_at", { ascending: false });
  const plans = (data ?? []) as GymPlan[];
  for (const plan of plans) {
    plan.gym_plan_days.sort((a, b) => a.sort_order - b.sort_order);
    for (const day of plan.gym_plan_days) {
      day.gym_plan_exercises.sort((a, b) => a.sort_order - b.sort_order);
    }
  }
  return plans;
}

export async function getRecentSessions(limit = 10): Promise<GymSession[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gym_sessions")
    .select("id, plan_day_id, started_at, ended_at, notes")
    .order("started_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as GymSession[];
}

export async function getSession(id: string): Promise<{
  session: GymSession | null;
  sets: GymSessionSet[];
}> {
  const supabase = await createClient();
  const [{ data: session }, { data: sets }] = await Promise.all([
    supabase
      .from("gym_sessions")
      .select("id, plan_day_id, started_at, ended_at, notes")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("gym_session_sets")
      .select("id, exercise_id, set_number, reps, weight_kg, rpe")
      .eq("session_id", id)
      .order("created_at"),
  ]);
  return {
    session: session as GymSession | null,
    sets: (sets ?? []) as GymSessionSet[],
  };
}
