/**
 * Twilio SMS sending utility.
 * Only send to users with phoneVerified = true.
 * Uses TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.
 * Does not throw — log and return { success: false } on failure.
 */

import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client =
  accountSid && authToken ? Twilio(accountSid, authToken) : null;

function isConfigured(): boolean {
  if (!accountSid || !authToken || !fromNumber) {
    if (!accountSid) console.warn("TWILIO_ACCOUNT_SID is not set; SMS disabled.");
    if (!authToken) console.warn("TWILIO_AUTH_TOKEN is not set; SMS disabled.");
    if (!fromNumber) console.warn("TWILIO_PHONE_NUMBER is not set; SMS disabled.");
    return false;
  }
  return true;
}

export type SendSMSOptions = {
  to: string;
  body: string;
};

/**
 * Send an SMS. Does not throw; log and return on failure.
 * Returns { success: true } or { success: false }.
 */
export async function sendSMS({
  to,
  body,
}: SendSMSOptions): Promise<{ success: boolean }> {
  if (!client || !isConfigured() || !fromNumber) {
    return { success: false };
  }
  if (!to?.trim()) {
    console.warn("sendSMS: missing or empty 'to'");
    return { success: false };
  }
  try {
    await client.messages.create({
      body,
      from: fromNumber,
      to: to.trim(),
    });
    return { success: true };
  } catch (e) {
    console.error("sendSMS failed:", e);
    return { success: false };
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

/**
 * Build and send booking-request SMS to provider (for use after createBookingWithPaymentIntent).
 * Only call if provider has phoneVerified and phone.
 */
export function buildBookingRequestSMS(params: {
  ownerName: string;
  serviceType: string;
  date: string;
}): string {
  const link = `${APP_URL}/dashboard/provider`;
  return `New booking request on Tinies from ${params.ownerName} for ${params.serviceType} on ${params.date}. Respond within 4 hours: ${link}`;
}

/**
 * Build and send booking-accepted SMS to owner (for use after acceptBooking).
 * Only call if owner has phoneVerified and phone.
 */
export function buildBookingAcceptedSMS(params: {
  providerName: string;
  date: string;
}): string {
  const link = `${APP_URL}/dashboard/owner`;
  return `Great news! ${params.providerName} accepted your booking on Tinies for ${params.date}. View details: ${link}`;
}

/**
 * Build booking-reminder SMS body (for future cron — 24h before booking).
 * Send to both owner and provider if they have phoneVerified and phone.
 */
export function buildBookingReminderSMS(params: {
  serviceType: string;
  time: string;
}): string {
  return `Reminder: Your ${params.serviceType} booking on Tinies starts tomorrow at ${params.time}.`;
}
