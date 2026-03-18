/**
 * Email sending utility (Resend + React Email).
 * Transactional emails: booking confirmations, notifications, review received.
 * Set RESEND_API_KEY and optionally RESEND_FROM (defaults to Resend test domain if unset).
 */

import { Resend } from "resend";
import type { ReactElement } from "react";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM ?? "Tinies <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  react: ReactElement;
};

/**
 * Send a transactional email. Does not throw; log and return on failure.
 * Returns { success: true, id } or { success: false, error }.
 */
export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailOptions): Promise<{ success: true; id: string } | { success: false; error: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set; email not sent.", { to, subject });
    return { success: false, error: "Email not configured." };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
    });
    if (error) {
      console.error("sendEmail failed:", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id ?? "" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("sendEmail threw:", e);
    return { success: false, error: message };
  }
}
