import React from "react";
import type { CommsMsg } from "./CommsLog";

type Spec = {
  table: string;
  filters: string[];          // e.g. ["country = 'Canada'", "first_name LIKE 'A%'"]
  constraints?: string[];     // e.g. ["SELECT only"]
  expected?: string;          // e.g. "About 3 rows"
  sqlSkeleton?: string;       // optional collapsed code block
};

export default function CommsStory({
  feed,
  limit = 4,
  maxLen = 160,
  hook,            // tiny story line, e.g. "Shipment X-113 fell off the ledger."
  task,            // plain-English objective, e.g. "Filter customers in CANADA…"
  spec,            // structured, glanceable spec
}: {
  feed: CommsMsg[];
  limit?: number;
  maxLen?: number;
  hook: string;
  task: string;
  spec: Spec;
}) {
  const isStoryPersona = (who: string) =>
    /^(system|handler|director|hq|case)$/i.test(who);

  const story = feed.filter(m => isStoryPersona(String(m.who)));
  const recent = story.slice(-limit);

  return (
    <div className="panel comms">
      <div className="panel-title">SECURE COMMS</div>

      {/* MISSION BRIEF (pinned) */}
      <div className="brief-card" style={{marginBottom: 8}}>
        <div className="brief-head">
          <span className="brief-who">DIRECTOR</span>
          <span className="brief-hook">{hook}</span>
        </div>

        <div className="brief-task">
          <strong>MISSION&nbsp;DIRECTIVE:</strong>&nbsp;{task}
        </div>

        <div className="brief-spec">
          <div className="spec-row">
            <span className="spec-label">Table</span>
            <span className="chip">{spec.table}</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Filters</span>
            {spec.filters.map((f, i) => <span key={i} className="chip">{f}</span>)}
          </div>
          {spec.constraints?.length ? (
            <div className="spec-row">
              <span className="spec-label">Constraints</span>
              {spec.constraints.map((c, i) => <span key={i} className="chip ghost">{c}</span>)}
            </div>
          ) : null}
          {spec.expected ? (
            <div className="spec-row">
              <span className="spec-label">Expected</span>
              <span className="chip ghost">{spec.expected}</span>
            </div>
          ) : null}
        </div>

        {spec.sqlSkeleton ? (
          <details className="brief-sql">
            <summary>Show SQL skeleton</summary>
            <pre className="comms-sql">{spec.sqlSkeleton}</pre>
          </details>
        ) : null}
      </div>

      {/* TRANSCRIPT */}
      <div className="comms-body">
        {recent.length === 0 ? (
          <div className="comms-row">
            <div className="comms-who">HQ</div>
            <div className="comms-text">Stand by for case traffic…</div>
          </div>
        ) : (
          recent.map(m => {
            const raw = String(m.text ?? "");
            const txt = raw.length > maxLen ? raw.slice(0, maxLen).trimEnd() + "…" : raw;
            return (
              <div key={m.id} className="comms-row">
                <div className="comms-who">{String(m.who).toUpperCase()}</div>
                <div className="comms-text">{txt}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
