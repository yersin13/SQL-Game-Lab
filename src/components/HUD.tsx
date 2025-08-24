import React, { useEffect, useState } from "react";

export default function HUD({
  message,
  kind,            // "ok" | "fail" | null
  ttl = 1200,      // ms visible
}: {
  message: string | null;
  kind: "ok" | "fail" | null;
  ttl?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message && kind) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), ttl);
      return () => clearTimeout(t);
    }
  }, [message, kind, ttl]);

  if (!visible || !message || !kind) return null;

  return (
    <div className={`hud ${kind === "ok" ? "hud-ok" : "hud-fail"}`}>
      <div className="hud-inner">{message}</div>
    </div>
  );
}
