import React from "react";

export default function TeachToggle({
  value, onChange,
}: { value: boolean; onChange: (v:boolean)=>void }) {
  return (
    <button
      className={`btn ${value ? "run" : ""}`}
      onClick={() => onChange(!value)}
      title="Toggle Teach Mode"
      aria-pressed={value}
    >
      {value ? "TEACH MODE: ON" : "TEACH MODE: OFF"}
    </button>
  );
}
