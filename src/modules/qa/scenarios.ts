export interface QaScenario {
  id: string;
  title: string;
  steps: string[];
  expect: string;
}

export interface QaRound {
  id: string;
  title: string;
  date: string;
  status: "ready" | "in-progress";
  scenarios: QaScenario[];
}

export const qaRounds: QaRound[] = [
  {
    id: "round-1",
    title: "Round 1 — Finance foundation",
    date: "2026-09-02",
    status: "in-progress",
    scenarios: [],
  },
];
