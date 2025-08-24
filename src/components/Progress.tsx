import React from "react";

export default function Progress({
  found,
  total,
}: {
  found: number;
  total: number;
}) {
  const pct = Math.max(0, Math.min(100, Math.round((found / Math.max(total,1)) * 100)));
  return (
    <div className="progress">
      <div className="progress-head">
        <span>EVIDENCE CHAIN</span>
        <span>{found}/{total} CLUES</span>
      </div>
      <div className="bar">
        <div className="fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
