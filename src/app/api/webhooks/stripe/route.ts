import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent } from "@/lib/stripe";
import { DonationSource } from "@prisma/client";

const HANDLED_TYPES = [
  "payment_intent.succeeded",
  "payment_intent.canceled",
  "charge.refunded",
] as const;

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let payload: string;
  try {
    payload = await request.text();
  } catch (e) {
    console.error("Stripe webhook: failed to read body", e);
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  const signature = request.headers.get("stripe-signature") ?? null;
  let event: ReturnType<typeof constructWebhookEvent>;
  try {
    event = constructWebhookEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!HANDLED_TYPES.includes(event.type as (typeof HANDLED_TYPES)[number])) {
    return NextResponse.json({ received: true });
  }

  try {
    const existing = await prisma.processedWebhookEvent.findUnique({
      where: { stripeEventId: event.id },
    });
    if (existing) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }
  } catch (e) {
    console.error("Stripe webhook: failed to check processed events", e);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as {
          id: string;
          metadata?: { type?: string; userId?: string; charityId?: string; amountCents?: string; showOnLeaderboard?: string };
        };
        const type = pi.metadata?.type;
        const showOnLeaderboard = pi.metadata?.showOnLeaderboard === "1";
        if (type === "signup_donation") {
          const userId = pi.metadata?.userId ?? "";
          const charityId = pi.metadata?.charityId || null;
          const amountCents = parseInt(pi.metadata?.amountCents ?? "0", 10);
          if (userId && amountCents > 0) {
            await prisma.donation.create({
              data: {
                userId,
                charityId: charityId || undefined,
                source: DonationSource.signup,
                amount: amountCents,
                stripePaymentIntentId: pi.id,
              },
            });
            await prisma.userGivingPreference.upsert({
              where: { userId },
              create: { userId, showOnLeaderboard },
              update: { showOnLeaderboard },
            });
          }
        }
        if (type === "one_time_donation" || type === "quick_donation") {
          const userId = pi.metadata?.userId ?? "";
          const charityId = pi.metadata?.charityId || null;
          const amountCents = parseInt(pi.metadata?.amountCents ?? "0", 10);
          if (amountCents > 0) {
            await prisma.donation.create({
              data: {
                userId: userId || undefined,
                charityId: charityId || null,
                source: DonationSource.one_time,
                amount: amountCents,
                stripePaymentIntentId: pi.id,
              },
            });
            if (userId) {
              await prisma.userGivingPreference.upsert({
                where: { userId },
                create: { userId, showOnLeaderboard },
                update: { showOnLeaderboard },
              });
            }
          }
        }
        // Booking capture is done in acceptBooking server action; no webhook update needed
        break;
      }
      case "payment_intent.canceled": {
        // Phase 1.3/1.4: booking expired or declined, refund
        const pi = event.data.object as { id: string };
        void pi;
        break;
      }
      case "charge.refunded": {
        // Refund processed (full or partial)
        const charge = event.data.object as { id: string };
        void charge;
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook: handler error for", event.type, e);
    return NextResponse.json(
      { error: "Handler error" },
      { status: 500 }
    );
  }

  try {
    await prisma.processedWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        processedAt: new Date(),
      },
    });
  } catch (e) {
    console.error("Stripe webhook: failed to record processed event", e);
    return NextResponse.json(
      { error: "Failed to record event" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
