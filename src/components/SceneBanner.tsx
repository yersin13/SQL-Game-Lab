import React from "react";

export default function SceneBanner({
  chapter,
  title,
  objective,
  branchTag,
}: {
  chapter: number | string;
  title: string;
  objective: string;
  branchTag?: string; // e.g., "Surveillance Route" or "Customs Angle"
}) {
  return (
    <div className="scene-banner">
      <div className="scene-line">
        <span className="scene-chip">STORY</span>
        <span className="scene-chapter">Chapter {chapter}</span>
        {branchTag && <span className="scene-branch">• {branchTag}</span>}
      </div>
      <div className="scene-title">{title}</div>
      <div className="scene-objective">
        <span className="obj-k">Objective:</span> {objective}
      </div>
      <div className="scene-legend">
        <span className="lg story">Story</span>
        <span className="lg play">Play</span>
        <span className="lg help">Help</span>
      </div>
    </div>
  );
}
