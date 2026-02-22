import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'wedding.db');
const db = new Database(dbPath);

db.exec(`
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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export default db;
