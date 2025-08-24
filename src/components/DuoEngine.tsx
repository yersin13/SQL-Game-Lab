import React, { useMemo, useState } from "react";
import type { Database } from "sql.js";
import type { Step } from "../game/types";
import PracticeBuilder from "./PracticeBuilder";
import type { BuilderConfig } from "../practice/case001Builder";

type Cell = string | number | null;
type TableData = { columns: string[]; values: Cell[][] } | null;

// We keep the union type for compatibility, but we'll only use "tap".
type DuoTask =
  | { id: string; kind: "tap"; prompt: string; builder: BuilderConfig }
  | { id: string; kind: "type"; prompt: string; starter?: string };

export default function DuoEngine({
  db,
  step,
  builderConfig,
  onSessionEnd,
  onHeartsChange,
  onXpChange,
}: {
  db: Database | null;
  step: Step;
  builderConfig: BuilderConfig;
  onSessionEnd: (summary: { correct: number; total: number; xp: number; heartsLeft: number }) => void;
  onHeartsChange?: (lives: number) => void;
  onXpChange?: (xp: number) => void;
}) {
  // 🔒 Exactly ONE task, selection-only (no typing terminal step)
  const tasks: DuoTask[] = useMemo(
    () => [
      { id: "t1", kind: "tap", prompt: "Build the query using tokens", builder: builderConfig },
    ],
    [builderConfig]
  );

  const [idx] = useState(0);
  const [state, setState] = useState<"idle" | "correct" | "wrong">("idle");
  const [feedback, setFeedback] = useState<string>("");
  const [hearts, setHearts] = useState<number>(3);
  const [xp, setXp] = useState<number>(0);
  const [data, setData] = useState<TableData>(null); // kept for callback signature but not rendered

  const t = tasks[idx];
  const total = tasks.length; // -> 1

  const commitHearts = (v: number) => {
    setHearts(v);
    onHeartsChange?.(v);
  };
  const gainXp = (delta: number) => {
    setXp((x) => x + delta);
    onXpChange?.(delta);
  };

  // ✅ TAP task delegates to PracticeBuilder
  const onTapSuccess = (out: TableData) => {
    // Store result (not rendered here to avoid duplicate "OUTPUT" with PracticeBuilder)
    setData(out);
    setState("correct");
    setFeedback("Great!");

    const nextXp = xp + 10;
    gainXp(10);

    // End immediately after the single success
    onSessionEnd({ correct: 1, total, xp: nextXp, heartsLeft: hearts });
  };

  const onTapFail = (reason: string) => {
    setState("wrong");
    setFeedback(reason || "Not quite — adjust the tokens.");
    const nextHearts = Math.max(0, hearts - 1);
    commitHearts(nextHearts);
  };

  const disabled = hearts <= 0;

  return (
    <div className="panel duo">
      <div className="duo-head">
        <div className="duo-step">Lesson {idx + 1}/{total}</div>
        <div className={`duo-state ${state}`}>
          {state === "correct" ? "✓ Correct" : state === "wrong" ? "✗ Try again" : ""}
        </div>
      </div>

      <div className="duo-prompt">{t.prompt}</div>

      {/* Only the token-based builder is shown */}
      <PracticeBuilder
        db={db}
        config={(t as any).builder}
        step={step}
        onSuccess={onTapSuccess}
        onFail={onTapFail}
        onPreviewSQL={() => {}}
        // Note: PracticeBuilder will show its own Preview/Output; DuoEngine won't render a second table.
      />

      {/* No "CONTINUE" button and no second OUTPUT table here → avoids duplicate output */}

      {disabled && (
        <div className="panel" style={{ marginTop: 10 }}>
          <div className="panel-title">SESSION OVER</div>
          <p>You’ve run out of lives. You can finish later.</p>
          <button
            className="btn"
            onClick={() => onSessionEnd({ correct: Math.round(xp / 10), total, xp, heartsLeft: 0 })}
          >
            VIEW SUMMARY
          </button>
        </div>
      )}
    </div>
  );
}
