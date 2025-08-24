import initSqlJs, { Database } from "sql.js";

/**
 * Initializes an in-browser SQLite DB with demo schema + seed data.
 */
export async function initDb(): Promise<Database> {
  const SQL = await initSqlJs({
    // Ensures the WASM loads from the official CDN in dev and build
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  const db = new SQL.Database();

  db.run(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE customers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name  TEXT NOT NULL,
      last_name   TEXT NOT NULL,
      country     TEXT NOT NULL,
      signup_date TEXT NOT NULL
    );

    CREATE TABLE products (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT NOT NULL,
      price    REAL NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE orders (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      order_date  TEXT NOT NULL,
      status      TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE order_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id    INTEGER NOT NULL,
      product_id  INTEGER NOT NULL,
      quantity    INTEGER NOT NULL,
      unit_price  REAL NOT NULL,
      FOREIGN KEY (order_id)   REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    /* Seed: Customers */
    INSERT INTO customers (first_name, last_name, country, signup_date) VALUES
      ('Adam','Ross','Canada','2023-06-12'),
      ('Alice','Moore','Canada','2024-01-08'),
      ('Anita','Gomez','Canada','2023-11-21'),
      ('Bob','Lee','USA','2022-03-18'),
      ('Carlos','Diaz','Mexico','2024-05-03');

    /* Seed: Products (note X-113 is never ordered on purpose) */
    INSERT INTO products (name, price, category) VALUES
      ('X-113 Field Sensor', 799.00, 'Sensors'),
      ('Thermal Camera T200', 1299.00, 'Imaging'),
      ('RFID Reader R9', 399.00, 'Access'),
      ('Portable Vault V5', 1999.00, 'Security'),
      ('Data Logger D4', 249.00, 'Sensors');

    /* Seed: Orders */
    INSERT INTO orders (customer_id, order_date, status) VALUES
      (1, '2024-11-07', 'processing'),  /* Adam */
      (2, '2024-11-06', 'pending'),     /* Alice */
      (3, '2024-08-17', 'shipped'),     /* Anita */
      (4, '2024-07-22', 'cancelled');   /* Bob */

    /* Seed: Order Items (no X-113) */
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
      (1, 2, 1, 1299.00),  /* Adam buys Thermal Camera */
      (1, 5, 2, 249.00),   /* Adam buys 2x Data Logger */
      (2, 4, 1, 1999.00),  /* Alice buys Portable Vault (pending) */
      (3, 3, 3, 399.00);   /* Anita buys 3x RFID Readers (shipped) */
  `);

  return db;
}

/** Tiny helper to run SQL and normalize output for tables */
export function execSelect(
  db: Database,
  sql: string
): { columns: string[]; values: (string | number | null)[][] } | null {
  const results = db.exec(sql); // may return multiple statements
  if (!results || results.length === 0) return null;
  const { columns, values } = results[0];
  return { columns, values };
}
