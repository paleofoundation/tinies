"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  createConnectExpressAccount,
  createConnectAccountLink,
  getStripeServer,
} from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import BookingAcceptedEmail from "@/lib/email/templates/booking-accepted";
import BookingDeclinedEmail from "@/lib/email/templates/booking-declined";
import BookingExpiredEmail from "@/lib/email/templates/booking-expired";
import { sendSMS, buildBookingAcceptedSMS } from "@/lib/sms";
import { DonationSource } from "@prisma/client";

const PENDING_RESPONSE_HOURS = 4;
/** 10% of commission goes to Giving Fund (platform_commission donation). */
const GIVING_COMMISSION_RATE = 0.1;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const DASHBOARD_RETURN = `${APP_URL}/dashboard/provider`;
const DASHBOARD_REFRESH = `${APP_URL}/dashboard/provider?refresh=stripe`;

export type ProviderStripeStatus = {
  hasProfile: boolean;
  hasStripeConnect: boolean;
};

/** Get current user's provider profile and Stripe Connect status. */
export async function getProviderStripeStatus(): Promise<ProviderStripeStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { hasProfile: false, hasStripeConnect: false };

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { stripeConnectAccountId: true },
  });
  if (!profile)
    return { hasProfile: false, hasStripeConnect: false };
  return {
    hasProfile: true,
    hasStripeConnect: Boolean(profile.stripeConnectAccountId),
  };
}

export type CreateStripeConnectOnboardingResult = {
  url?: string;
  error?: string;
};

/** Create or reuse Stripe Connect account and return onboarding link. Redirect user to returned url. */
export async function createStripeConnectOnboardingLink(): Promise<CreateStripeConnectOnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { error: "You must be signed in to set up payouts." };

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, stripeConnectAccountId: true },
  });
  if (!profile)
    return { error: "Complete your provider profile first, then set up payouts." };

  if (profile.stripeConnectAccountId) {
    const link = await createConnectAccountLink({
      accountId: profile.stripeConnectAccountId,
      returnUrl: DASHBOARD_RETURN,
      refreshUrl: DASHBOARD_REFRESH,
      type: "account_update",
    });
    return { url: link.url };
  }

  try {
    const { accountId } = await createConnectExpressAccount({
      email: user.email ?? undefined,
      country: "CY",
    });
    await prisma.providerProfile.update({
      where: { id: profile.id },
      data: { stripeConnectAccountId: accountId },
    });
    const { url } = await createConnectAccountLink({
      accountId,
      returnUrl: DASHBOARD_RETURN,
      refreshUrl: DASHBOARD_REFRESH,
    });
    return { url };
  } catch (e) {
    console.error("Stripe Connect onboarding error", e);
    const message =
      e instanceof Error ? e.message : "Failed to create payout account.";
    return { error: message };
  }
}

// ---------------------------------------------------------------------------
// Provider booking management (Phase 1.4)
// ---------------------------------------------------------------------------

export type ProviderBookingCard = {
  id: string;
  ownerName: string;
  petNames: string[];
  serviceType: string;
  startDatetime: Date;
  endDatetime: Date;
  totalPriceCents: number;
  specialInstructions: string | null;
  status: string;
  createdAt: Date;
  stripePaymentIntentId: string | null;
  walkStartedAt: Date | null;
  walkEndedAt: Date | null;
  walkRoute: { lat: number; lng: number; timestamp: number }[] | null;
  walkDistanceKm: number | null;
  walkDurationMinutes: number | null;
  walkSummaryMapUrl: string | null;
  hasDispute: boolean;
  hasGuaranteeClaim: boolean;
};

export async function getProviderBookings(): Promise<{
  bookings: ProviderBookingCard[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { bookings: [], error: "Not signed in." };
  try {
    const rows = await prisma.booking.findMany({
      where: { providerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { name: true } },
      },
    });
    const allPetIds = rows.flatMap((r) => r.petIds);
    const uniquePetIds = [...new Set(allPetIds)];
    const pets =
      uniquePetIds.length > 0
        ? await prisma.pet.findMany({
            where: { id: { in: uniquePetIds } },
            select: { id: true, name: true },
          })
        : [];
    const petNameById = new Map(pets.map((p) => [p.id, p.name]));
    const bookings: ProviderBookingCard[] = rows.map((b) => {
      const route = b.walkRoute as { lat: number; lng: number; timestamp: number }[] | null;
      return {
        id: b.id,
        ownerName: b.owner.name,
        petNames: b.petIds.map((id) => petNameById.get(id) ?? "Pet"),
        serviceType: b.serviceType,
        startDatetime: b.startDatetime,
        endDatetime: b.endDatetime,
        totalPriceCents: b.totalPrice,
        specialInstructions: b.specialInstructions,
        status: b.status,
        createdAt: b.createdAt,
        stripePaymentIntentId: b.stripePaymentIntentId,
        walkStartedAt: b.walkStartedAt,
        walkEndedAt: b.walkEndedAt,
        walkRoute: route,
        walkDistanceKm: b.walkDistanceKm,
        walkDurationMinutes: b.walkDurationMinutes,
        walkSummaryMapUrl: b.walkSummaryMapUrl,
        hasDispute: b.hasDispute,
        hasGuaranteeClaim: b.hasGuaranteeClaim,
      };
    });
    return { bookings };
  } catch (e) {
    console.error("getProviderBookings", e);
    return { bookings: [], error: "Failed to load bookings." };
  }
}

export async function acceptBooking(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, providerId: user.id, status: "pending" },
    select: { id: true, stripePaymentIntentId: true, commissionAmount: true },
  });
  if (!booking) return { error: "Booking not found or not pending." };
  if (!booking.stripePaymentIntentId) return { error: "No payment intent for this booking." };
  try {
    const stripe = getStripeServer();
    await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "accepted" },
    });
    // Platform 10% commission allocation to Giving Fund
    const givingCents = Math.round(booking.commissionAmount * GIVING_COMMISSION_RATE);
    if (givingCents > 0) {
      await prisma.donation.create({
        data: {
          source: DonationSource.platform_commission,
          amount: givingCents,
          bookingId: booking.id,
        },
      });
    }
    try {
      const full = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          owner: { select: { email: true, phone: true, phoneVerified: true } },
          provider: { select: { name: true } },
        },
      });
      const petIds = full?.petIds ?? [];
      const pets =
        petIds.length > 0
          ? await prisma.pet.findMany({
              where: { id: { in: petIds } },
              select: { name: true },
            })
          : [];
      const petName = pets.map((p) => p.name).join(", ") || "your pet";
      const dateStr = full?.startDatetime
        ? new Date(full.startDatetime).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";
      if (full?.owner?.email) {
        await sendEmail({
          to: full.owner.email,
          subject: `Booking confirmed with ${full.provider.name}`,
          react: BookingAcceptedEmail({
            providerName: full.provider.name,
            petName,
            date: dateStr,
          }),
        });
      }
      if (full?.owner?.phoneVerified && full?.owner?.phone) {
        await sendSMS({
          to: full.owner.phone,
          body: buildBookingAcceptedSMS({
            providerName: full.provider.name,
            date: dateStr,
          }),
        });
      }
    } catch (notifyErr) {
      console.error("acceptBooking: notify (email/SMS) failed", notifyErr);
    }
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    console.error("acceptBooking", e);
    return {
      error: e instanceof Error ? e.message : "Failed to accept booking.",
    };
  }
}

export async function declineBooking(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, providerId: user.id, status: "pending" },
    select: { id: true, stripePaymentIntentId: true },
  });
  if (!booking) return { error: "Booking not found or not pending." };
  try {
    if (booking.stripePaymentIntentId) {
      try {
        const stripe = getStripeServer();
        await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
      } catch (stripeErr) {
        console.warn("declineBooking: Stripe cancel failed (may already be canceled)", stripeErr);
      }
    }
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "declined" },
    });
    try {
      const full = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          owner: { select: { email: true } },
          provider: { select: { name: true } },
        },
      });
      if (full?.owner?.email) {
        await sendEmail({
          to: full.owner.email,
          subject: `Booking update from ${full.provider.name}`,
          react: BookingDeclinedEmail({ providerName: full.provider.name }),
        });
      }
    } catch (emailErr) {
      console.error("declineBooking: email send failed", emailErr);
    }
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    console.error("declineBooking", e);
    return {
      error: e instanceof Error ? e.message : "Failed to decline booking.",
    };
  }
}

/** Find pending bookings older than 4 hours, cancel their PaymentIntents, set status to cancelled and cancelledBy to "system". Call on dashboard load. */
export async function expireStaleBookings(): Promise<{ expired: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { expired: 0 };
  const cutoff = new Date(Date.now() - PENDING_RESPONSE_HOURS * 60 * 60 * 1000);
  const stale = await prisma.booking.findMany({
    where: {
      providerId: user.id,
      status: "pending",
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      stripePaymentIntentId: true,
      owner: { select: { email: true } },
      provider: { select: { name: true } },
    },
  });
  const stripe = getStripeServer();
  let expired = 0;
  for (const b of stale) {
    try {
      if (b.stripePaymentIntentId) {
        try {
          await stripe.paymentIntents.cancel(b.stripePaymentIntentId);
        } catch (stripeErr) {
          console.warn("expireStaleBookings: Stripe cancel failed for", b.id, stripeErr);
        }
      }
      await prisma.booking.update({
        where: { id: b.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelledBy: "system",
        },
      });
      try {
        if (b.owner?.email) {
          await sendEmail({
            to: b.owner.email,
            subject: "Your booking request expired",
            react: BookingExpiredEmail({ providerName: b.provider.name }),
          });
        }
      } catch (emailErr) {
        console.error("expireStaleBookings: email send failed for", b.id, emailErr);
      }
      expired++;
    } catch (e) {
      console.error("expireStaleBookings booking", b.id, e);
    }
  }
  if (expired > 0) revalidatePath("/dashboard/provider");
  return { expired };
}

// ---------------------------------------------------------------------------
// Review responses (Phase 2.2)
// ---------------------------------------------------------------------------

export type ProviderReviewForDashboard = {
  id: string;
  reviewerName: string;
  rating: number;
  text: string;
  createdAt: Date;
  providerResponse: string | null;
  responseAt: Date | null;
};

/** Get current provider's reviews (for dashboard). */
export async function getProviderReviews(): Promise<{
  reviews: ProviderReviewForDashboard[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { reviews: [], error: "Not signed in." };
  try {
    const rows = await prisma.review.findMany({
      where: { providerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { reviewer: { select: { name: true } } },
    });
    return {
      reviews: rows.map((r) => ({
        id: r.id,
        reviewerName: r.reviewer.name,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        providerResponse: r.providerResponse,
        responseAt: r.responseAt,
      })),
    };
  } catch (e) {
    console.error("getProviderReviews", e);
    return { reviews: [], error: "Failed to load reviews." };
  }
}

export async function respondToReview({
  reviewId,
  response,
}: {
  reviewId: string;
  response: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to respond." };
  const text = response?.trim() ?? "";
  if (!text) return { error: "Response text is required." };

  const review = await prisma.review.findFirst({
    where: { id: reviewId, providerId: user.id },
    select: { id: true, providerResponse: true },
  });
  if (!review) return { error: "Review not found or you are not the provider." };
  if (review.providerResponse != null) return { error: "You have already responded to this review." };

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { providerResponse: text, responseAt: new Date() },
    });
    revalidatePath("/dashboard/provider");
    revalidatePath("/services/provider");
    return {};
  } catch (e) {
    console.error("respondToReview", e);
    return { error: e instanceof Error ? e.message : "Failed to save response." };
  }
}

// ---------------------------------------------------------------------------
// GPS Walk tracking (Phase 5.2)
// ---------------------------------------------------------------------------

export async function startWalk(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      providerId: user.id,
      status: "accepted",
      serviceType: "walking",
    },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found or not a walking booking." };
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "active",
        walkStartedAt: new Date(),
        walkRoute: [],
      },
    });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    console.error("startWalk", e);
    return { error: e instanceof Error ? e.message : "Failed to start walk." };
  }
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildStaticMapUrl(
  points: { lat: number; lng: number }[],
  apiKey: string
): string {
  if (points.length === 0) return "";
  const maxPoints = 80;
  const step = Math.max(1, Math.floor(points.length / maxPoints));
  const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);
  const pathSegment = sampled.map((p) => `${p.lat},${p.lng}`).join("|");
  const encoded = encodeURIComponent(`color:0x2D6A4F|weight:5|${pathSegment}`);
  return `https://maps.googleapis.com/maps/api/staticmap?size=600x400&path=${encoded}&key=${apiKey}`;
}

export async function endWalk(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      providerId: user.id,
      status: "active",
      serviceType: "walking",
      walkStartedAt: { not: null },
    },
    select: {
      id: true,
      walkStartedAt: true,
      walkRoute: true,
    },
  });
  if (!booking || !booking.walkStartedAt)
    return { error: "Walk not found or not in progress." };

  const route = (booking.walkRoute ?? []) as { lat: number; lng: number; timestamp: number }[];
  const now = new Date();
  const durationMs = now.getTime() - new Date(booking.walkStartedAt).getTime();
  const durationMinutes = Math.round(durationMs / (60 * 1000));

  let distanceKm = 0;
  for (let i = 1; i < route.length; i++) {
    distanceKm += haversineKm(
      route[i - 1].lat,
      route[i - 1].lng,
      route[i].lat,
      route[i].lng
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const points = route.map((p) => ({ lat: p.lat, lng: p.lng }));
  const walkSummaryMapUrl = apiKey && points.length > 0 ? buildStaticMapUrl(points, apiKey) : null;

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "completed",
        walkEndedAt: now,
        walkDistanceKm: Math.round(distanceKm * 1000) / 1000,
        walkDurationMinutes: durationMinutes,
        walkSummaryMapUrl,
      },
    });
    revalidatePath("/dashboard/provider");
    revalidatePath("/dashboard/owner");
    return {};
  } catch (e) {
    console.error("endWalk", e);
    return { error: e instanceof Error ? e.message : "Failed to end walk." };
  }
}
