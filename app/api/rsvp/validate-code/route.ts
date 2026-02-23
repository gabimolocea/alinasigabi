import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: "Codul este obligatoriu." }, { status: 400 });
    }

    const invitation = db.prepare("SELECT * FROM invitation_codes WHERE code = ?").get(code) as {
      id: number;
      code: string;
      guest_name: string | null;
      max_persons: number;
      used: number;
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
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ valid: false, error: "Eroare internă." }, { status: 500 });
  }
}
