"use client";

import { useEffect, useState } from "react";
import { type QaScenario } from "@/modules/qa/scenarios";

function storageKey(roundId: string, scenarioId: string) {
  return `qa:${roundId}:${scenarioId}`;
}

function readPassed(roundId: string, scenarioId: string): boolean {
  try {
    return localStorage.getItem(storageKey(roundId, scenarioId)) === "true";
  } catch {
    return false;
  }
}

function writePassed(roundId: string, scenarioId: string, passed: boolean) {
  try {
    localStorage.setItem(storageKey(roundId, scenarioId), String(passed));
  } catch {
    // ignore — localStorage unavailable
  }
}

export function ScenarioList({
  roundId,
  scenarios,
}: {
  roundId: string;
  scenarios: QaScenario[];
}) {
  const [passed, setPassed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const scenario of scenarios) {
      next[scenario.id] = readPassed(roundId, scenario.id);
    }
    setPassed(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId, scenarios.map((s) => s.id).join(",")]);

  if (scenarios.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Scenarios land here when the dev round finishes.
      </p>
    );
  }

  const passedCount = scenarios.filter((s) => passed[s.id]).length;
  const allPassed = passedCount === scenarios.length;

  function toggle(scenarioId: string) {
    setPassed((prev) => {
      const next = { ...prev, [scenarioId]: !prev[scenarioId] };
      writePassed(roundId, scenarioId, next[scenarioId]);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {allPassed ? (
        <p className="text-xs font-medium text-signal">All passed ✓</p>
      ) : (
        <p className="text-xs text-ink-muted">
          {passedCount} of {scenarios.length} passed
        </p>
      )}

      <div className="space-y-3">
        {scenarios.map((scenario) => {
          const isPassed = Boolean(passed[scenario.id]);
          return (
            <div
              key={scenario.id}
              className={`rounded-lg border border-edge p-3 ${
                isPassed ? "bg-trace/30" : ""
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div
                  className={`text-sm font-medium ${
                    isPassed ? "text-ink-muted line-through" : ""
                  }`}
                >
                  {scenario.title}
                </div>
                <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-muted">
                  <input
                    type="checkbox"
                    checked={isPassed}
                    onChange={() => toggle(scenario.id)}
                  />
                  Pass
                </label>
              </div>

              <ol className="list-decimal space-y-1 pl-4 text-sm text-ink-muted">
                {scenario.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>

              <p className="mt-2 text-sm text-ink">
                <span className="font-medium">Expect:</span> {scenario.expect}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
