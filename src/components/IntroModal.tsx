import React from "react";
import { useTypewriter } from "../hooks/useTypewriter";

export default function IntroModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const boot = useTypewriter(
    "[BOOTING TERMINAL...]\n[SYNCING CASE INDEX...]\nACCESS: GRANTED\n\nCASE: CF-001 — The Missing Shipment\nRole: Data Analyst\n\nPress ENTER to continue.",
    8
  );

  if (!open) return null;
  return (
    <div className="boot-wrap" onClick={onClose} onKeyDown={(e) => e.key === "Enter" && onClose()} tabIndex={0}>
      <pre className="boot-screen">{boot}</pre>
      <div className="boot-tip">⏎ ENTER</div>
    </div>
  );
}

