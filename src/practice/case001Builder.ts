export type BuilderToken = {
  id: string;
  text: string;   // what user sees
  sql: string;    // what we compile
  kind: "kw" | "id" | "op" | "lit" | "wild";
};

export type BuilderConfig = {
  title: string;
  palette: BuilderToken[];
  distractors?: BuilderToken[];               // <- new
  slots: { id: string; label?: string }[];    // order matters
};

export const case001Builder: BuilderConfig = {
  title: "Build the probe: Canada + names starting with A",
  palette: [
    { id: "KW_SELECT", text: "SELECT",     sql: "SELECT",     kind: "kw" },
    { id: "STAR",      text: "*",          sql: "*",          kind: "op" },
    { id: "KW_FROM",   text: "FROM",       sql: "FROM",       kind: "kw" },
    { id: "ID_CUSTOM", text: "customers",  sql: "customers",  kind: "id" },
    { id: "KW_WHERE",  text: "WHERE",      sql: "WHERE",      kind: "kw" },
    { id: "ID_COUNTRY",text: "country",    sql: "country",    kind: "id" },
    { id: "OP_EQ",     text: "=",          sql: "=",          kind: "op" },
    { id: "LIT_CAN",   text: "'Canada'",   sql: "'Canada'",   kind: "lit" },
    { id: "KW_AND",    text: "AND",        sql: "AND",        kind: "kw" },
    { id: "ID_FN",     text: "first_name", sql: "first_name", kind: "id" },
    { id: "KW_LIKE",   text: "LIKE",       sql: "LIKE",       kind: "kw" },
    { id: "LIT_AWILD", text: "'A%'",       sql: "'A%'",       kind: "lit" },
  ],
  // A few plausible-but-wrong options
  distractors: [
    { id: "ID_ORD",    text: "orders",     sql: "orders",     kind: "id" },
    { id: "LIT_USA",   text: "'USA'",      sql: "'USA'",      kind: "lit" },
    { id: "OP_NEQ",    text: "!=",         sql: "!=",         kind: "op" },
    { id: "KW_OR",     text: "OR",         sql: "OR",         kind: "kw" },
    { id: "ID_LN",     text: "last_name",  sql: "last_name",  kind: "id" },
  ],
  slots: [
    { id: "S1",  label: "SELECT" },
    { id: "S2",  label: "*" },
    { id: "S3",  label: "FROM" },
    { id: "S4",  label: "table" },
    { id: "S5",  label: "WHERE" },
    { id: "S6",  label: "country" },
    { id: "S7",  label: "=" },
    { id: "S8",  label: "'Canada'" },
    { id: "S9",  label: "AND" },
    { id: "S10", label: "first_name" },
    { id: "S11", label: "LIKE" },
    { id: "S12", label: "'A%'" },
  ],
};
