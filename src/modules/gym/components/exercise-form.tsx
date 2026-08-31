"use client";

import { useRef } from "react";
import { createExercise, createPlan } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function ExerciseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createExercise(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label="Exercise" className="min-w-40 flex-1">
        <Input name="name" placeholder="e.g. Bench Press" required />
      </Field>
      <Field label="Muscle group">
        <Select name="muscle_group" defaultValue="">
          <option value="">—</option>
          <option>chest</option>
          <option>back</option>
          <option>legs</option>
          <option>shoulders</option>
          <option>arms</option>
          <option>core</option>
          <option>full body</option>
        </Select>
      </Field>
      <Field label="Equipment">
        <Select name="equipment" defaultValue="">
          <option value="">—</option>
          <option>barbell</option>
          <option>dumbbell</option>
          <option>machine</option>
          <option>cable</option>
          <option>bodyweight</option>
        </Select>
      </Field>
      <Button type="submit" variant="secondary">
        Add exercise
      </Button>
    </form>
  );
}

export function PlanForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createPlan(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label="Plan name" className="min-w-40 flex-1">
        <Input name="name" placeholder="e.g. Push Pull Legs" required />
      </Field>
      <Field label="Goal">
        <Input name="goal" placeholder="e.g. hypertrophy" />
      </Field>
      <Button type="submit" variant="secondary">
        Create plan
      </Button>
    </form>
  );
}
