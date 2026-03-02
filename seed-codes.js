const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'wedding.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS invitation_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    guest_name TEXT,
    max_persons INTEGER NOT NULL DEFAULT 2,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

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

// Sample guests (name-based RSVP - no code needed by guests)
const guests = [
  { code: 'AG2026-001', guest_name: 'Familie Popescu', max_persons: 4 },
  { code: 'AG2026-002', guest_name: 'Familie Ionescu', max_persons: 3 },
  { code: 'AG2026-003', guest_name: 'Familie Georgescu', max_persons: 2 },
  { code: 'AG2026-004', guest_name: 'Andrei și Maria Stanciu', max_persons: 2 },
  { code: 'AG2026-005', guest_name: 'Alexandru Marinescu', max_persons: 2 },
  { code: 'TEST', guest_name: 'Test Invitat', max_persons: 5 },
];

const stmt = db.prepare('INSERT OR IGNORE INTO invitation_codes (code, guest_name, max_persons) VALUES (?, ?, ?)');

for (const g of guests) {
  stmt.run(g.code, g.guest_name, g.max_persons);
  console.log(`✓ Added guest: ${g.guest_name} (max ${g.max_persons})`);
}

console.log('\nDone! Invitation codes seeded.');
db.close();
