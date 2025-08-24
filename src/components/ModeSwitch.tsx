import React from "react";

export default function ModeSwitch({
  mode,
  onChange,
}: {
  mode: "practice" | "test";
  onChange: (m: "practice" | "test") => void;
}) {
  return (
    <div role="group" aria-label="Mode switch" style={{ display: "flex", gap: 6 }}>
      <button
        className={`btn ${mode === "practice" ? "run" : ""}`}
        onClick={() => onChange("practice")}
        aria-pressed={mode === "practice"}
      >
        Practice (Builder)
      </button>
      <button
        className={`btn ${mode === "test" ? "run" : ""}`}
        onClick={() => onChange("test")}
        aria-pressed={mode === "test"}
      >
        Test (Typing)
      </button>
    </div>
  );
}
