const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:data/wedding.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Sample guests (name-based RSVP - no code needed by guests)
const guests = [
  { code: 'AG2026-001', guest_name: 'Familie Popescu', max_persons: 4 },
  { code: 'AG2026-002', guest_name: 'Familie Ionescu', max_persons: 3 },
  { code: 'AG2026-003', guest_name: 'Familie Georgescu', max_persons: 2 },
  { code: 'AG2026-004', guest_name: 'Andrei și Maria Stanciu', max_persons: 2 },
  { code: 'AG2026-005', guest_name: 'Alexandru Marinescu', max_persons: 2 },
  { code: 'TEST', guest_name: 'Test Invitat', max_persons: 5 },
];

async function seed() {
  for (const g of guests) {
    try {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO invitation_codes (code, guest_name, max_persons) VALUES (?, ?, ?)',
        args: [g.code, g.guest_name, g.max_persons],
      });
      console.log(`✓ Added guest: ${g.guest_name} (max ${g.max_persons})`);
    } catch (err) {
      console.log(`⚠ Skipped ${g.guest_name}: ${err.message}`);
    }
  }
  console.log('\nDone! Invitation codes seeded.');
}

seed().catch(console.error);
