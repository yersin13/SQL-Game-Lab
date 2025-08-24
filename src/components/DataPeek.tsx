import React, { useEffect, useMemo, useState } from "react";
import type { Database } from "sql.js";

type Cell = string | number | null;
type TableData = { columns: string[]; values: Cell[][] };

export default function DataPeek({ db }: { db: Database | null }) {
  const [tables, setTables] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [schema, setSchema] = useState<TableData | null>(null);
  const [sample, setSample] = useState<TableData | null>(null);

  // List tables
  useEffect(() => {
    if (!db) return;
    try {
      const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
      const out: string[] = [];
      while (stmt.step()) out.push(String((stmt.getAsObject() as any).name));
      stmt.free();
      setTables(out);
      setCurrent(out[0] ?? null);
    } catch {
      setTables([]); setCurrent(null);
    }
  }, [db]);

  // Load schema + sample for current table
  useEffect(() => {
    if (!db || !current) { setSchema(null); setSample(null); return; }
    try {
      // schema
      const s1 = db.prepare(`PRAGMA table_info(${current})`);
      const cols = ["cid", "name", "type", "notnull", "dflt_value", "pk"];
      const rows1: Cell[][] = [];
      while (s1.step()) {
        const r = s1.getAsObject() as any;
        rows1.push([r.cid, r.name, r.type, r.notnull, r.dflt_value ?? null, r.pk]);
      }
      s1.free();
      setSchema({ columns: cols, values: rows1 });

      // sample
      const s2 = db.prepare(`SELECT * FROM ${current} LIMIT 10`);
      const cols2: string[] = s2.getColumnNames();
      const rows2: Cell[][] = [];
      while (s2.step()) {
        const row = s2.get();
        rows2.push(row as Cell[]);
      }
      s2.free();
      setSample({ columns: cols2, values: rows2 });
    } catch {
      setSchema(null); setSample(null);
    }
  }, [db, current]);

  if (!db) return null;
  if (!tables.length) return null;

  return (
    <div className="panel datapeek">
      <div className="panel-title">DATA PREVIEW</div>

      <div className="peek-head">
        <label className="k">Table</label>
        <select className="peek-select" value={current ?? ""} onChange={e => setCurrent(e.target.value)}>
          {tables.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {schema && (
        <div className="peek-section">
          <div className="k">Schema</div>
          <div className="table-wrap">
            <table className="retro-table tight">
              <thead><tr>{schema.columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {schema.values.map((r, i) => (
                  <tr key={i}>{r.map((c, j) => <td key={j}>{String(c)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sample && (
        <div className="peek-section">
          <div className="k">First 10 rows</div>
          <div className="table-wrap">
            <table className="retro-table">
              <thead><tr>{sample.columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {sample.values.length === 0 ? (
                  <tr><td colSpan={sample.columns.length} className="muted">(no rows)</td></tr>
                ) : sample.values.map((r, i) => (
                  <tr key={i}>{r.map((c, j) => <td key={j}>{String(c)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
