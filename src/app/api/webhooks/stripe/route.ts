import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent, getStripeServer } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import ProviderIdentityVerifiedEmail from "@/lib/email/templates/provider-identity-verified";
import PayoutProcessedEmail from "@/lib/email/templates/payout-processed";
import TipReceivedEmail from "@/lib/email/templates/tip-received";
import { DonationSource } from "@prisma/client";
import { recordRoundUpDonation } from "@/lib/giving/roundup-donation";
import {
  upsertGuardianFromCheckoutSession,
  recordGuardianDonation,
  syncGuardianSubscriptionFromStripe,
  TINIES_GUARDIAN_CHECKOUT_TYPE,
  guardianTierFromAmountCents,
} from "@/lib/giving/guardian-stripe";
import { recordSignupDonationIfNew } from "@/lib/giving/signup-donation-webhook";
import {
  notifyGuardianSubscriptionStarted,
  notifyGuardianInvoicePaid,
} from "@/lib/notifications/guardian-notifications";
import type { GuardianTier } from "@prisma/client";
import { recordCampaignDonationIfNew } from "@/lib/campaign/record-campaign-donation";

const HANDLED_TYPES = [
  "payment_intent.succeeded",
  "payment_intent.canceled",
  "charge.refunded",
  "transfer.created",
  "identity.verification_session.verified",
  "identity.verification_session.requires_input",
  "checkout.session.completed",
  "invoice.paid",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

function parseGuardianTier(v: string | undefined): GuardianTier | null {
  if (v === "friend" || v === "guardian" || v === "champion" || v === "custom") return v;
  return null;
}

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
          metadata?: {
            type?: string;
            userId?: string;
            charityId?: string;
            amountCents?: string;
            showOnLeaderboard?: string;
            bookingId?: string;
            roundUpCents?: string;
            ownerId?: string;
            campaignId?: string;
            anonymous?: string;
            donorDisplayName?: string;
            donorMessage?: string;
          };
        };
        const type = pi.metadata?.type;
        const showOnLeaderboard = pi.metadata?.showOnLeaderboard === "1";
        if (type === "signup_donation") {
          const userId = pi.metadata?.userId ?? "";
          const charityId = pi.metadata?.charityId || null;
          const amountCents = parseInt(pi.metadata?.amountCents ?? "0", 10);
          if (userId && amountCents > 0) {
            await recordSignupDonationIfNew({
              userId,
              charityId: charityId && charityId.length > 0 ? charityId : null,
              amountCents,
              stripePaymentIntentId: pi.id,
              showOnLeaderboard,
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
        if (type === "campaign_donation") {
          const campaignId = pi.metadata?.campaignId ?? "";
          const amountCents =
            typeof pi.amount === "number" && pi.amount > 0
              ? pi.amount
              : parseInt(pi.metadata?.amountCents ?? "0", 10);
          const userId = pi.metadata?.userId ?? "";
          const charityId = pi.metadata?.charityId && pi.metadata.charityId.length > 0 ? pi.metadata.charityId : null;
          const anonymous = pi.metadata?.anonymous === "1";
          const donorDisplay = (pi.metadata?.donorDisplayName ?? "").trim();
          const donorName = anonymous || !donorDisplay ? "Anonymous" : donorDisplay.slice(0, 120);
          const donorMessage = pi.metadata?.donorMessage?.trim()
            ? pi.metadata.donorMessage.trim().slice(0, 2000)
            : null;
          if (campaignId && amountCents >= 100) {
            await recordCampaignDonationIfNew({
              campaignId,
              paymentIntentId: pi.id,
              amountCents,
              userId: userId || null,
              charityId,
              donorName,
              message: donorMessage,
            });
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
        {
          const bookingId = pi.metadata?.bookingId;
          const roundUpCents = parseInt(String(pi.metadata?.roundUpCents ?? "0"), 10);
          const isBookingPi =
            type === "booking" ||
            (Boolean(bookingId) && pi.metadata?.roundUpCents != null && type !== "booking_tip" && type !== "signup_donation" && type !== "one_time_donation" && type !== "quick_donation");
          if (isBookingPi && bookingId && roundUpCents > 0) {
            let ownerId = pi.metadata?.ownerId ?? "";
            if (!ownerId) {
              const b = await prisma.booking.findUnique({
                where: { id: bookingId },
                select: { ownerId: true },
              });
              ownerId = b?.ownerId ?? "";
            }
            if (ownerId) {
              await recordRoundUpDonation({
                userId: ownerId,
                bookingId,
                roundUpAmountCents: roundUpCents,
                stripePaymentIntentId: pi.id,
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
      case "checkout.session.completed": {
        const session = event.data.object as {
          id?: string;
          mode?: string;
          payment_status?: string;
          amount_total?: number | null;
          payment_intent?: string | { id?: string } | null;
          metadata?: Record<string, string>;
          subscription?: string | { id?: string } | null;
          customer?: string | { id?: string } | null;
          client_reference_id?: string | null;
        };
        const meta = session.metadata ?? {};
        if (session.mode === "payment" && meta.type === "signup_donation") {
          const userId = meta.userId || session.client_reference_id || "";
          const charityId = meta.charityId && meta.charityId.length > 0 ? meta.charityId : null;
          const amountCents =
            typeof session.amount_total === "number" && session.amount_total > 0
              ? session.amount_total
              : parseInt(meta.amountCents ?? "0", 10);
          const piRaw = session.payment_intent;
          const piId =
            typeof piRaw === "string"
              ? piRaw
              : piRaw && typeof piRaw === "object"
                ? piRaw.id ?? ""
                : "";
          const showOnLeaderboard = meta.showOnLeaderboard === "1";
          if (
            userId &&
            amountCents >= 100 &&
            piId &&
            session.payment_status === "paid"
          ) {
            await recordSignupDonationIfNew({
              userId,
              charityId,
              amountCents,
              stripePaymentIntentId: piId,
              showOnLeaderboard,
            });
          }
          break;
        }
        if (session.mode === "payment" && meta.type === "campaign_donation") {
          const campaignId = meta.campaignId ?? "";
          const amountCents =
            typeof session.amount_total === "number" && session.amount_total > 0
              ? session.amount_total
              : parseInt(meta.amountCents ?? "0", 10);
          const piRaw = session.payment_intent;
          const piId =
            typeof piRaw === "string"
              ? piRaw
              : piRaw && typeof piRaw === "object"
                ? piRaw.id ?? ""
                : "";
          const userId = meta.userId || session.client_reference_id || "";
          const charityId = meta.charityId && meta.charityId.length > 0 ? meta.charityId : null;
          const anonymous = meta.anonymous === "1";
          const donorDisplay = (meta.donorDisplayName ?? "").trim();
          const donorName = anonymous || !donorDisplay ? "Anonymous" : donorDisplay.slice(0, 120);
          const donorMessage = meta.donorMessage?.trim() ? meta.donorMessage.trim().slice(0, 2000) : null;
          if (
            campaignId &&
            amountCents >= 100 &&
            piId &&
            session.payment_status === "paid"
          ) {
            await recordCampaignDonationIfNew({
              campaignId,
              paymentIntentId: piId,
              amountCents,
              userId: userId || null,
              charityId,
              donorName,
              message: donorMessage,
            });
          }
          break;
        }
        if (session.mode !== "subscription") break;
        if (meta.checkout_type !== TINIES_GUARDIAN_CHECKOUT_TYPE) break;
        const userId = meta.userId || session.client_reference_id || "";
        if (!userId) break;
        const subRaw = session.subscription;
        const stripeSubId =
          typeof subRaw === "string" ? subRaw : subRaw && typeof subRaw === "object" ? subRaw.id ?? "" : "";
        if (!stripeSubId) break;
        const custRaw = session.customer;
        const customerId =
          typeof custRaw === "string" ? custRaw : custRaw && typeof custRaw === "object" ? custRaw.id ?? "" : "";
        if (!customerId) break;
        const amountMonthlyCents = parseInt(meta.amountMonthlyCents ?? "0", 10);
        if (amountMonthlyCents < 100) break;
        const tier =
          parseGuardianTier(meta.tier) ?? guardianTierFromAmountCents(amountMonthlyCents);
        const charityId = meta.charityId && meta.charityId.length > 0 ? meta.charityId : null;
        const showOnLeaderboard = meta.showOnLeaderboard === "1";
        await upsertGuardianFromCheckoutSession({
          userId,
          charityId,
          stripeSubscriptionId: stripeSubId,
          stripeCustomerId: customerId,
          amountMonthlyCents,
          tier,
          showOnLeaderboard,
        });
        try {
          await notifyGuardianSubscriptionStarted({
            userId,
            amountMonthlyCents,
          });
        } catch (welcomeErr) {
          console.error("Stripe webhook: Guardian welcome email failed", welcomeErr);
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as {
          id: string;
          amount_paid: number;
          billing_reason?: string | null;
          period_end?: number;
          subscription?: string | { id?: string } | null;
        };
        if (!invoice.amount_paid || invoice.amount_paid <= 0) break;
        const subField = invoice.subscription;
        const stripeSubId =
          typeof subField === "string"
            ? subField
            : subField && typeof subField === "object"
              ? subField.id ?? ""
              : "";
        if (!stripeSubId) break;
        const stripe = getStripeServer();
        const sub = await stripe.subscriptions.retrieve(stripeSubId);
        const meta = sub.metadata ?? {};
        const userId = meta.userId;
        if (!userId) break;
        if (meta.checkout_type !== TINIES_GUARDIAN_CHECKOUT_TYPE && !parseGuardianTier(meta.tier)) break;
        const charityId = meta.charityId && meta.charityId.length > 0 ? meta.charityId : null;
        await recordGuardianDonation({
          userId,
          charityId,
          amountCents: invoice.amount_paid,
          stripeInvoiceId: invoice.id,
        });
        if (invoice.billing_reason === "subscription_cycle") {
          try {
            const monthLabel = invoice.period_end
              ? new Date(invoice.period_end * 1000).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })
              : new Date().toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                });
            await notifyGuardianInvoicePaid({
              userId,
              amountCents: invoice.amount_paid,
              monthLabel,
            });
          } catch (monthErr) {
            console.error("Stripe webhook: Guardian monthly email failed", monthErr);
          }
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as {
          id: string;
          status: string;
          pause_collection?: { behavior?: string } | null;
        };
        if (sub.status === "canceled" || sub.status === "unpaid" || sub.status === "incomplete_expired") {
          await syncGuardianSubscriptionFromStripe({
            stripeSubscriptionId: sub.id,
            status: "cancelled",
          });
        } else if (sub.pause_collection?.behavior) {
          await syncGuardianSubscriptionFromStripe({
            stripeSubscriptionId: sub.id,
            status: "paused",
          });
        } else if (sub.status === "active") {
          await syncGuardianSubscriptionFromStripe({
            stripeSubscriptionId: sub.id,
            status: "active",
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as { id: string };
        await syncGuardianSubscriptionFromStripe({
          stripeSubscriptionId: sub.id,
          status: "cancelled",
        });
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
