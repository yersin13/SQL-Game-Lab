export type QueryParts = {
  table?: string;
  hasWhere: boolean;
  hasLikeA: boolean;
  hasCountryCanada: boolean;
};

export function parseBasic(sql: string): QueryParts {
  const s = sql.replace(/--.*$/gm, "").replace(/\s+/g, " ").trim();
  const mFrom = /from\s+([a-zA-Z_][\w]*)/i.exec(s);
  const hasWhere = /\bwhere\b/i.test(s);
  const hasLikeA = /first_name\s+like\s*['"]a%['"]/i.test(s);
  const hasCountryCanada = /country\s*=\s*['"]canada['"]/i.test(s);
  return {
    table: mFrom?.[1],
    hasWhere,
    hasLikeA,
    hasCountryCanada,
  };
}
