"use server";

import * as React from "react";
import FeedbackSubmittedEmail from "@/lib/email/templates/feedback-submitted";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { submitFeedbackSchema } from "@/lib/validations/feedback";
import { uploadFeedbackScreenshot } from "@/lib/feedback/upload-feedback-screenshot";

const TYPE_LABELS: Record<string, string> = {
  bug: "Bug report",
  feature: "Feature request",
  general: "General feedback",
};

export async function submitFeedback(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const raw = {
    type: formData.get("type"),
    description: formData.get("description"),
    email: formData.get("email"),
    pageUrl: formData.get("pageUrl"),
    userAgent: formData.get("userAgent"),
  };

  const parsed = submitFeedbackSchema.safeParse({
    type: typeof raw.type === "string" ? raw.type : "",
    description: typeof raw.description === "string" ? raw.description : "",
    email: typeof raw.email === "string" ? raw.email : "",
    pageUrl: typeof raw.pageUrl === "string" ? raw.pageUrl : "",
    userAgent: typeof raw.userAgent === "string" ? raw.userAgent : null,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      first.type?.[0] ??
      first.description?.[0] ??
      first.email?.[0] ??
      first.pageUrl?.[0] ??
      "Invalid feedback.";
    return { error: msg };
  }

  const file = formData.get("screenshot");
  let screenshotUrl: string | null = null;
  if (file instanceof File && file.size > 0) {
    const up = await uploadFeedbackScreenshot(file);
    if ("error" in up) {
      return { error: up.error };
    }
    screenshotUrl = up.url;
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let userId: string | null = null;
  if (authUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true },
    });
    userId = dbUser?.id ?? null;
  }

  const contactEmail = parsed.data.email ?? authUser?.email ?? null;

  try {
    await prisma.feedback.create({
      data: {
        userId,
        type: parsed.data.type,
        description: parsed.data.description,
        email: contactEmail,
        pageUrl: parsed.data.pageUrl,
        userAgent:
          parsed.data.userAgent && parsed.data.userAgent.trim() !== "" ? parsed.data.userAgent.trim() : null,
        screenshotUrl,
        status: "new",
      },
    });
  } catch (e) {
    console.error("submitFeedback", e);
    return { error: "Could not save feedback. Please try again." };
  }

  const typeLabel = TYPE_LABELS[parsed.data.type] ?? parsed.data.type;
  await sendEmail({
    to: "hello@tinies.app",
    subject: `[Tinies beta] ${typeLabel}`,
    react: React.createElement(FeedbackSubmittedEmail, {
      typeLabel,
      description: parsed.data.description,
      email: contactEmail ?? "",
      pageUrl: parsed.data.pageUrl,
      userAgent: parsed.data.userAgent ?? "",
      screenshotUrl,
      submittedByUserId: userId,
    }),
  });

  return { ok: true };
}
