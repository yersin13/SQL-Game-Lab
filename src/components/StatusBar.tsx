import React, { useEffect, useState } from "react";
import type { SessionStats } from "../game/types";

function hearts(n: number) {
  const total = 3;
  const clamped = Math.max(0, Math.min(total, n));
  return "♥".repeat(clamped) + "♡".repeat(total - clamped);
}

export default function StatusBar({ stats }: { stats: SessionStats }) {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - stats.stepStartedAt) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [stats.stepStartedAt]);

  return (
    <div className="panel status">
      <div className="panel-title">TEST STATUS</div>
      <div className="status-grid">
        <div><div className="k">Mode</div><div className="v">{stats.mode.toUpperCase()}</div></div>
        <div><div className="k">Score</div><div className="v">{stats.score}</div></div>
        <div><div className="k">Lives</div><div className="v hearts" title={`${stats.lives} lives`}>{hearts(stats.lives)}</div></div>
        <div><div className="k">Hints used</div><div className="v">{stats.hintsUsed}</div></div>
        <div><div className="k">Teach Mode</div><div className="v">{stats.teachUsed ? "ON (penalized)" : "OFF"}</div></div>
        <div><div className="k">Step timer</div><div className="v">{elapsed}s</div></div>
      </div>
    </div>
  );
}
