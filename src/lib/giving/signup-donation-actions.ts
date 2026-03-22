"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";
import { UserRole } from "@prisma/client";
import { safePostWelcomePath } from "./signup-donation-helpers";
import {
  upsertPrismaUserFromSupabaseAuthUser,
  roleFromSupabaseMetadata,
} from "@/lib/auth/upsert-prisma-user";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export type WelcomeCharityOption = { id: string; name: string; slug: string };

/** Verified active charities for the welcome-page dropdown (Tinies Giving Fund = null id, chosen in UI). */
export async function getVerifiedCharitiesForWelcome(): Promise<WelcomeCharityOption[]> {
  const rows = await prisma.charity.findMany({
    where: { verified: true, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return rows;
}

/** Ensure Prisma row exists for the signed-in Supabase user (needed for donations FK). */
export async function ensureAuthUserInPrisma(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await upsertPrismaUserFromSupabaseAuthUser(user);
  return { ok: true };
}

export type WelcomePageState =
  | { status: "redirect"; path: string }
  | {
      status: "show";
      nextPath: string;
      charities: WelcomeCharityOption[];
      role: UserRole;
    };

export async function getWelcomePageState(nextQuery: string | null): Promise<WelcomePageState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const welcomeTarget =
      nextQuery != null && nextQuery !== ""
        ? `/welcome?next=${encodeURIComponent(nextQuery)}`
        : "/welcome";
    return { status: "redirect", path: `/login?next=${encodeURIComponent(welcomeTarget)}` };
  }

  await upsertPrismaUserFromSupabaseAuthUser(user);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { welcomeFlowCompletedAt: true, role: true },
  });
  if (!dbUser) {
    return { status: "redirect", path: "/login" };
  }

  if (dbUser.welcomeFlowCompletedAt) {
    return {
      status: "redirect",
      path: safePostWelcomePath(nextQuery, dbUser.role),
    };
  }

  const charities = await getVerifiedCharitiesForWelcome();
  return {
    status: "show",
    nextPath: safePostWelcomePath(nextQuery, dbUser.role),
    charities,
    role: dbUser.role,
  };
}

export type SignupDonationCheckoutInput = {
  amountCents: number;
  charityId: string | null;
  /** Open-redirect-safe path from `safePostWelcomePath` (e.g. /dashboard/owner). */
  returnNextPath: string;
  showOnLeaderboard?: boolean;
};

/**
 * Stripe Checkout (payment mode) for the post-signup optional donation.
 * Success returns to `/welcome?donated=true&session_id={CHECKOUT_SESSION_ID}&next=...`.
 */
export async function createSignupDonationCheckout(
  input: SignupDonationCheckoutInput
): Promise<{ checkoutUrl: string | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { checkoutUrl: null, error: "You must be signed in." };
  if (input.amountCents < 100) return { checkoutUrl: null, error: "Minimum donation is EUR 1." };

  await upsertPrismaUserFromSupabaseAuthUser(user);

  const charityIdStr = input.charityId?.trim() || "";
  let productName = "Donation — Tinies Giving Fund";
  if (charityIdStr) {
    const ch = await prisma.charity.findUnique({
      where: { id: charityIdStr },
      select: { name: true, verified: true, active: true },
    });
    if (!ch?.verified || !ch.active) {
      return { checkoutUrl: null, error: "Please choose a valid charity." };
    }
    productName = `Donation — ${ch.name}`;
  }

  const nextEnc = encodeURIComponent(input.returnNextPath);
  const successUrl = `${APP_URL}/welcome?donated=true&session_id={CHECKOUT_SESSION_ID}&next=${nextEnc}`;
  const cancelUrl = `${APP_URL}/welcome?next=${nextEnc}`;

  try {
    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: user.id,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productName,
              description: "One-time gift to support rescue animals in Cyprus",
            },
            unit_amount: input.amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "signup_donation",
        userId: user.id,
        charityId: charityIdStr,
        amountCents: String(input.amountCents),
        showOnLeaderboard: input.showOnLeaderboard ? "1" : "0",
      },
    });
    const url = session.url;
    if (!url) return { checkoutUrl: null, error: "Checkout could not be started." };
    return { checkoutUrl: url };
  } catch (e) {
    console.error("createSignupDonationCheckout", e);
    return {
      checkoutUrl: null,
      error: e instanceof Error ? e.message : "Failed to start checkout.",
    };
  }
}

/**
 * After Checkout success: verify session, mark welcome complete, return amount for the thank-you UI.
 */
export async function completeWelcomeAfterSignupCheckout(
  sessionId: string,
  nextPathFromUrl: string | null
): Promise<{ ok: true; amountEur: string; nextPath: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  await upsertPrismaUserFromSupabaseAuthUser(user);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser) return { ok: false, error: "Account not found." };

  const safeNext = safePostWelcomePath(nextPathFromUrl, dbUser.role);

  try {
    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return { ok: false, error: "Payment not completed." };
    }
    const meta = session.metadata ?? {};
    if (meta.type !== "signup_donation" || meta.userId !== user.id) {
      return { ok: false, error: "Invalid session." };
    }

    const total = session.amount_total ?? 0;
    if (total < 100) return { ok: false, error: "Invalid amount." };

    const piRef = session.payment_intent;
    const piId =
      typeof piRef === "string" ? piRef : piRef && typeof piRef === "object" && "id" in piRef ? String(piRef.id) : "";
    if (!piId) return { ok: false, error: "Missing payment reference." };

    await prisma.user.update({
      where: { id: user.id },
      data: { welcomeFlowCompletedAt: new Date() },
    });
    revalidatePath("/welcome");

    const amountEur = (total / 100).toFixed(2);
    return { ok: true, amountEur, nextPath: safeNext };
  } catch (e) {
    console.error("completeWelcomeAfterSignupCheckout", e);
    return { ok: false, error: "Could not confirm your payment." };
  }
}

/** Call after skip or after a successful donation flow so /welcome is not shown again. */
export async function markWelcomeShown(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await upsertPrismaUserFromSupabaseAuthUser(user);
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { welcomeFlowCompletedAt: new Date() },
    });
    revalidatePath("/welcome");
    return { ok: true };
  } catch (e) {
    console.error("markWelcomeShown", e);
    return { ok: false, error: "Could not update your account." };
  }
}
