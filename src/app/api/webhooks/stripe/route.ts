import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import ProviderIdentityVerifiedEmail from "@/lib/email/templates/provider-identity-verified";
import PayoutProcessedEmail from "@/lib/email/templates/payout-processed";
import TipReceivedEmail from "@/lib/email/templates/tip-received";
import { DonationSource } from "@prisma/client";

const HANDLED_TYPES = [
  "payment_intent.succeeded",
  "payment_intent.canceled",
  "charge.refunded",
  "transfer.created",
  "identity.verification_session.verified",
  "identity.verification_session.requires_input",
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
          amount: number;
          metadata?: { type?: string; userId?: string; charityId?: string; amountCents?: string; showOnLeaderboard?: string; bookingId?: string };
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
        if (type === "booking_tip") {
          const bookingId = pi.metadata?.bookingId;
          const amountCents = pi.amount;
          if (bookingId && amountCents > 0) {
            await prisma.booking.update({
              where: { id: bookingId },
              data: { tipAmount: amountCents, tipStripePaymentIntentId: pi.id },
            });
            const booking = await prisma.booking.findUnique({
              where: { id: bookingId },
              include: { provider: { select: { email: true } } },
            });
            if (booking?.provider?.email) {
              const amountEur = (amountCents / 100).toFixed(2);
              await sendEmail({
                to: booking.provider.email,
                subject: `You received a €${amountEur} tip!`,
                react: TipReceivedEmail({ amountEur }),
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
      case "transfer.created": {
        const transfer = event.data.object as { id: string; amount: number; destination?: string };
        const destination = transfer.destination;
        if (destination && transfer.amount > 0) {
          try {
            const profile = await prisma.providerProfile.findFirst({
              where: { stripeConnectAccountId: destination },
              include: { user: { select: { email: true } } },
            });
            if (profile?.user?.email) {
              const amountEur = (transfer.amount / 100).toFixed(2);
              await sendEmail({
                to: profile.user.email,
                subject: `Your payout of EUR ${amountEur} has been sent`,
                react: PayoutProcessedEmail({ amountEur }),
              });
            }
          } catch (e) {
            console.error("Stripe webhook: payout email failed", e);
          }
        }
        break;
      }
      case "identity.verification_session.verified": {
        const session = event.data.object as { id: string; metadata?: { provider_profile_id?: string } };
        const profileId = session.metadata?.provider_profile_id;
        if (profileId) {
          const profile = await prisma.providerProfile.findUnique({
            where: { id: profileId },
            include: { user: { select: { email: true, name: true } } },
          });
          if (profile) {
            await prisma.providerProfile.update({
              where: { id: profileId },
              data: { verified: true, verifiedAt: new Date() },
            });
            if (profile.user?.email) {
              await sendEmail({
                to: profile.user.email,
                subject: "Your identity has been verified!",
                react: ProviderIdentityVerifiedEmail({
                  providerName: profile.user.name || "there",
                }),
              });
            }
          }
        }
        break;
      }
      case "identity.verification_session.requires_input": {
        // Verification failed or needs more info — leave verified=false so provider appears in admin queue for manual review
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
