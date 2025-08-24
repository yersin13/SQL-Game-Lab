export type Mode = "practice" | "test";

export const scoring = {
  modeDefault: "test" as Mode,
  // Core
  basePointsPerStep: 100,
  timeBonus: (seconds: number) => {
    // + up to 40 pts for being quick (<= 60s), none after 3 min
    if (seconds <= 60) return 40;
    if (seconds >= 180) return 0;
    const t = Math.max(0, 180 - seconds) / 120; // 0..1
    return Math.round(40 * t);
  },
  // Penalties
  hintPenalty: 20,        // per hint revealed
  teachPenalty: 30,       // one-time per session when toggled on first time
  failPenalty: 10,        // per failed run (ACCESS DENIED)
  // Lives
  startingLives: 3,
  blockOnZeroLives: false // keep running even at 0 (pressure, not dead end)
};
