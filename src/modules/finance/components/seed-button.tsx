"use client";

import { useTransition } from "react";
import { seedFinanceDefaults } from "../actions";
import { Button } from "@/components/ui/button";

export function SeedFinanceButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isPending}
      onClick={() => startTransition(() => seedFinanceDefaults())}
    >
      {isPending ? "Seeding…" : "Seed my accounts & rules"}
    </Button>
  );
}
