import React, { useMemo, useState, useEffect } from "react";
import type { Database } from "sql.js";
import { execSelect } from "../db/initDb";
import type { Step } from "../game/types";
import type { BuilderConfig, BuilderToken } from "../practice/case001Builder";

type Cell = string | number | null;
type TableData = { columns: string[]; values: Cell[][] } | null;

// Build SQL preview from slots (left-to-right)
function compileSQL(tokens: (BuilderToken | null)[]): string {
  return tokens.filter(Boolean).map(t => (t as BuilderToken).sql).join(" ");
}

// Simple in-place shuffle to randomize the palette (incl. distractors)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeBuilder({
  db,
  config,
  step,
  onSuccess,
  onFail,
  onPreviewSQL,
}: {
  db: Database | null;
  config: BuilderConfig;
  step: Step;
  onSuccess: (out: TableData) => void;
  onFail: (reason: string) => void;
  onPreviewSQL?: (sql: string) => void;
}) {
  // Slots are null until filled with a token
  const [slots, setSlots] = useState<(BuilderToken | null)[]>(
    new Array(config.slots.length).fill(null)
  );
  // Which slot will receive the next token
  const [active, setActive] = useState<number | null>(0);
  // Track which token ids are in use to disable their chips
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<TableData>(null);
  const [error, setError] = useState<string>("");

  // Stable, shuffled palette: required tokens + distractors (if any)
  const palette = useMemo(() => {
    const base = [...config.palette, ...(config.distractors ?? [])];
    return shuffle(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextEmpty = useMemo(() => slots.findIndex(s => s === null), [slots]);
  const complete  = useMemo(() => slots.every(Boolean), [slots]);

  // Emit live preview to the Coach
  useEffect(() => { onPreviewSQL?.(compileSQL(slots)); }, [slots, onPreviewSQL]);

  /** Place a token in the active slot (or next empty if none selected).
   *  If the slot was already filled, return the previous token to the palette.
   */
  const placeToken = (tok: BuilderToken) => {
    // Choose target slot
    const target =
      active !== null ? active :
      nextEmpty >= 0 ? nextEmpty : -1;

    if (target < 0) return; // nowhere to place

    setSlots(prev => {
      const next = [...prev];
      const prevTok = next[target];      // token that was there before (if any)
      next[target] = tok;                 // drop the new token in

      // Update "used" set: add new token id, remove previous token id if present
      setUsed(prevUsed => {
        const u = new Set(prevUsed);
        if (prevTok) u.delete(prevTok.id);
        u.add(tok.id);
        return u;
      });

      return next;
    });

    setError("");
    setResult(null);

    // Move focus to the next empty slot automatically (smooth flow)
    const after = slots.findIndex((s, i) => i !== target && s === null);
    setActive(after >= 0 ? after : target);
  };

  /** Clear a slot, returning its token to the palette (chip becomes available). */
  const clearSlot = (i: number) => {
    const prevId = slots[i]?.id; // read before state updates
    setSlots(prev => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
    if (prevId) {
      setUsed(prev => {
        const u = new Set(prev);
        u.delete(prevId); // re-enable its chip
        return u;
      });
    }
    setError("");
    setResult(null);
    setActive(i);
  };

  const reset = () => {
    setSlots(new Array(config.slots.length).fill(null));
    setUsed(new Set());
    setResult(null);
    setError("");
    setActive(0);
  };

  const check = () => {
    if (!db) return;
    if (!complete) {
      const msg = "Fill all slots to check the probe.";
      setError(msg);
      onFail("Incomplete.");
      return;
    }
    const sql = compileSQL(slots);
    try {
      const out = execSelect(db, sql);
      const verdict = step.validate(sql, out);
      if (verdict.ok) {
        setResult(out ?? null);
        setError("");
        onSuccess(out ?? null);
      } else {
        setResult(out ?? null);
        setError(verdict.reason ?? "Validation failed.");
        onFail(verdict.reason ?? "Validation failed.");
      }
    } catch (e: any) {
      setResult(null);
      setError(e?.message ?? String(e));
      onFail(e?.message ?? String(e));
    }
  };

  return (
    <div className="panel builder">
      <div className="panel-title">PRACTICE — {config.title}</div>
      <div className="builder-sublabel">
        Click a <b>slot</b> to focus (outlined), then click a <b>token</b> to place it.
        Click <b>×</b> on a slot to remove the token (it returns to the palette).
      </div>

      <div className="builder-slots">
        {config.slots.map((s, i) => (
          <button
            key={s.id}
            className={`slot ${slots[i] ? "filled" : ""} ${active === i ? "active" : ""}`}
            onClick={() => setActive(i)}
            title={slots[i] ? "Click × to clear" : "Click to select this slot"}
          >
            <span className="hint">{s.label}</span>
            <span className="val">{slots[i]?.text ?? "…"}</span>
            {slots[i] && (
              <span
                className="mini-clear"
                onClick={(e) => { e.stopPropagation(); clearSlot(i); }}
                aria-hidden
              >
                ×
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="builder-actions">
        <button className="btn" onClick={reset}>Reset</button>
        <button className="btn run" onClick={check} disabled={!db}>Check</button>
        {nextEmpty >= 0 && <span className="kbd">Next empty: #{nextEmpty + 1}</span>}
      </div>

      <div className="builder-palette">
        {palette.map(tok => {
          const disabled = used.has(tok.id);
          return (
            <button
              key={tok.id}
              className={`chip t-${tok.kind} ${disabled ? "disabled" : ""}`}
              onClick={() => !disabled && placeToken(tok)}
              disabled={disabled}
              title={disabled ? "Already used" : `Place ${tok.text}`}
            >
              {tok.text}
            </button>
          );
        })}
      </div>

      <div className="builder-preview">
        <div className="k">Preview</div>
        <div className="v">{compileSQL(slots) || "□"}</div>
      </div>

      {!!error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}

      {result && (
        <div className="panel results" style={{ marginTop: 12 }}>
          <div className="panel-title">OUTPUT (TABLE)</div>
          <div className="table-wrap">
            <table className="retro-table">
              <thead>
                <tr>{result.columns.map(c => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {result.values.length === 0 ? (
                  <tr>
                    <td colSpan={result.columns.length} className="muted">(no rows)</td>
                  </tr>
                ) : (
                  result.values.map((r, i) => (
                    <tr key={i}>
                      {r.map((cell, j) => <td key={j}>{String(cell)}</td>)}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="rowcount">{result.values.length} row(s)</div>
        </div>
      )}
    </div>
  );
}
