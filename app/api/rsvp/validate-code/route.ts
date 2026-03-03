import { NextRequest, NextResponse } from "next/server";
import db, { dbReady } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await dbReady;
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: "Codul este obligatoriu." }, { status: 400 });
    }

    const result = await db.execute({ sql: "SELECT * FROM invitation_codes WHERE code = ?", args: [code] });
    const invitation = result.rows[0] as unknown as {
      id: number;
      code: string;
      guest_name: string | null;
      max_persons: number;
      used: number;
      phone: string | null;
    } | undefined;

    if (!invitation) {
      return NextResponse.json({ valid: false, error: "Cod de invitație invalid." }, { status: 400 });
    }

    if (invitation.used) {
      return NextResponse.json({ valid: false, error: "Acest cod a fost deja folosit." }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      guest_name: invitation.guest_name,
      max_persons: invitation.max_persons,
      phone: invitation.phone || "",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ valid: false, error: "Eroare internă." }, { status: 500 });
  }
}
