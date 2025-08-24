import React from "react";

export default function SessionHeader({
  hearts,
  totalHearts = 3,
  xp,
  xpGoal = 50,
  streak = 0,
}: {
  hearts: number;
  totalHearts?: number;
  xp: number;
  xpGoal?: number;
  streak?: number;
}) {
  const pct = Math.min(100, Math.round((xp / xpGoal) * 100));
  const heartsStr =
    "❤️".repeat(Math.max(0, hearts)) +
    "🖤".repeat(Math.max(0, totalHearts - hearts));

  return (
    <div className="panel session-header">
      <div className="session-row">
        <div className="hearts" title="Lives">{heartsStr}</div>
        <div className="streak" title="Daily streak">🔥 {streak}</div>
      </div>

      <div className="xp-wrap">
        <div className="xp-head">
          <span className="k">XP</span>
          <span className="v">{xp} / {xpGoal}</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
