"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";
import { TINIES_GUARDIAN_CHECKOUT_TYPE } from "./guardian-stripe";
import type { CreateGuardianCheckoutInput, GuardianSubscriptionDetails } from "./guardian-actions-types";

const GUARDIAN_PRODUCT_ID = process.env.STRIPE_GUARDIAN_PRODUCT_ID;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getOrCreateStripeCustomer(userId: string, email: string, name: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (user?.stripeCustomerId) return user.stripeCustomerId;
  const stripe = getStripeServer();
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

async function getTiniesGuardianProductId(stripe: ReturnType<typeof getStripeServer>): Promise<string> {
  let productId = GUARDIAN_PRODUCT_ID;
  if (!productId) {
    const products = await stripe.products.list({ active: true, limit: 100 });
    const guardian = products.data.find((p) => p.name === "Tinies Guardian");
    if (guardian) productId = guardian.id;
    else {
      const product = await stripe.products.create({
        name: "Tinies Guardian",
        description: "Monthly giving to animal rescue",
      });
      productId = product.id;
    }
  }
  return productId;
}

/**
 * Stripe Checkout (subscription mode). Creates no DB row until checkout.session.completed.
 */
export async function createGuardianSubscription(
  input: CreateGuardianCheckoutInput
): Promise<{ checkoutUrl: string | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { checkoutUrl: null, error: "You must be signed in." };
  if (input.amountMonthlyCents < 100) {
    return { checkoutUrl: null, error: "Minimum €1/month." };
  }

  const existingActive = await prisma.guardianSubscription.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });
  if (existingActive && (existingActive.status === "active" || existingActive.status === "paused")) {
    return {
      checkoutUrl: null,
      error: "You already have a Guardian subscription. Manage it in Giving settings.",
    };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true },
    });
    if (!dbUser?.email) return { checkoutUrl: null, error: "User email not found." };

    const stripe = getStripeServer();
    const customerId = await getOrCreateStripeCustomer(user.id, dbUser.email, dbUser.name);
    const productId = await getTiniesGuardianProductId(stripe);

    const charityIdStr = input.charityId ?? "";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      success_url: `${APP_URL}/dashboard/owner/giving?guardian=success`,
      cancel_url: `${APP_URL}/giving/become-a-guardian?cancelled=1`,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product: productId,
            unit_amount: input.amountMonthlyCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        checkout_type: TINIES_GUARDIAN_CHECKOUT_TYPE,
        userId: user.id,
        charityId: charityIdStr,
        tier: input.tier,
        amountMonthlyCents: String(input.amountMonthlyCents),
        showOnLeaderboard: input.showOnLeaderboard ? "1" : "0",
      },
      subscription_data: {
        metadata: {
          checkout_type: TINIES_GUARDIAN_CHECKOUT_TYPE,
          userId: user.id,
          charityId: charityIdStr,
          tier: input.tier,
          amountMonthlyCents: String(input.amountMonthlyCents),
        },
      },
      allow_promotion_codes: false,
    });

    if (!session.url) {
      return { checkoutUrl: null, error: "Could not start checkout." };
    }

    revalidatePath("/giving/become-a-guardian");
    return { checkoutUrl: session.url };
  } catch (e) {
    console.error("createGuardianSubscription checkout", e);
    return {
      checkoutUrl: null,
      error: e instanceof Error ? e.message : "Failed to start subscription checkout.",
    };
  }
}

async function getGuardianSubForCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null as null, sub: null };
  const sub = await prisma.guardianSubscription.findUnique({
    where: { userId: user.id },
    select: { id: true, stripeSubscriptionId: true, status: true },
  });
  return { user, sub };
}

export async function pauseGuardianSubscription(): Promise<{ error?: string }> {
  const { user, sub } = await getGuardianSubForCurrentUser();
  if (!user) return { error: "You must be signed in." };
  if (!sub?.stripeSubscriptionId) return { error: "Subscription not found." };
  try {
    const stripe = getStripeServer();
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      pause_collection: { behavior: "void" },
    });
    await prisma.guardianSubscription.update({
      where: { id: sub.id },
      data: { status: "paused", pausedAt: new Date() },
    });
    revalidatePath("/dashboard/owner/giving");
    revalidatePath("/giving");
    return {};
  } catch (e) {
    console.error("pauseGuardianSubscription", e);
    return { error: e instanceof Error ? e.message : "Failed to pause." };
  }
}

export async function resumeGuardianSubscription(): Promise<{ error?: string }> {
  const { user, sub } = await getGuardianSubForCurrentUser();
  if (!user) return { error: "You must be signed in." };
  if (!sub?.stripeSubscriptionId) return { error: "Subscription not found." };
  try {
    const stripe = getStripeServer();
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      pause_collection: null,
    });
    await prisma.guardianSubscription.update({
      where: { id: sub.id },
      data: { status: "active", pausedAt: null },
    });
    revalidatePath("/dashboard/owner/giving");
    revalidatePath("/giving");
    return {};
  } catch (e) {
    console.error("resumeGuardianSubscription", e);
    return { error: e instanceof Error ? e.message : "Failed to resume." };
  }
}

export async function cancelGuardianSubscription(): Promise<{ error?: string }> {
  const { user, sub } = await getGuardianSubForCurrentUser();
  if (!user) return { error: "You must be signed in." };
  if (!sub?.stripeSubscriptionId) return { error: "Subscription not found." };
  try {
    const stripe = getStripeServer();
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    await prisma.guardianSubscription.update({
      where: { id: sub.id },
      data: { status: "cancelled", cancelledAt: new Date() },
    });
    revalidatePath("/dashboard/owner/giving");
    revalidatePath("/giving");
    return {};
  } catch (e) {
    console.error("cancelGuardianSubscription", e);
    return { error: e instanceof Error ? e.message : "Failed to cancel." };
  }
}

export async function getGuardianSubscription(userId: string): Promise<GuardianSubscriptionDetails | null> {
  const row = await prisma.guardianSubscription.findUnique({
    where: { userId },
  });
  if (!row) return null;
  return { ...row };
}
