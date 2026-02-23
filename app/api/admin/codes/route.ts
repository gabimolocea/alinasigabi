import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

function generateSecureCode(): string {
  // Generate 8-char cryptographically random code (base32-like, no ambiguous chars)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export async function GET() {
  try {
    const rows = db.prepare(`
      SELECT ic.*, r.name as rsvp_name, r.attending as rsvp_attending, r.num_persons as rsvp_persons,
             r.menu_preferences as rsvp_menu, r.need_accommodation as rsvp_accommodation,
             r.attending_church as rsvp_church, r.attending_party as rsvp_party,
             r.phone as rsvp_phone, r.message as rsvp_message, r.table_number as rsvp_table,
             r.created_at as rsvp_date
      FROM invitation_codes ic
      LEFT JOIN rsvps r ON r.invitation_code = ic.code
      ORDER BY ic.created_at DESC
    `).all();
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guest_name, max_persons, phone, notes } = body;

    if (!guest_name) {
      return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
    }

    // Generate cryptographically secure random code with retry for uniqueness
    let code = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      code = generateSecureCode();
      const existing = db.prepare("SELECT id FROM invitation_codes WHERE code = ?").get(code);
      if (!existing) break;
    }

    const stmt = db.prepare(`
      INSERT INTO invitation_codes (code, guest_name, max_persons, status, phone, notes)
      VALUES (?, ?, ?, 'draft', ?, ?)
    `);

    const result = stmt.run(code, guest_name, max_persons || 10, phone || null, notes || null);
    return NextResponse.json({ id: result.lastInsertRowid, code }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, guest_name, max_persons, status, phone, notes, table_number } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (status) {
      db.prepare("UPDATE invitation_codes SET status = ? WHERE id = ?").run(status, id);
    }
    if (guest_name !== undefined) {
      db.prepare("UPDATE invitation_codes SET guest_name = ? WHERE id = ?").run(guest_name, id);
    }
    if (max_persons !== undefined) {
      db.prepare("UPDATE invitation_codes SET max_persons = ? WHERE id = ?").run(max_persons, id);
    }
    if (phone !== undefined) {
      db.prepare("UPDATE invitation_codes SET phone = ? WHERE id = ?").run(phone || null, id);
    }
    if (notes !== undefined) {
      db.prepare("UPDATE invitation_codes SET notes = ? WHERE id = ?").run(notes || null, id);
    }
    if (table_number !== undefined) {
      // Update table in rsvps if RSVP exists
      const inv = db.prepare("SELECT code FROM invitation_codes WHERE id = ?").get(id) as { code: string } | undefined;
      if (inv) {
        db.prepare("UPDATE rsvps SET table_number = ? WHERE invitation_code = ?").run(table_number || null, inv.code);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    // Also delete associated RSVP
    const inv = db.prepare("SELECT code FROM invitation_codes WHERE id = ?").get(id) as { code: string } | undefined;
    if (inv) {
      db.prepare("DELETE FROM rsvps WHERE invitation_code = ?").run(inv.code);
    }
    db.prepare("DELETE FROM invitation_codes WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
