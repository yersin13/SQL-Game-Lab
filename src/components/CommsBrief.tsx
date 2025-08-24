import React from "react";

type BriefMeta = {
  target: string;       // e.g., "customers"
  scope?: string;       // e.g., "country = Canada; first_name starts with 'A'"
  rules?: string[];     // e.g., ["SELECT only"]
};

export default function CommsBrief({
  caseId = "CF-001",
  brand = "FBI DATA TERMINAL ▌ VER 3.1",
  // short, cinematic lines that don’t explain *how*
  flavor = [
    "Shipment X-113 slipped off the ledger.",
    "Paper trail is thin. Time window is thinner."
  ],
  directive,            // plain English ask (this is the important bit)
  meta,                 // minimal, non-overlapping facts
}: {
  caseId?: string;
  brand?: string;
  flavor?: string[];
  directive: string;
  meta: BriefMeta;
}) {
  return (
    <div className="panel comms">
      <div className="panel-title">SECURE COMMS</div>

      <div style={styles.card}>
        {/* Brand / Case */}
        <div style={styles.headRow}>
          <div style={styles.brand}>{brand}</div>
          <div style={styles.case}>CASE: {caseId}</div>
        </div>

        {/* Atmospheric hook */}
        <div style={styles.flavorWrap}>
          {flavor.map((line, i) => (
            <div key={i} style={styles.flavorLine}>{line}</div>
          ))}
        </div>

        {/* Mission directive — clear, single line */}
        <div style={styles.directive}>
          <span style={styles.directiveLabel}>MISSION&nbsp;DIRECTIVE:</span>
          <span>{directive}</span>
        </div>

        {/* Minimal meta (doesn't repeat Coach content) */}
        <div style={styles.metaGrid}>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Target</span>
            <span style={styles.chip}>{meta.target}</span>
          </div>

          {meta.scope ? (
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Scope</span>
              <span style={styles.chipGhost}>{meta.scope}</span>
            </div>
          ) : null}

          {meta.rules?.length ? (
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Rules</span>
              <span style={styles.pillRow}>
                {meta.rules.map((r, i) => (
                  <span key={i} style={styles.chipGhost}>{r}</span>
                ))}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 12,
    background: "rgba(255,255,255,0.02)",
  },
  headRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
    fontSize: "0.9rem",
    opacity: 0.85,
  },
  brand: { letterSpacing: ".03em" },
  case: { opacity: 0.8 },
  flavorWrap: { marginTop: 2, marginBottom: 8, opacity: 0.95 },
  flavorLine: { fontStyle: "italic" },
  directive: { margin: "6px 0 10px 0", fontWeight: 700 },
  directiveLabel: { opacity: 0.9, marginRight: 6 },
  metaGrid: { display: "grid", gap: 6 },
  metaRow: { display: "grid", gridTemplateColumns: "96px 1fr", gap: 8, alignItems: "center" },
  metaLabel: { opacity: 0.8, fontSize: "0.9rem" },
  pillRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: {
    display: "inline-flex", alignItems: "center",
    padding: "2px 8px", borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.03)",
    fontSize: "0.85rem", lineHeight: 1.4, whiteSpace: "nowrap",
  },
  chipGhost: {
    display: "inline-flex", alignItems: "center",
    padding: "2px 8px", borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "transparent",
    fontSize: "0.85rem", lineHeight: 1.4, whiteSpace: "nowrap",
    opacity: 0.9,
  },
};
