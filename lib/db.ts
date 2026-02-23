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
    invitation_code TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Add invitation_code column if it doesn't exist (for existing DBs)
try {
  db.exec(`ALTER TABLE rsvps ADD COLUMN invitation_code TEXT`);
} catch {
  // column already exists
}

// Create invitation_codes table for valid codes
db.exec(`
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
  )
`);

// Add status column if missing (for existing DBs)
try { db.exec(`ALTER TABLE invitation_codes ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE invitation_codes ADD COLUMN phone TEXT`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE invitation_codes ADD COLUMN notes TEXT`); } catch { /* exists */ }

export default db;
