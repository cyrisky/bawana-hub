"use client";

import { useRef } from "react";
import { endSession, logSet } from "../actions";
import type { GymExercise, GymSession, GymSessionSet } from "../types";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function SessionLogger({
  session,
  sets,
  exercises,
}: {
  session: GymSession;
  sets: GymSessionSet[];
  exercises: GymExercise[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const exerciseName = (id: string) =>
    exercises.find((e) => e.id === id)?.name ?? "?";
  const done = session.ended_at !== null;

  return (
    <div className="space-y-4">
      {sets.length > 0 && (
        <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
          {sets.map((s) => (
            <li key={s.id} className="flex justify-between py-1.5">
              <span>
                {exerciseName(s.exercise_id)}
                <span className="ml-2 text-xs text-zinc-500">
                  set {s.set_number}
                </span>
              </span>
              <span className="tabular-nums">
                {s.reps ?? "?"} reps
                {s.weight_kg ? ` @ ${s.weight_kg}kg` : ""}
                {s.rpe ? ` · RPE ${s.rpe}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!done && (
        <>
          <form
            ref={formRef}
            action={async (formData) => {
              await logSet(formData);
              formRef.current?.reset();
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="session_id" value={session.id} />
            <Field label="Exercise" className="min-w-40 flex-1">
              <Select name="exercise_id" required>
                {exercises.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Set #">
              <Input name="set_number" type="number" min="1" defaultValue="1" className="w-16" />
            </Field>
            <Field label="Reps">
              <Input name="reps" type="number" min="0" className="w-20" />
            </Field>
            <Field label="Kg">
              <Input name="weight_kg" type="number" step="any" className="w-20" />
            </Field>
            <Field label="RPE">
              <Input name="rpe" type="number" step="0.5" min="1" max="10" className="w-16" />
            </Field>
            <Button type="submit">Log set</Button>
          </form>
          <Button variant="secondary" onClick={() => endSession(session.id)}>
            Finish workout
          </Button>
        </>
      )}
    </div>
  );
}
