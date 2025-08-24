import React, { useEffect, useMemo, useState } from "react";
import type { Database } from "sql.js";

type Cell = string | number | null;
type TableData = { columns: string[]; values: Cell[][] } | null;

export default function QueryCoach({
  db,
  sql,
  result,
}: {
  db: Database | null;
  sql: string;
  result: TableData;
}) {
  const norm = useMemo(() => (sql || "").replace(/\s+/g, " ").trim(), [sql]);

  const hasSelect = /\bselect\b/i.test(norm);
  const hasFrom = /\bfrom\b/i.test(norm);
  const hasWhere = /\bwhere\b/i.test(norm);
  const hasLike = /\blike\b/i.test(norm);
  const tableMatch = /\bfrom\s+([A-Za-z_][A-Za-z0-9_]*)/i.exec(norm);
  const fromTable = tableMatch?.[1];

  // Very small set of “nudges” (no full answer)
  const nudges = useMemo(() => {
    const out: string[] = [];
    if (!hasSelect) out.push("Start with SELECT.");
    if (!hasFrom) out.push("Point SELECT at a table with FROM …");
    if (hasFrom && !hasWhere) out.push("Narrow results using a WHERE filter.");
    if (hasWhere && !hasLike) out.push("Pattern match? Try LIKE with a wildcard.");
    if (out.length === 0) out.push("Looks valid—run it and check the output.");
    return out.slice(0, 2); // keep it minimal
  }, [hasSelect, hasFrom, hasWhere, hasLike]);

  // Optional row counts (non-invasive). Only shown if we can infer table.
  const [baseline, setBaseline] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db || !fromTable) return setBaseline(null);
        const stmt = db.prepare(`SELECT COUNT(*) as c FROM ${fromTable}`);
        const rows: number[] = [];
        while (stmt.step()) {
          const r = stmt.getAsObject() as any;
          rows.push(Number(r.c));
        }
        stmt.free();
        if (!cancelled) setBaseline(rows[0] ?? null);
      } catch {
        if (!cancelled) setBaseline(null);
      }
    })();
    return () => { cancelled = true; };
  }, [db, fromTable]);

  const chips: { label: string; on: boolean }[] = [
    { label: "SELECT", on: hasSelect },
    { label: "FROM",   on: hasFrom },
    { label: "WHERE",  on: hasWhere },
    { label: "LIKE",   on: hasLike },
  ];

  const after = result?.values?.length ?? null;
  const removed = baseline != null && after != null ? Math.max(0, baseline - after) : null;

  return (
    <div className="panel coach-mini">
      <div className="panel-title">QUERY COACH</div>

      <div className="coach-row chips">
        {chips.map(c => (
          <span key={c.label} className={`chip ${c.on ? "on" : "off"}`}>{c.label}</span>
        ))}
      </div>

      <div className="coach-grid">
        <div>
          <div className="k">Next nudge</div>
          <ul className="coach-list">
            {nudges.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>

        <div>
          <div className="k">Effect (optional)</div>
          <div className="coach-counts">
            <div><span className="k2">Rows in table</span><span className="v2">{baseline ?? "?"}</span></div>
            <div><span className="k2">Rows after</span><span className="v2">{after ?? "?"}</span></div>
            <div><span className="k2">Removed</span><span className="v2">{removed ?? "?"}</span></div>
          </div>
          {!fromTable && <div className="coach-note">Tip: add a FROM … so I can compare counts.</div>}
        </div>
      </div>
    </div>
  );
}
