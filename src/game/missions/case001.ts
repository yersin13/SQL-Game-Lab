import type { Mission } from "../types";
import { validateCanadaAFilter } from "../utils/sqlCheck";

export const case001: Mission = {
  id: "case-001",
  title: "CASE FILE #001 — The Missing Shipment",
  totalClues: 1,  // we’re starting with the first objective only
  steps: [
    {
      id: "step-1",
      title: "Narrow the suspect pool",
      objective:
        "Filter customers in CANADA whose first_name starts with 'A'.",
      starterSQL: `-- Objective: Canada + names starting with A
SELECT *
FROM customers
WHERE country = 'Canada'
  AND first_name LIKE 'A%';`,
      hints: [
        "Use WHERE to filter by country.",
        "Exact match country='Canada'.",
        "Use LIKE with a wildcard: first_name LIKE 'A%'.",
        "Make sure you are querying FROM customers."
      ],
      validate: (sql, res) => {
        const v = validateCanadaAFilter(sql, res);
        return { ok: v.ok, reason: v.reason, awardClue: v.ok };
      }
    }
  ]
};
