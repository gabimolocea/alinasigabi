import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:data/wedding.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize tables
async function initDB() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      attending INTEGER NOT NULL,
      num_persons INTEGER NOT NULL DEFAULT 1,
      menu_preferences TEXT NOT NULL DEFAULT '[]',
      need_accommodation INTEGER NOT NULL DEFAULT 0,
      attending_church INTEGER NOT NULL DEFAULT 0,
      attending_party INTEGER NOT NULL DEFAULT 1,
      phone TEXT,
      message TEXT,
      table_number INTEGER,
      invitation_code TEXT,
      reminder_sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invitation_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      guest_name TEXT,
      max_persons INTEGER NOT NULL DEFAULT 10,
      used INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      phone TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// Run init on import
const dbReady = initDB().catch(console.error);

export { dbReady };
export default db;
