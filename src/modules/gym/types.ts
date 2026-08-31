export interface GymExercise {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
}

export interface GymPlanExercise {
  id: string;
  exercise_id: string;
  sort_order: number;
  target_sets: number | null;
  target_reps: string | null;
  target_weight_kg: number | null;
  rest_seconds: number | null;
}

export interface GymPlanDay {
  id: string;
  title: string;
  weekday: number | null;
  sort_order: number;
  gym_plan_exercises: GymPlanExercise[];
}

export interface GymPlan {
  id: string;
  name: string;
  goal: string | null;
  is_active: boolean;
  gym_plan_days: GymPlanDay[];
}

export interface GymSessionSet {
  id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  rpe: number | null;
}

export interface GymSession {
  id: string;
  plan_day_id: string | null;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
