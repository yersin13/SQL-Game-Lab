import React, { useMemo } from "react";
import type { Mission, SessionStats } from "../game/types";

export default function StoryPanel({
  mission, stats, clues,
}: { mission: Mission; stats: SessionStats; clues: number }) {
  const lines = useMemo(() => {
    const out: string[] = [];
    if (clues === 0) {
      out.push("HQ BRIEF: Shipment X-113 vanished off the ledger. Pressure mounting.");
    } else if (clues < mission.totalClues) {
      out.push(`UPDATE: ${clues}/${mission.totalClues} evidence links secured.`);
    } else {
      out.push("BREAKTHROUGH: Evidence chain complete. Prosecutor preparing warrant.");
    }

    if (stats.lives <= 2 && stats.lives > 1) {
      out.push("Ops note: Review your filters. A clean query saves time—and lives.");
    } else if (stats.lives === 1) {
      out.push("CRITICAL: HQ eyes on you. One more mistake and the trail goes cold.");
    } else if (stats.lives === 0) {
      out.push("ADMIN: Lives depleted. Continue if needed, but record reflects instability.");
    }

    if (stats.hintsUsed > 0) {
      out.push(`Compliance: ${stats.hintsUsed} hint(s) used. Admissibility review triggered.`);
    }
    if (stats.teachUsed) {
      out.push("Training assist detected. Oversight enabled for this session.");
    }

    // a touch of fiction tied to score
    if (stats.score >= 120) {
      out.push("Intelligence: Warehouse cam pinged a match. Keep tightening the net.");
    }
    if (clues === mission.totalClues) {
      out.push("Director: Prepare a short memo. Your analysis moves us to action.");
    }

    return out;
  }, [stats, mission, clues]);

  return (
    <div className="panel">
      <div className="panel-title">CASE STAKES</div>
      <ul className="coach-list" style={{ marginLeft: 18 }}>
        {lines.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    </div>
  );
}
