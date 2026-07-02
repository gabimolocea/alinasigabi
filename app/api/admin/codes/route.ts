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
      if (!String(guest_name).trim()) {
        return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
      }
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
    // Handle RSVP field updates (UPSERT)
    const ALLOWED_RSVP: Record<string, string> = {
      rsvp_attending: "attending",
      rsvp_persons: "num_persons",
      rsvp_phone: "phone",
      rsvp_accommodation: "need_accommodation",
      rsvp_church: "attending_church",
      rsvp_party: "attending_party",
      rsvp_menu: "menu_preferences",
      rsvp_message: "message",
    };
    const rsvpUpdate: Record<string, unknown> = {};
    for (const [bodyKey, dbCol] of Object.entries(ALLOWED_RSVP)) {
      if (body[bodyKey] !== undefined) {
        if (bodyKey === "rsvp_persons") {
          rsvpUpdate[dbCol] = body[bodyKey] ? parseInt(String(body[bodyKey]), 10) : 1;
        } else if (bodyKey === "rsvp_phone" || bodyKey === "rsvp_message") {
          rsvpUpdate[dbCol] = body[bodyKey] || null;
        } else {
          rsvpUpdate[dbCol] = body[bodyKey];
        }
      }
    }
    if (Object.keys(rsvpUpdate).length > 0) {
      const invResult2 = await db.execute({ sql: "SELECT code, guest_name FROM invitation_codes WHERE id = ?", args: [id] });
      const inv2 = invResult2.rows[0] as unknown as { code: string; guest_name: string } | undefined;
      if (inv2) {
        const existing = await db.execute({ sql: "SELECT id FROM rsvps WHERE invitation_code = ?", args: [inv2.code] });
        if (existing.rows.length === 0) {
          const persons = (rsvpUpdate["num_persons"] as number) ?? 1;
          const defaultMenus = JSON.stringify(Array(persons).fill("normal"));
          await db.execute({
            sql: `INSERT INTO rsvps (invitation_code, name, attending, num_persons, menu_preferences, need_accommodation, attending_church, attending_party, phone, message)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              inv2.code,
              inv2.guest_name || "",
              rsvpUpdate["attending"] !== undefined ? (rsvpUpdate["attending"] as number) : 1,
              persons,
              (rsvpUpdate["menu_preferences"] as string) ?? defaultMenus,
              rsvpUpdate["need_accommodation"] !== undefined ? (rsvpUpdate["need_accommodation"] as number) : 0,
              rsvpUpdate["attending_church"] !== undefined ? (rsvpUpdate["attending_church"] as number) : 0,
              rsvpUpdate["attending_party"] !== undefined ? (rsvpUpdate["attending_party"] as number) : 1,
              (rsvpUpdate["phone"] as string) ?? null,
              (rsvpUpdate["message"] as string) ?? null,
            ],
          });
        } else {
          for (const [col, value] of Object.entries(rsvpUpdate)) {
            if (Object.values(ALLOWED_RSVP).includes(col)) {
              await db.execute({ sql: `UPDATE rsvps SET ${col} = ? WHERE invitation_code = ?`, args: [value as string | number | null, inv2.code] });
            }
          }
        }
        await db.execute({ sql: "UPDATE invitation_codes SET used = 1 WHERE id = ?", args: [id] });
        if (rsvpUpdate["attending"] !== undefined) {
          const newStatus = rsvpUpdate["attending"] === 1 ? "confirmed" : "declined";
          await db.execute({ sql: "UPDATE invitation_codes SET status = ? WHERE id = ?", args: [newStatus, id] });
        }
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
