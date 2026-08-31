"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function userId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, uid: user.id };
}

export async function createExercise(formData: FormData) {
  const { supabase, uid } = await userId();
  const { error } = await supabase.from("gym_exercises").insert({
    user_id: uid,
    name: String(formData.get("name")),
    muscle_group: String(formData.get("muscle_group") || "") || null,
    equipment: String(formData.get("equipment") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/gym");
}

export async function createPlan(formData: FormData) {
  const { supabase, uid } = await userId();
  const { error } = await supabase.from("gym_plans").insert({
    user_id: uid,
    name: String(formData.get("name")),
    goal: String(formData.get("goal") || "") || null,
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/gym");
}

export async function createPlanDay(formData: FormData) {
  const { supabase, uid } = await userId();
  const weekday = formData.get("weekday");
  const { error } = await supabase.from("gym_plan_days").insert({
    user_id: uid,
    plan_id: String(formData.get("plan_id")),
    title: String(formData.get("title")),
    weekday: weekday !== null && weekday !== "" ? Number(weekday) : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/gym");
}

export async function addPlanExercise(formData: FormData) {
  const { supabase, uid } = await userId();
  const targetWeight = formData.get("target_weight_kg");
  const { error } = await supabase.from("gym_plan_exercises").insert({
    user_id: uid,
    plan_day_id: String(formData.get("plan_day_id")),
    exercise_id: String(formData.get("exercise_id")),
    target_sets: Number(formData.get("target_sets") || 3),
    target_reps: String(formData.get("target_reps") || "") || null,
    target_weight_kg:
      targetWeight !== null && targetWeight !== "" ? Number(targetWeight) : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/gym");
}

export async function startSession(planDayId?: string) {
  const { supabase, uid } = await userId();
  const { data, error } = await supabase
    .from("gym_sessions")
    .insert({ user_id: uid, plan_day_id: planDayId ?? null })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  redirect(`/gym/session/${data.id}`);
}

export async function logSet(formData: FormData) {
  const { supabase, uid } = await userId();
  const { error } = await supabase.from("gym_session_sets").insert({
    user_id: uid,
    session_id: String(formData.get("session_id")),
    exercise_id: String(formData.get("exercise_id")),
    set_number: Number(formData.get("set_number") || 1),
    reps: Number(formData.get("reps") || 0) || null,
    weight_kg: Number(formData.get("weight_kg") || 0) || null,
    rpe: Number(formData.get("rpe") || 0) || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/gym/session/${formData.get("session_id")}`);
}

export async function endSession(sessionId: string) {
  const { supabase } = await userId();
  const { error } = await supabase
    .from("gym_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw new Error(error.message);
  revalidatePath(`/gym/session/${sessionId}`);
  revalidatePath("/gym");
}
