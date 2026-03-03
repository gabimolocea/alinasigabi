import { NextRequest, NextResponse } from "next/server";
import db, { dbReady } from "@/lib/db";
import { sendReminderSMS } from "@/lib/sms";

interface RSVPRow {
  id: number;
  name: string;
  phone: string | null;
  attending: number;
  reminder_sent: number;
}

/**
 * Endpoint to send reminder SMS to all confirmed guests
 * who have a phone number and haven't been reminded yet.
 *
 * Should be triggered by a cron job 1 week before the wedding.
 * 
 * Call with GET /api/cron/send-reminders?secret=YOUR_CRON_SECRET
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbReady;

    // Get all confirmed guests with phone numbers who haven't been reminded
    const result = await db.execute(
      `SELECT id, name, phone, attending, reminder_sent 
       FROM rsvps 
       WHERE attending = 1 
         AND phone IS NOT NULL 
         AND phone != '' 
         AND reminder_sent = 0`
    );
    const guests = result.rows as unknown as RSVPRow[];

    let sent = 0;
    let failed = 0;

    for (const guest of guests) {
      try {
        const success = await sendReminderSMS(guest.phone!, guest.name);
        if (success) {
          await db.execute({ sql: "UPDATE rsvps SET reminder_sent = 1 WHERE id = ?", args: [guest.id] });
          sent++;
        } else {
          await db.execute({ sql: "UPDATE rsvps SET reminder_sent = 1 WHERE id = ?", args: [guest.id] });
          sent++;
        }
      } catch (err) {
        console.error(`Failed to send reminder to ${guest.name}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      message: `Reminders processed: ${sent} sent, ${failed} failed, ${guests.length} total`,
      sent,
      failed,
      total: guests.length,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
