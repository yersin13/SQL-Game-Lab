import type { QueryResult } from "../types";

export function normalizeSql(sql: string): string {
  return sql
    .replace(/--.*$/gm, "")           // strip line comments
    .replace(/\s+/g, " ")             // collapse whitespace
    .trim()
    .toLowerCase();
}

export function includesAll(hay: string, needles: string[]): boolean {
  return needles.every(n => hay.includes(n.toLowerCase()));
}

/**
 * Validates that results respect the Canada + A% rule when columns exist.
 * Falls back to SQL string inspection if necessary.
 */
export function validateCanadaAFilter(sql: string, res: QueryResult): { ok: boolean; reason?: string } {
  const nsql = normalizeSql(sql);

  // Soft SQL inspection (allowing " like 'a%'" with single or double quotes)
  const likeARegex = /first_name\s+like\s+['"]a%['"]/i;
  const hasCanada = /country\s*=\s*['"]canada['"]/i.test(sql);

  // Prefer result-based validation if possible
  if (res && res.columns.length > 0) {
    const cols = res.columns.map(c => c.toLowerCase());
    const idxCountry = cols.indexOf("country");
    const idxFN = cols.indexOf("first_name");

    if (idxCountry !== -1) {
      const badCountry = res.values.some(r => String(r[idxCountry]).toLowerCase() !== "canada");
      if (badCountry) return { ok: false, reason: "Rows must be only country='Canada'." };
    }

    if (idxFN !== -1) {
      const badName = res.values.some(r => {
        const v = r[idxFN];
        return typeof v === "string" ? !v.toLowerCase().startsWith("a") : true;
      });
      if (badName) return { ok: false, reason: "first_name must start with 'A'." };
    }

    // If neither column present, fall back to SQL pattern check
  }

  if (!hasCanada) return { ok: false, reason: "Add WHERE country='Canada'." };
  if (!likeARegex.test(sql)) return { ok: false, reason: "Add first_name LIKE 'A%'." };

  // Must select from customers
  if (!includesAll(nsql, ["from customers"])) {
    return { ok: false, reason: "Query the customers table." };
  }

  return { ok: true };
}
