import React from "react";

type Cell = string | number | null;

export default function ResultsTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Cell[][];
}) {
  if (!columns.length) return null;

  return (
    <div className="panel results">
      <div className="panel-title">OUTPUT (TABLE)</div>
      <div className="table-wrap">
        <table className="retro-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="muted">
                  (no rows)
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i}>
                  {r.map((cell, j) => (
                    <td key={j}>{cell as any}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="rowcount">{rows.length} row(s)</div>
    </div>
  );
}
