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
    } = body;

    if (!name || attending === undefined || !num_persons) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO rsvps (name, attending, num_persons, menu_preferences, need_accommodation, attending_church, attending_party, phone, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      message || null
    );

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
