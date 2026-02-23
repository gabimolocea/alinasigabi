import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const rows = db.prepare("SELECT * FROM rsvps ORDER BY created_at DESC").all();
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      attending,
      num_persons,
      menu_preferences,
      need_accommodation,
      attending_church,
      attending_party,
      phone,
      message,
      invitation_code,
    } = body;

    if (!name || attending === undefined || !num_persons || !invitation_code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate invitation code
    const code = db.prepare("SELECT * FROM invitation_codes WHERE code = ?").get(invitation_code) as { id: number; code: string; max_persons: number; used: number } | undefined;
    if (!code) {
      return NextResponse.json({ error: "Cod de invitație invalid." }, { status: 400 });
    }
    if (code.used) {
      return NextResponse.json({ error: "Acest cod de invitație a fost deja folosit." }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO rsvps (name, attending, num_persons, menu_preferences, need_accommodation, attending_church, attending_party, phone, message, invitation_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      attending,
      num_persons,
      menu_preferences || "[]",
      need_accommodation || 0,
      attending_church || 0,
      attending_party || 0,
      phone || null,
      message || null,
      invitation_code
    );

    // Mark code as used and update status
    db.prepare("UPDATE invitation_codes SET used = 1, status = 'confirmed' WHERE code = ?").run(invitation_code);

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
