"use client";

import { useRef } from "react";
import { createAccount, createCategory } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function AccountForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createAccount(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label="Account name" className="min-w-40 flex-1">
        <Input name="name" placeholder="e.g. BCA, Cash, GoPay" required />
      </Field>
      <Field label="Type">
        <Select name="type" defaultValue="bank">
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
          <option value="ewallet">E-wallet</option>
          <option value="credit_card">Credit card</option>
          <option value="investment">Investment</option>
          <option value="other">Other</option>
        </Select>
      </Field>
      <Field label="Opening balance">
        <Input name="opening_balance" type="number" step="any" defaultValue="0" />
      </Field>
      <Button type="submit" variant="secondary">
        Add account
      </Button>
    </form>
  );
}

export function CategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createCategory(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label="Category name" className="min-w-40 flex-1">
        <Input name="name" placeholder="e.g. Food, Salary, Transport" required />
      </Field>
      <Field label="Kind">
        <Select name="kind" defaultValue="expense">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
      </Field>
      <Button type="submit" variant="secondary">
        Add category
      </Button>
    </form>
  );
}
