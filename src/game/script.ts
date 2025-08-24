import type { CommsMsg } from "../components/CommsLog";

let _id = 0;
const mid = () => String(++_id);

export type ScriptEvent =
  | "app:start"
  | "run:first"
  | "run:success"
  | "run:fail"
  | "warn:lives2"
  | "warn:lives1"
  | "note:hint"
  | "note:teach"
  | "case:complete";

export const script: Record<ScriptEvent, CommsMsg[]> = {
  "app:start": [
    { id: mid(), who: "SYSTEM",  text: "CHANNEL SECURED. You are now connected to HQ." },
    { id: mid(), who: "HANDLER", text: "Agent, shipment X-113 is off the books. Start by tightening the suspect pool." },
    { id: mid(), who: "OPS-BOT", text: "Pattern hint: country='Canada' AND first_name LIKE 'A%'." },
  ],
  "run:first": [
    { id: mid(), who: "HANDLER", text: "Run your first probe. Keep the scope tight, no noise." },
  ],
  "run:fail": [
    { id: mid(), who: "OPS-BOT", text: "ACCESS DENIED. Verify exact matches and operator order." },
  ],
  "run:success": [
    { id: mid(), who: "SYSTEM",  text: "ACCESS GRANTED — CLUE UNLOCKED." },
    { id: mid(), who: "HANDLER", text: "Good. That's one link in the chain. Stay sharp." },
  ],
  "warn:lives2": [
    { id: mid(), who: "HANDLER", text: "Careful. HQ is watching. Keep your filters precise." },
  ],
  "warn:lives1": [
    { id: mid(), who: "HANDLER", text: "Critical threshold. One more slip and we lose the momentum." },
  ],
  "note:hint": [
    { id: mid(), who: "OPS-BOT", text: "Hint engaged. Assistance recorded for oversight review." },
  ],
  "note:teach": [
    { id: mid(), who: "SYSTEM", text: "Training assist enabled. Scoring penalties applied." },
  ],
  "case:complete": [
    { id: mid(), who: "HANDLER", text: "Chain complete. I can take this to the prosecutor. Nice work, Agent." },
  ],
};

export function addScript(feed: CommsMsg[], event: ScriptEvent): CommsMsg[] {
  return feed.concat((script[event] ?? []).map(m => ({ ...m, id: String(Math.random()) })));
}
