import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Database } from "sql.js";

import { initDb } from "./db/initDb";
import HUD from "./components/HUD";
import HintBox from "./components/HintBox";
import IntroModal from "./components/IntroModal";
import QueryCoach from "./components/QueryCoach";
import DataPeek from "./components/DataPeek";
import DuoEngine from "./components/DuoEngine";
import CommsBrief from "./components/CommsBrief";

import type { SessionStats } from "./game/types";
import { useBeep } from "./hooks/useSound";
import { scoring, type Mode } from "./game/scoring";
import { case001Builder } from "./practice/case001Builder";

import "./styles/retro.css";

/* ----------------------------------------------------------
   Screens
-----------------------------------------------------------*/
type Screen = "lessonSelect" | "brief" | "play" | "success" | "gameover";

/* ASCII titles */
const INTRO_ASCII = [
  "        ______   _   ___               ",
  "       / __/ /  (_) / _ )  ___  ___    ",
  "      _\\ \\/ _ \\/ / / _  |/ _ \\/ _ \\   ",
  "     /___/_//_/_/ /____/ \\___/\\___/    ",
  "---------------------------------------",
  "     FIELD OPS • DATA TERMINAL v3.1    ",
].join("\n");

const SUCCESS_ASCII = [
  "   ___ _                 _ _            ",
  "  / __| |_  ___ _ _   __| | |___ _ _    ",
  " | (__| ' \\/ -_) ' \\ / _` | / -_) '_|   ",
  "  \\___|_||_\\___|_||_|\\__,_|_\\___|_|     ",
  "---------------------------------------  ",
].join("\n");

const FAIL_ASCII = [
  "   _____                     ____                 ",
  "  / ____|                   / __ \\                ",
  " | |  __  __ _ _ __ ___   _| |  | |_   _  ___     ",
  " | | |_ |/ _` | '_ ` _ \\ / _` |  | | | | |/ _ \\ ",
  " | |__| | (_| | | | | | | (_| |__| | |_| |  __/   ",
  "  \\_____|\\__,_|_| |_| |_|\\__,_|____/ \\__, |\\___|",
  "                                       __/ |     ",
  "                                      |___/      ",
].join("\n");

/* ----------------------------------------------------------
   Curriculum (12 lessons)
   - Each item fuels CommsBrief and drives what the builder should teach.
   - Replace builder mapping in getBuilderFor() as you add per-lesson builders.
-----------------------------------------------------------*/
type Lesson = {
  id: string;
  title: string;
  flavor: string[];
  directive: string; // clear ask in English
  meta: { target: string; scope?: string; rules?: string[] };
};

const LESSONS: Lesson[] = [
  {
    id: "L1",
    title: "Filters I — WHERE + LIKE",
    flavor: [
      "Shipment X-113 slipped off the ledger.",
      "Paper trail is thin. Time window is thinner."
    ],
    directive: "Filter customers in CANADA whose first_name starts with 'A'.",
    meta: { target: "customers", scope: "Canada; first_name starts with ‘A’", rules: ["SELECT only"] },
  },
  {
    id: "L2",
    title: "Sorting — ORDER BY + LIMIT",
    flavor: ["HQ wants signal, not noise.", "Bring the latest five movements."],
    directive: "Get the 5 most recent shipments by shipped_date.",
    meta: { target: "shipments", scope: "latest 5 by shipped_date desc", rules: ["SELECT only"] },
  },
  {
    id: "L3",
    title: "Set filters — IN / NOT IN",
    flavor: ["Three supplier aliases pinged red.", "Fence rotates names."],
    directive: "List supplier IDs for names IN ('NORDIC','ACME','MLT').",
    meta: { target: "suppliers", scope: "name IN ('NORDIC','ACME','MLT')" },
  },
  {
    id: "L4",
    title: "Logic — AND / OR / NOT",
    flavor: ["Contradictory intel, narrow by truth table.", "Precision beats recall here."],
    directive: "Find customers in CANADA OR USA, NOT flagged='suspended'.",
    meta: { target: "customers", scope: "(country ∈ {Canada,USA}) AND NOT suspended" },
  },
  {
    id: "L5",
    title: "Joins I — INNER JOIN",
    flavor: ["We have orders. We need the who with them.", "Stitch the trail cleanly."],
    directive: "Show orders with their customer names (inner join).",
    meta: { target: "orders ⋈ customers", scope: "orders.customer_id → customers.id" },
  },
  {
    id: "L6",
    title: "Joins II — LEFT JOIN",
    flavor: ["Some orders don’t resolve to accounts.", "We still want the orphans."],
    directive: "List all orders and their customer names, including missing customers.",
    meta: { target: "orders ⟕ customers", scope: "LEFT JOIN on customer_id" },
  },
  {
    id: "L7",
    title: "Aggregates — COUNT / SUM",
    flavor: ["Need totals to justify the warrant.", "Roll it up by country."],
    directive: "Count customers by country.",
    meta: { target: "customers", scope: "GROUP BY country" },
  },
  {
    id: "L8",
    title: "GROUP BY + HAVING",
    flavor: ["Cut the chatter, keep volume nodes.", "Only hefty groups matter."],
    directive: "Countries with more than 10 customers.",
    meta: { target: "customers", scope: "GROUP BY country; HAVING COUNT(*) > 10" },
  },
  {
    id: "L9",
    title: "Subqueries",
    flavor: ["Cross-check wallets vs. activity.", "Ghost accounts don’t spend."],
    directive: "Customers whose id exists in orders (has at least one order).",
    meta: { target: "customers", scope: "id IN (SELECT customer_id FROM orders)" },
  },
  {
    id: "L10",
    title: "Conditional — CASE",
    flavor: ["Label suspects by risk bands.", "Keep it human-readable for the brief."],
    directive: "Select customers with CASE bucketing by total_spend.",
    meta: { target: "customers", scope: "CASE WHEN total_spend … END AS risk_band" },
  },
  {
    id: "L11",
    title: "Windows I — ROW_NUMBER",
    flavor: ["We need the latest contact per customer.", "One line per person."],
    directive: "Row_number contacts by customer and pick rn=1 (latest).",
    meta: { target: "contacts", scope: "PARTITION BY customer_id ORDER BY updated_at DESC" },
  },
  {
    id: "L12",
    title: "CTEs + UNION",
    flavor: ["Two feeds, same subject.", "Normalize and combine evidence."],
    directive: "UNION customer audit events from feed_a and feed_b.",
    meta: { target: "feed_a ∪ feed_b", scope: "columns aligned; duplicates kept with UNION ALL?" },
  },
];

/* ----------------------------------------------------------
   Simple lesson select
-----------------------------------------------------------*/
function ScreenLessonSelect({
  onPick,
}: {
  onPick: (index: number) => void;
}) {
  return (
    <div className="screen fx-center">
      <div className="story-card" style={{ maxWidth: 880 }}>
        <div className="story-head">
          <div className="brand">FBI DATA TERMINAL ▌ VER 3.1</div>
        </div>
        <pre className="ascii">{INTRO_ASCII}</pre>
        <h2>Field Ops Curriculum</h2>
        <p>Select a lesson. Each is a single selection challenge—no typing required.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          {LESSONS.map((l, i) => (
            <button key={l.id} className="btn" onClick={() => onPick(i)} style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700 }}>{`${l.id}: ${l.title}`}</div>
              <div style={{ opacity: 0.85, fontSize: "0.9rem" }}>{l.directive}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenSuccess({
  onContinue,
  onBack,
  hasNext,
}: {
  onContinue: () => void;
  onBack: () => void;
  hasNext: boolean;
}) {
  return (
    <div className="screen fx-center">
      <div className="story-card">
        <pre className="ascii">{SUCCESS_ASCII}</pre>
        <h2>Clue Unlocked</h2>
        <p>Nice work. The chain tightens.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {hasNext && <button className="btn cta" onClick={onContinue}>Next Lesson</button>}
          <button className="btn" onClick={onBack}>Lesson Select</button>
        </div>
      </div>
    </div>
  );
}

function ScreenGameOver({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen fx-center">
      <div className="story-card">
        <pre className="ascii">{FAIL_ASCII}</pre>
        <h2>Case Compromised</h2>
        <p>You ran out of lives. Debrief, reset, and try again.</p>
        <button className="btn" onClick={onRestart}>Back to Lessons</button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------
   App
-----------------------------------------------------------*/
export default function App() {
  const [db, setDb] = useState<Database | null>(null);

  // fixed mode (no toggle; selection-only flow)
  const [stats] = useState<SessionStats>({
    mode: "test" as Mode,
    score: 0,
    lives: scoring.startingLives,
    hintsUsed: 0,
    teachUsed: false,
    startedAt: Date.now(),
    stepStartedAt: Date.now(),
    events: [],
  });

  // lesson routing
  const [screen, setScreen] = useState<Screen>("lessonSelect");
  const [lessonIndex, setLessonIndex] = useState<number>(0);

  // hearts/xp/streak
  const [duoHearts, setDuoHearts] = useState<number>(3);
  const [duoXp, setDuoXp] = useState<number>(0);
  const [duoStreak, setDuoStreak] = useState<number>(0);

  // HUD
  const [hudMsg, setHudMsg] = useState<string | null>(null);
  const [hudKind, setHudKind] = useState<"ok" | "fail" | null>(null);

  const beep = useBeep();

  useEffect(() => {
    (async () => {
      try {
        const database = await initDb();
        setDb(database);
      } catch {
        setHudMsg("DB INIT FAILED");
        setHudKind("fail");
      }
    })();
  }, []);

  // Map a lesson id to a builder config
  const getBuilderFor = useCallback((id: string) => {
    // TODO: Replace these with per-lesson builders like case002Builder, etc.
    // This placeholder returns case001Builder so the app runs end-to-end.
    switch (id) {
      case "L1":
      default:
        return case001Builder;
    }
  }, []);

  // For now, the "step" object isn’t used directly by our single-step selection flow.
  // DuoEngine + PracticeBuilder drive success; we just end on success.
  const current = LESSONS[lessonIndex];

  const builderConfig = useMemo(() => {
    // Sanitize lesson-specific builder by removing any typing/preview flags
    const deep = (x: any) => JSON.parse(JSON.stringify(x));
    const stripPreview = (node: any) => {
      if (!node || typeof node !== "object") return node;
      delete (node as any).preview;
      delete (node as any).previewSQL;
      delete (node as any).showPreview;
      delete (node as any).autoContinue;
      delete (node as any).continue;
      delete (node as any).next;
      return node;
    };
    return stripPreview(deep(getBuilderFor(current.id)));
  }, [current.id, getBuilderFor]);

  /* ---------- handlers ---------- */
  const startLesson = useCallback((index: number) => {
    setLessonIndex(index);
    // reset light session stats
    setDuoHearts(3);
    setDuoXp(0);
    setHudMsg(null);
    setHudKind(null);
    setScreen("brief"); // show brief-like intro? Jump straight to play if you prefer
  }, []);

  const enterPlay = useCallback(() => {
    setScreen("play");
  }, []);

  const onHeartsChange = useCallback((h: number) => {
    setDuoHearts(h);
    if (h <= 0) setScreen("gameover");
  }, []);

  const onXpChange = useCallback((delta: number) => {
    setDuoXp((x) => x + delta);
  }, []);

  const onLessonEnd = useCallback(
    (_s: { correct: number; total: number; xp: number; heartsLeft: number }) => {
      setHudMsg("SESSION COMPLETE");
      setHudKind("ok");
      setDuoStreak((v) => v + 1);
      beep(920, 70);
      setScreen("success");
    },
    [beep]
  );

  const nextLesson = useCallback(() => {
    const hasNext = lessonIndex + 1 < LESSONS.length;
    if (hasNext) {
      startLesson(lessonIndex + 1);
    } else {
      setScreen("lessonSelect");
    }
  }, [lessonIndex, startLesson]);

  const backToSelect = useCallback(() => {
    setScreen("lessonSelect");
  }, []);

  const restartFromGameOver = useCallback(() => {
    setDuoHearts(3);
    setDuoXp(0);
    setHudMsg(null);
    setHudKind(null);
    setScreen("lessonSelect");
  }, []);

  /* -------------------- SCREEN ROUTER -------------------- */
  if (screen === "lessonSelect") {
    return <ScreenLessonSelect onPick={startLesson} />;
  }

  if (screen === "brief") {
    // Use a compact “brief” using the same mission brief visual
    return (
      <div className="screen fx-center">
        <div className="story-card">
          <div className="story-head">
            <div className="brand">FBI DATA TERMINAL ▌ VER 3.1</div>
          </div>
          <pre className="ascii">{INTRO_ASCII}</pre>
          <h2>{`${current.id} — ${current.title}`}</h2>
          <p style={{ opacity: 0.9 }}>{current.flavor[0]}</p>
          <p style={{ opacity: 0.9 }}>{current.flavor[1] ?? ""}</p>
          <p className="objective">
            <strong>Directive:</strong> {current.directive}
          </p>
          <button className="btn cta" onClick={enterPlay}>Enter Lab</button>
          <button className="btn" style={{ marginLeft: 8 }} onClick={backToSelect}>Back</button>
        </div>
      </div>
    );
  }

  if (screen === "success") {
    const hasNext = lessonIndex + 1 < LESSONS.length;
    return (
      <ScreenSuccess
        hasNext={hasNext}
        onContinue={nextLesson}
        onBack={backToSelect}
      />
    );
  }

  if (screen === "gameover") {
    return <ScreenGameOver onRestart={restartFromGameOver} />;
  }

  /* -------------------- PLAY LAYOUT --------------------
     1) Topbar (clean + inline hearts/XP/streak)
     2) Mission Brief (story-first, not chat)
     3) Game (DuoEngine single selection) | Sidebar (Coach + Hints)
     4) Data Preview
  ------------------------------------------------------ */

  const HeartsInline = ({ hearts }: { hearts: number }) => {
    const total = 3;
    return (
      <span style={{ display: "inline-flex", gap: 2 }}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            style={{
              opacity: i < hearts ? 1 : 0.35,
              filter: i < hearts ? "none" : "grayscale(70%)",
            }}
            aria-hidden
          >
            ♥
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="terminal" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HUD message={hudMsg} kind={hudKind} />
      <IntroModal open={false} onClose={() => {}} />

      {/* Topbar — simple, with inline hearts/streak/XP */}
      <div
        className="topbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>FBI DATA TERMINAL ▓ VER 3.1</div>

        <div
          style={{
            display: "inline-flex",
            gap: 16,
            alignItems: "center",
            fontSize: "0.95rem",
            lineHeight: 1,
          }}
        >
          <div style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
            <div title="Lives">
              <HeartsInline hearts={duoHearts} />
            </div>
            <div title="Streak">🔥 {duoStreak}</div>
            <div title="Experience">XP{duoXp} / 50</div>
          </div>

          <div className={db ? "status ok" : "status off"}>{db ? "DB: READY" : "DB: INIT…"}</div>
        </div>
      </div>

      {/* Mission Brief (no chat, no schema duplication) */}
      <section>
        <div className="panel mini" style={{ fontSize: "0.95em" }}>
          <CommsBrief
            caseId={current.id}
            brand="FBI DATA TERMINAL ▌ VER 3.1"
            flavor={current.flavor}
            directive={current.directive}
            meta={current.meta}
          />
        </div>
      </section>

      {/* Game + Sidebar */}
      <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "start" }}>
        <div className="panel" style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.06), 0 12px 28px rgba(0,0,0,.35)" }}>
          <DuoEngine
            db={db}
            // step is not used for validation in single-step selection flow; PracticeBuilder drives success.
            // If your PracticeBuilder needs step for copy, you can pass a minimal stub here.
            step={{
              objective: current.directive,
              hints: [],
              starterSQL: "",
              validate: () => ({ ok: true, reason: "", awardClue: false }),
            } as any}
            builderConfig={builderConfig}
            onSessionEnd={onLessonEnd}
            onHeartsChange={onHeartsChange}
            onXpChange={onXpChange}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {db && (
            <div className="panel mini" style={{ fontSize: "0.95em" }}>
              {/* No SQL context here—Coach can still give tips about the concept */}
              <QueryCoach db={db} sql={""} result={null} />
            </div>
          )}
          <div className="panel mini" style={{ fontSize: "0.95em" }}>
            <HintBox hints={[]} onReveal={() => {}} />
          </div>
        </div>
      </section>

      {/* Data Preview */}
      <section>
        <div className="panel" style={{ paddingTop: 10, paddingBottom: 6 }}>
          <div className="panel-title">DATA PREVIEW</div>
          <DataPeek db={db} />
        </div>
      </section>

      <div className="footer">
        <span>© Retro SQL Lab</span>
        <span>{current.id} — {current.title}</span>
      </div>
    </div>
  );
}
