export type Cell = string | number | null;
export type QueryResult = { columns: string[]; values: Cell[][] } | null;

export type StepValidation = {
  ok: boolean;
  reason?: string;
  awardClue?: boolean;
};

export type Step = {
  id: string;
  title: string;
  objective: string;
  starterSQL?: string;
  hints: string[];
  validate: (sql: string, res: QueryResult) => StepValidation;
  points?: number; // optional override of base points
};

export type Mission = {
  id: string;
  title: string;
  totalClues: number;
  steps: Step[];
};

/** Discriminated union for event kinds */
export type EventKind =
  | "session:start"
  | "session:end"
  | "run:success"
  | "run:fail"
  | "hint:reveal"
  | "teach:toggle:on"
  | "teach:toggle:off"
  | "lives:lost";

export type EventLog = {
  t: number;       // epoch ms
  kind: EventKind; // <- KEEP this union type
  detail?: string; // optional text
};

export type SessionStats = {
  mode: "practice" | "test";
  score: number;
  lives: number;
  hintsUsed: number;
  teachUsed: boolean;
  startedAt: number;
  stepStartedAt: number;
  events: EventLog[];
};

/** Tiny factory that guarantees correct typing for events */
export function ev(kind: EventKind, detail?: string, t?: number): EventLog {
  return { t: t ?? Date.now(), kind, detail };
}
