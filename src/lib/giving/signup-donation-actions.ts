"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";
import { UserRole } from "@prisma/client";
import { safePostWelcomePath } from "./signup-donation-helpers";

function roleFromMetadata(raw: unknown): UserRole {
  const s = String(raw ?? "owner");
  if (s === "provider" || s === "rescue" || s === "adopter" || s === "admin") {
    return s as UserRole;
  }
  return UserRole.owner;
}

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
  const email = (user.email ?? "").trim().toLowerCase();
  const name =
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    email.split("@")[0] ||
    "Member";
  const role = roleFromMetadata(user.user_metadata?.role);
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: email || `${user.id}@placeholder.local`,
      name: name.slice(0, 200),
      passwordHash: "supabase-auth-placeholder",
      role,
    },
    update: {},
  });
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

  await ensureAuthUserInPrisma();

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

/**
 * Creates a Stripe PaymentIntent for the post-signup donation.
 * Recording uses the same webhook path as today (`type: signup_donation`, source signup in DB).
 */
export async function createSignupDonation(params: {
  amountCents: number;
  charityId: string | null;
  showOnLeaderboard?: boolean;
}): Promise<{ clientSecret: string | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { clientSecret: null, error: "You must be signed in." };
  if (params.amountCents < 100) return { clientSecret: null, error: "Minimum donation is €1." };
  await ensureAuthUserInPrisma();
  try {
    const stripe = getStripeServer();
    const pi = await stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: "eur",
      metadata: {
        type: "signup_donation",
        userId: user.id,
        charityId: params.charityId ?? "",
        amountCents: String(params.amountCents),
        showOnLeaderboard: params.showOnLeaderboard ? "1" : "0",
      },
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: pi.client_secret ?? null };
  } catch (e) {
    console.error("createSignupDonation", e);
    return {
      clientSecret: null,
      error: e instanceof Error ? e.message : "Failed to create payment.",
    };
  }
}

/** Call after skip or after a successful donation flow so /welcome is not shown again. */
export async function markWelcomeShown(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await ensureAuthUserInPrisma();
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
