"use client";

import { useRef } from "react";
import { logMetric, updateProfile } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export interface Profile {
  display_name: string;
  full_name: string | null;
  date_of_birth: string | null;
  sex: string | null;
  height_cm: number | null;
  timezone: string;
}

export function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <form action={updateProfile} className="grid grid-cols-2 gap-3">
      <Field label="Display name">
        <Input name="display_name" defaultValue={profile.display_name} required />
      </Field>
      <Field label="Full name">
        <Input name="full_name" defaultValue={profile.full_name ?? ""} />
      </Field>
      <Field label="Date of birth">
        <Input
          name="date_of_birth"
          type="date"
          defaultValue={profile.date_of_birth ?? ""}
        />
      </Field>
      <Field label="Sex">
        <Select name="sex" defaultValue={profile.sex ?? ""}>
          <option value="">—</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
      </Field>
      <Field label="Height (cm)">
        <Input
          name="height_cm"
          type="number"
          step="0.5"
          defaultValue={profile.height_cm ?? ""}
        />
      </Field>
      <Field label="Timezone">
        <Input name="timezone" defaultValue={profile.timezone} />
      </Field>
      <div className="col-span-2">
        <Button type="submit">Save profile</Button>
      </div>
    </form>
  );
}

export function MetricForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await logMetric(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label="Metric">
        <Select name="metric" defaultValue="weight_kg">
          <option value="weight_kg">Weight (kg)</option>
          <option value="body_fat_pct">Body fat (%)</option>
          <option value="resting_hr">Resting HR (bpm)</option>
          <option value="sleep_hours">Sleep (hours)</option>
        </Select>
      </Field>
      <Field label="Value">
        <Input name="value" type="number" step="any" required className="w-28" />
      </Field>
      <Button type="submit" variant="secondary">
        Log
      </Button>
    </form>
  );
}
