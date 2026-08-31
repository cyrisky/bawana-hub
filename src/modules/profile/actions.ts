"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function userId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, uid: user.id };
}

export async function updateProfile(formData: FormData) {
  const { supabase, uid } = await userId();
  const heightCm = formData.get("height_cm");
  const dob = formData.get("date_of_birth");
  const sex = formData.get("sex");
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") || ""),
      full_name: String(formData.get("full_name") || "") || null,
      date_of_birth: dob ? String(dob) : null,
      sex: sex ? String(sex) : null,
      height_cm: heightCm ? Number(heightCm) : null,
      timezone: String(formData.get("timezone") || "Asia/Jakarta"),
    })
    .eq("id", uid);
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}

export async function logMetric(formData: FormData) {
  const { supabase, uid } = await userId();
  const { error } = await supabase.from("health_metrics").insert({
    user_id: uid,
    metric: String(formData.get("metric")),
    value: Number(formData.get("value")),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
  revalidatePath("/");
}
