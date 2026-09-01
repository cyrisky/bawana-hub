"use client";

import { useRef } from "react";
import { addPlanExercise, createPlanDay, startSession } from "../actions";
import type { GymExercise, GymPlan } from "../types";
import { WEEKDAYS } from "../types";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function PlanView({
  plan,
  exercises,
}: {
  plan: GymPlan;
  exercises: GymExercise[];
}) {
  const exerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? "?";

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">
          {plan.name}
          {plan.goal && (
            <span className="ml-2 text-xs font-normal text-ink-muted">
              {plan.goal}
            </span>
          )}
        </h3>
      </div>

      {plan.gym_plan_days.map((day) => (
        <div
          key={day.id}
          className="rounded-lg border border-edge p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">
              {day.title}
              {day.weekday !== null && (
                <span className="ml-2 text-xs text-ink-muted">
                  {WEEKDAYS[day.weekday]}
                </span>
              )}
            </div>
            <Button variant="secondary" onClick={() => startSession(day.id)}>
              Start workout
            </Button>
          </div>
          {day.gym_plan_exercises.length > 0 && (
            <ul className="mb-3 space-y-1 text-sm">
              {day.gym_plan_exercises.map((pe) => (
                <li key={pe.id} className="flex justify-between">
                  <span>{exerciseName(pe.exercise_id)}</span>
                  <span className="text-ink-muted tabular-nums">
                    {pe.target_sets ?? "?"} × {pe.target_reps ?? "?"}
                    {pe.target_weight_kg ? ` @ ${pe.target_weight_kg}kg` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <AddExerciseToDay dayId={day.id} exercises={exercises} />
        </div>
      ))}

      <AddDayForm planId={plan.id} />
    </div>
  );
}

function AddDayForm({ planId }: { planId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createPlanDay(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="plan_id" value={planId} />
      <Field label="New day" className="min-w-36 flex-1">
        <Input name="title" placeholder="e.g. Push day" required />
      </Field>
      <Field label="Weekday">
        <Select name="weekday" defaultValue="">
          <option value="">—</option>
          {WEEKDAYS.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" variant="secondary">
        Add day
      </Button>
    </form>
  );
}

function AddExerciseToDay({
  dayId,
  exercises,
}: {
  dayId: string;
  exercises: GymExercise[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  if (exercises.length === 0) return null;
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addPlanExercise(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="plan_day_id" value={dayId} />
      <Field label="Exercise" className="min-w-36 flex-1">
        <Select name="exercise_id" required>
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Sets">
        <Input name="target_sets" type="number" min="1" defaultValue="3" className="w-16" />
      </Field>
      <Field label="Reps">
        <Input name="target_reps" placeholder="8-12" className="w-20" />
      </Field>
      <Field label="Kg">
        <Input name="target_weight_kg" type="number" step="any" className="w-20" />
      </Field>
      <Button type="submit" variant="secondary">
        Add
      </Button>
    </form>
  );
}
