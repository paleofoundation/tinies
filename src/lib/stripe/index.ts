/**
 * Stripe client, webhook helpers, and Connect for provider payouts.
 * - Server: use getStripeServer() in Server Actions and API routes.
 * - Client: use loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) for Payment Element etc.
 * Webhook route: app/api/webhooks/stripe/route.ts
 */

import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.warn("STRIPE_SECRET_KEY is not set; Stripe server API will throw when used.");
}

/** Server-side Stripe client. Use in Server Actions and API route handlers only. */
export function getStripeServer(): Stripe {
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(secret, { typescript: true });
}

/** Create a Stripe Connect Express account for a provider. Returns the account id. */
export async function createConnectExpressAccount(params: {
  email: string;
  businessType?: "individual" | "company";
  country?: string;
}): Promise<{ accountId: string }> {
  const stripe = getStripeServer();
  const account = await stripe.accounts.create({
    type: "express",
    email: params.email,
    country: params.country ?? "CY",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  return { accountId: account.id };
}

/** Create a one-time Account Link for Connect onboarding or account update. Redirect the user to the returned url. */
export async function createConnectAccountLink(params: {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
  type?: "account_onboarding" | "account_update";
}): Promise<{ url: string }> {
  const stripe = getStripeServer();
  const link = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: params.type ?? "account_onboarding",
  });
  return { url: link.url };
}

/** Verify webhook signature and construct event. Use in API route with raw body string and Stripe-Signature header. */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string | null,
  webhookSecret: string
): Stripe.Event {
  if (!signature) throw new Error("Missing Stripe-Signature header");
  return getStripeServer().webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  ) as Stripe.Event;
}
