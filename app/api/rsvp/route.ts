import { NextRequest, NextResponse } from "next/server";
import db, { dbReady } from "@/lib/db";
import { sendConfirmationSMS } from "@/lib/sms";

export async function GET() {
  try {
    await dbReady;
    const result = await db.execute("SELECT * FROM rsvps ORDER BY created_at DESC");
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
      const guestResult = await db.execute({ sql: "SELECT * FROM invitation_codes WHERE id = ?", args: [guest_id] });
      const guest = guestResult.rows[0] as unknown as { id: number; code: string; used: number } | undefined;
      if (!guest) {
        return NextResponse.json({ error: "Invitatul nu a fost găsit." }, { status: 400 });
      }
      if (guest.used) {
        return NextResponse.json({ error: "Acest invitat a confirmat deja prezența." }, { status: 400 });
      }
      resolvedCode = guest.code;
    } else if (invitation_code) {
      const codeResult = await db.execute({ sql: "SELECT * FROM invitation_codes WHERE code = ?", args: [invitation_code] });
      const code = codeResult.rows[0] as unknown as { id: number; code: string; used: number } | undefined;
      if (!code) {
        return NextResponse.json({ error: "Cod de invitație invalid." }, { status: 400 });
      }
      if (code.used) {
        return NextResponse.json({ error: "Acest cod de invitație a fost deja folosit." }, { status: 400 });
      }
      resolvedCode = code.code;
    }

    const result = await db.execute({
      sql: `INSERT INTO rsvps (name, attending, num_persons, menu_preferences, need_accommodation, attending_church, attending_party, phone, message, invitation_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        name,
        attending,
        num_persons,
        menu_preferences || "[]",
        need_accommodation || 0,
        attending_church || 0,
        attending_party || 0,
        phone || null,
        message || null,
        resolvedCode,
      ],
    });

    // Mark code as used and update status
    if (resolvedCode) {
      const newStatus = attending === 1 ? 'confirmed' : 'declined';
      await db.execute({ sql: "UPDATE invitation_codes SET used = 1, status = ? WHERE code = ?", args: [newStatus, resolvedCode] });
    }

    // Send confirmation SMS if phone number is provided
    if (phone) {
      sendConfirmationSMS(phone, name, attending === 1).catch((err) =>
        console.error("Eroare la trimiterea SMS-ului de confirmare:", err)
      );
    }

    return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
