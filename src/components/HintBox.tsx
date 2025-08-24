import React, { useState } from "react";

export default function HintBox({
  hints,
  onReveal,
}: {
  hints: string[];
  onReveal?: (index: number) => void; // fires each time a hint is revealed
}) {
  const [i, setI] = useState<number>(-1);

  const reveal = () => {
    const next = Math.min(hints.length - 1, i + 1);
    setI(next);
    if (onReveal) onReveal(next);
  };

  return (
    <div className="panel hints">
      <div className="panel-title">HINTS</div>
      {i < 0 ? (
        <button className="btn" onClick={reveal}>Need a hint?</button>
      ) : (
        <>
          <ol className="hint-list">
            {hints.slice(0, i + 1).map((h, idx) => <li key={idx}>{h}</li>)}
          </ol>
          {i < hints.length - 1 && (
            <button className="btn" onClick={reveal}>Reveal next hint</button>
          )}
        </>
      )}
    </div>
  );
}
