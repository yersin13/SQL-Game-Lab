import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type { Database, SqlValue } from "sql.js";

/** Create and seed the in-memory database. */
export async function initDb(): Promise<Database> {
  const SQL = await initSqlJs({
    locateFile: () => wasmUrl,
  });

  const db = new SQL.Database();

  // --- Schema
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE customers (
      id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      country TEXT NOT NULL,
      total_spend REAL DEFAULT 0,
      suspended INTEGER DEFAULT 0
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      amount REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE shipments (
      id INTEGER PRIMARY KEY,
      shipped_date TEXT NOT NULL,
      order_id INTEGER REFERENCES orders(id)
    );

    CREATE TABLE suppliers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE contacts (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      channel TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE feed_a (
      id INTEGER PRIMARY KEY, customer_id INTEGER, event TEXT, occurred_at TEXT
    );
    CREATE TABLE feed_b (
      id INTEGER PRIMARY KEY, customer_id INTEGER, event TEXT, occurred_at TEXT
    );
  `);

  // --- Seed minimal, useful data
  db.exec(`
    INSERT INTO customers (id, first_name, country, total_spend, suspended) VALUES
      (1, 'Alice',   'Canada',  1200, 0),
      (2, 'Aaron',   'Canada',   300, 0),
      (3, 'Ava',     'USA',      900, 0),
      (4, 'Bob',     'Canada',   100, 1),
      (5, 'Claire',  'USA',     2400, 0),
      (6, 'Ann',     'Canada',  1800, 0),
      (7, 'Zara',    'UK',       150, 0),
      (8, 'Andrew',  'Canada',   500, 0);

    INSERT INTO suppliers (id, name) VALUES
      (10, 'NORDIC'), (11, 'ACME'), (12, 'MLT'), (13, 'OTHER');

    INSERT INTO orders (id, customer_id, amount, created_at) VALUES
      (100, 1, 200, '2024-05-01'),
      (101, 1, 150, '2024-05-10'),
      (102, 2, 300, '2024-05-11'),
      (103, 3, 450, '2024-06-01'),
      (104, 5, 800, '2024-06-10'),
      (105, 8, 500, '2024-07-01');

    INSERT INTO shipments (id, shipped_date, order_id) VALUES
      (900, '2024-06-02', 103),
      (901, '2024-06-12', 104),
      (902, '2024-07-02', 105),
      (903, '2024-04-22', 100),
      (904, '2024-04-29', 101),
      (905, '2024-05-12', 102);

    INSERT INTO contacts (id, customer_id, channel, updated_at) VALUES
      (500, 1, 'email',    '2024-06-01T12:00:00Z'),
      (501, 1, 'phone',    '2024-06-05T09:00:00Z'),
      (502, 2, 'email',    '2024-05-20T14:00:00Z'),
      (503, 3, 'email',    '2024-06-03T08:00:00Z'),
      (504, 5, 'sms',      '2024-07-10T10:30:00Z');

    INSERT INTO feed_a (id, customer_id, event, occurred_at) VALUES
      (1, 1, 'created', '2024-01-01'),
      (2, 2, 'updated', '2024-02-01');

    INSERT INTO feed_b (id, customer_id, event, occurred_at) VALUES
      (1, 3, 'created', '2024-03-01'),
      (2, 5, 'updated', '2024-03-15');
  `);

  return db;
}

/** Normalize sql.js values so UI tables accept `(string|number|null)[][]`. */
const normalize = (v: SqlValue): string | number | null => {
  if (v == null) return null;
  if (typeof v === "string" || typeof v === "number") return v;
  // Uint8Array (BLOB) -> hex string
  const u8 = v as Uint8Array;
  let hex = "0x";
  for (let i = 0; i < u8.length; i++) hex += u8[i].toString(16).padStart(2, "0");
  return hex;
};

/** Execute a SELECT and return normalized columns/values for display. */
export function execSelect(
  db: Database,
  sql: string
): { columns: string[]; values: (string | number | null)[][] } {
  const res = db.exec(sql);
  if (!res || res.length === 0) return { columns: [], values: [] };

  const first = res[0] as unknown as { columns: string[]; values: SqlValue[][] };
  const columns = first.columns;
  const values = first.values.map((row) => row.map((cell) => normalize(cell)));
  return { columns, values };
}
