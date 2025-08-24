import React, { useEffect, useRef } from "react";

export type Persona =
  | "SYSTEM"
  | "HANDLER"
  | "HQ"
  | "DIRECTOR"
  | "CASE"
  | "OPS-BOT"; // kept for compatibility

export type CommsMsg = { id: string; who: Persona | string; text: string };

const label: Record<string, string> = {
  SYSTEM: "SYSTEM",
  HANDLER: "HANDLER • Director Avery",
  HQ: "HQ",
  DIRECTOR: "DIRECTOR",
  CASE: "CASE",
  "OPS-BOT": "OPS-BOT • HALCYON",
};

export default function CommsLog({
  feed,
  objective,
  sqlGuide,
  hideOps = false,
}: {
  feed: CommsMsg[];
  /** Optional pinned directive (same structure as CommsStory). */
  objective?: string;
  sqlGuide?: string;
  /** Hide OPS-BOT messages if desired (default false to match original). */
  hideOps?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: 9_999_999, behavior: "smooth" });
  }, [feed.length]);

  const rows = hideOps
    ? feed.filter((m) => String(m.who).toUpperCase() !== "OPS-BOT")
    : feed;

  return (
    <div className="panel comms">
      <div className="panel-title">SECURE COMMS</div>
      <div className="comms-body" ref={ref}>
        {/* Optional directive block */}
        {objective && (
          <div className="comms-row who-director">
            <div className="comms-who">{label["DIRECTOR"]}</div>
            <div className="comms-text">
              <strong>MISSION&nbsp;DIRECTIVE:</strong>&nbsp;{objective}
              {sqlGuide && (
                <pre className="comms-sql" style={{ marginTop: 6 }}>
{sqlGuide}
                </pre>
              )}
            </div>
          </div>
        )}

        {rows.map((m) => {
          const whoKey = String(m.who).toUpperCase();
          return (
            <div key={m.id} className={`comms-row who-${whoKey.toLowerCase()}`}>
              <div className="comms-who">{label[whoKey] ?? whoKey}</div>
              <div className="comms-text">{m.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
