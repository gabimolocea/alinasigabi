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
      guest_id,
      invitation_code,
    } = body;

    if (!name || attending === undefined || !num_persons) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Resolve the invitation code from guest_id or direct code
    let resolvedCode: string | null = null;

    if (guest_id) {
      const guest = db.prepare("SELECT * FROM invitation_codes WHERE id = ?").get(guest_id) as { id: number; code: string; used: number } | undefined;
      if (!guest) {
        return NextResponse.json({ error: "Invitatul nu a fost găsit." }, { status: 400 });
      }
      if (guest.used) {
        return NextResponse.json({ error: "Acest invitat a confirmat deja prezența." }, { status: 400 });
      }
      resolvedCode = guest.code;
    } else if (invitation_code) {
      // Legacy code-based flow
      const code = db.prepare("SELECT * FROM invitation_codes WHERE code = ?").get(invitation_code) as { id: number; code: string; used: number } | undefined;
      if (!code) {
        return NextResponse.json({ error: "Cod de invitație invalid." }, { status: 400 });
      }
      if (code.used) {
        return NextResponse.json({ error: "Acest cod de invitație a fost deja folosit." }, { status: 400 });
      }
      resolvedCode = code.code;
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
      resolvedCode
    );

    // Mark code as used and update status
    if (resolvedCode) {
      const newStatus = attending === 1 ? 'confirmed' : 'declined';
      db.prepare("UPDATE invitation_codes SET used = 1, status = ? WHERE code = ?").run(newStatus, resolvedCode);
    }

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
