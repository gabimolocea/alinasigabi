import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

/**
 * Normalize a Romanian phone number to E.164 format (+40...)
 */
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  // If starts with 07xx, replace leading 0 with +40
  if (cleaned.startsWith("07")) {
    cleaned = "+40" + cleaned.substring(1);
  }
  // If starts with 40 (without +), add +
  else if (cleaned.startsWith("40") && cleaned.length >= 11) {
    cleaned = "+" + cleaned;
  }
  // If doesn't start with +, add +40
  else if (!cleaned.startsWith("+")) {
    cleaned = "+40" + cleaned;
  }

  return cleaned;
}

/**
 * Send an SMS message via AWS SNS
 */
export async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log(`📱 [SMS simulat] Către: ${to}\n   Mesaj: ${body}`);
    return false;
  }

  try {
    const normalizedTo = normalizePhone(to);
    console.log(`📱 Trimit SMS către ${normalizedTo}...`);
    const command = new PublishCommand({
      PhoneNumber: normalizedTo,
      Message: body,
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "AlinaSiGabi",
        },
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    });

    const result = await snsClient.send(command);
    console.log(`✅ SMS trimis cu succes către ${normalizedTo}, MessageId: ${result.MessageId}`);
    return true;
  } catch (error: unknown) {
    const err = error as Error & { name?: string; $metadata?: { httpStatusCode?: number } };
    console.error(`❌ Eroare la trimiterea SMS către ${normalizePhone(to)}:`, err.name, err.message);
    if (err.$metadata) {
      console.error(`   HTTP Status: ${err.$metadata.httpStatusCode}`);
    }
    return false;
  }
}

/**
 * Send RSVP confirmation SMS
 */
export async function sendConfirmationSMS(
  phone: string,
  name: string,
  attending: boolean
): Promise<boolean> {
  const message = attending
    ? `Draga ${name}, confirmarea ta a fost inregistrata cu succes! Te asteptam cu drag la nunta noastra pe 4 Iulie 2026. Alina & Gabriel`
    : `Draga ${name}, am primit confirmarea ta. Ne pare rau ca nu vei putea participa, dar iti multumim pentru raspuns! Cu drag, Alina & Gabriel`;

  return sendSMS(phone, message);
}

/**
 * Send wedding reminder SMS (1 week before)
 */
export async function sendReminderSMS(
  phone: string,
  name: string
): Promise<boolean> {
  const message = `Draga ${name}, iti reamintim ca nunta noastra este saptamana viitoare, pe 4 Iulie 2026! Abia asteptam sa ne vedem! Cu drag, Alina & Gabriel`;

  return sendSMS(phone, message);
}
