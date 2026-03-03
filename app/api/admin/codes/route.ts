import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db, { dbReady } from "@/lib/db";

function generateSecureCode(): string {
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
    await dbReady;
    const result = await db.execute(`
      SELECT ic.*, r.name as rsvp_name, r.attending as rsvp_attending, r.num_persons as rsvp_persons,
             r.menu_preferences as rsvp_menu, r.need_accommodation as rsvp_accommodation,
             r.attending_church as rsvp_church, r.attending_party as rsvp_party,
             r.phone as rsvp_phone, r.message as rsvp_message, r.table_number as rsvp_table,
             r.created_at as rsvp_date
      FROM invitation_codes ic
      LEFT JOIN rsvps r ON r.invitation_code = ic.code
      ORDER BY ic.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbReady;
    const body = await request.json();
    const { guest_name, max_persons, phone, notes } = body;

    if (!guest_name) {
      return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
    }

    // Generate cryptographically secure random code with retry for uniqueness
    let code = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      code = generateSecureCode();
      const existing = await db.execute({ sql: "SELECT id FROM invitation_codes WHERE code = ?", args: [code] });
      if (existing.rows.length === 0) break;
    }

    const result = await db.execute({
      sql: `INSERT INTO invitation_codes (code, guest_name, max_persons, status, phone, notes)
            VALUES (?, ?, ?, 'draft', ?, ?)`,
      args: [code, guest_name, max_persons || 10, phone || null, notes || null],
    });

    return NextResponse.json({ id: Number(result.lastInsertRowid), code }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbReady;
    const body = await request.json();
    const { id, guest_name, max_persons, status, phone, notes, table_number } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (status) {
      await db.execute({ sql: "UPDATE invitation_codes SET status = ? WHERE id = ?", args: [status, id] });
      if (status !== "confirmed" && status !== "declined") {
        await db.execute({ sql: "UPDATE invitation_codes SET used = 0 WHERE id = ?", args: [id] });
        const invResult = await db.execute({ sql: "SELECT code FROM invitation_codes WHERE id = ?", args: [id] });
        const inv = invResult.rows[0] as unknown as { code: string } | undefined;
        if (inv) {
          await db.execute({ sql: "DELETE FROM rsvps WHERE invitation_code = ?", args: [inv.code] });
        }
      }
    }
    if (guest_name !== undefined) {
      await db.execute({ sql: "UPDATE invitation_codes SET guest_name = ? WHERE id = ?", args: [guest_name, id] });
    }
    if (max_persons !== undefined) {
      await db.execute({ sql: "UPDATE invitation_codes SET max_persons = ? WHERE id = ?", args: [max_persons, id] });
    }
    if (phone !== undefined) {
      await db.execute({ sql: "UPDATE invitation_codes SET phone = ? WHERE id = ?", args: [phone || null, id] });
    }
    if (notes !== undefined) {
      await db.execute({ sql: "UPDATE invitation_codes SET notes = ? WHERE id = ?", args: [notes || null, id] });
    }
    if (table_number !== undefined) {
      const invResult = await db.execute({ sql: "SELECT code FROM invitation_codes WHERE id = ?", args: [id] });
      const inv = invResult.rows[0] as unknown as { code: string } | undefined;
      if (inv) {
        await db.execute({ sql: "UPDATE rsvps SET table_number = ? WHERE invitation_code = ?", args: [table_number || null, inv.code] });
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
    await dbReady;
    const { id } = await request.json();
    const invResult = await db.execute({ sql: "SELECT code FROM invitation_codes WHERE id = ?", args: [id] });
    const inv = invResult.rows[0] as unknown as { code: string } | undefined;
    if (inv) {
      await db.execute({ sql: "DELETE FROM rsvps WHERE invitation_code = ?", args: [inv.code] });
    }
    await db.execute({ sql: "DELETE FROM invitation_codes WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
