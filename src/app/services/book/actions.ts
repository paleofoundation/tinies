"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getStripeServer } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import BookingRequestEmail from "@/lib/email/templates/booking-request";
import { sendSMS, buildBookingRequestSMS } from "@/lib/sms";
import type { ServiceType } from "@prisma/client";
import { recordRoundUpDonation } from "@/lib/giving/actions";
import type { GivingTier } from "@/lib/utils/giving-helpers";
import {
  computeBookingTotalCents,
  computeRoundUpCents,
} from "@/lib/booking-utils";
import { getServiceConfig } from "@/lib/utils/booking-helpers";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

const COMMISSION_RATE = 0.12;

export type ServiceOffer = {
  type: string;
  base_price: number;
  additional_pet_price: number;
  price_unit: string;
  max_pets: number;
};

export type ProviderForBooking = {
  slug: string;
  providerName: string;
  providerId: string;
  services: ServiceOffer[];
  cancellationPolicy: string;
  avgRating: number | null;
  reviewCount: number;
  repeatClientCount: number;
  serviceAreaLat: number | null;
  serviceAreaLng: number | null;
  serviceAreaRadiusKm: number | null;
  bio: string | null;
  homeType: string | null;
  hasYard: boolean | null;
  yardFenced: boolean | null;
  smokingHome: boolean | null;
  petsInHome: string | null;
  childrenInHome: string | null;
  dogsOnFurniture: boolean | null;
  pottyBreakFrequency: string | null;
  typicalDay: string | null;
  infoWantedAboutPet: string | null;
  confirmedHolidays: string[];
};

/** Get provider by slug for the booking page. Returns null if not found. */
export async function getProviderBySlug(
  slug: string
): Promise<ProviderForBooking | null> {
  const profile = await prisma.providerProfile.findUnique({
    where: { slug },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return null;
  const raw = profile.servicesOffered as unknown;
  const services: ServiceOffer[] = Array.isArray(raw)
    ? raw.map((s: Record<string, unknown>) => ({
        type: String(s.type ?? ""),
        base_price: Number(s.base_price) || 0,
        additional_pet_price: Number(s.additional_pet_price) || 0,
        price_unit: String(s.price_unit ?? "per_walk"),
        max_pets: Number(s.max_pets) || 2,
      }))
    : [];
  return {
    slug: profile.slug,
    providerName: profile.user.name,
    providerId: profile.userId,
    services,
    cancellationPolicy: profile.cancellationPolicy,
    avgRating: profile.avgRating,
    reviewCount: profile.reviewCount,
    repeatClientCount: profile.repeatClientCount,
    serviceAreaLat: profile.serviceAreaLat,
    serviceAreaLng: profile.serviceAreaLng,
    serviceAreaRadiusKm: profile.serviceAreaRadiusKm,
    bio: profile.bio,
    homeType: profile.homeType,
    hasYard: profile.hasYard,
    yardFenced: profile.yardFenced,
    smokingHome: profile.smokingHome,
    petsInHome: profile.petsInHome,
    childrenInHome: profile.childrenInHome,
    dogsOnFurniture: profile.dogsOnFurniture,
    pottyBreakFrequency: profile.pottyBreakFrequency,
    typicalDay: profile.typicalDay,
    infoWantedAboutPet: profile.infoWantedAboutPet,
    confirmedHolidays: profile.confirmedHolidays,
  };
}

export type ProviderReviewPublic = {
  id: string;
  reviewerName: string;
  reviewerId: string;
  reviewerGivingTier: GivingTier;
  rating: number;
  text: string;
  photos: string[];
  createdAt: Date;
  providerResponse: string | null;
  responseAt: Date | null;
};

/** Get reviews for a provider by slug (for public profile page). */
export async function getProviderReviewsBySlug(
  slug: string
): Promise<ProviderReviewPublic[]> {
  const { computeGivingTier } = await import("@/lib/giving/actions");
  const profile = await prisma.providerProfile.findUnique({
    where: { slug },
    select: { userId: true },
  });
  if (!profile) return [];
  const reviews = await prisma.review.findMany({
    where: { providerId: profile.userId },
    orderBy: { createdAt: "desc" },
    include: { reviewer: { select: { id: true, name: true } } },
  });
  const tiers = new Map<string, GivingTier>();
  for (const r of reviews) {
    if (!tiers.has(r.reviewer.id)) {
      tiers.set(r.reviewer.id, await computeGivingTier(r.reviewer.id));
    }
  }
  return reviews.map((r) => ({
    id: r.id,
    reviewerName: r.reviewer.name,
    reviewerId: r.reviewer.id,
    reviewerGivingTier: tiers.get(r.reviewer.id) ?? null,
    rating: r.rating,
    text: r.text,
    photos: r.photos,
    createdAt: r.createdAt,
    providerResponse: r.providerResponse,
    responseAt: r.responseAt,
  }));
}

export type CreateBookingWithPaymentIntentInput = {
  providerSlug: string;
  serviceType: ServiceType;
  startDatetime: string; // ISO
  endDatetime: string; // ISO
  petIds: string[];
  specialInstructions?: string;
  roundUpEnabled: boolean;
  /** For drop_in: visits per day (multiplies total by days × visitsPerDay). */
  visitsPerDay?: number;
};

export type CreateBookingWithPaymentIntentResult = {
  clientSecret?: string;
  bookingId?: string;
  error?: string;
};

async function ensureOwnerInPrisma(userId: string, email: string, name: string) {
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      name: name || email || "Owner",
      passwordHash: "supabase-auth-placeholder",
      role: "owner",
    },
    update: {},
  });
}

export async function createBookingWithPaymentIntent(
  input: CreateBookingWithPaymentIntentInput
): Promise<CreateBookingWithPaymentIntentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to book." };

  await ensureOwnerInPrisma(
    user.id,
    user.email ?? "",
    (user.user_metadata?.name as string) ?? user.email ?? "Owner"
  );

  const provider = await getProviderBySlug(input.providerSlug);
  if (!provider) return { error: "Provider not found." };

  const serviceConfig = getServiceConfig(provider, input.serviceType);
  if (!serviceConfig)
    return { error: "This provider does not offer the selected service." };

  const petCount = input.petIds.length;
  if (petCount < 1) return { error: "Select at least one pet." };
  if (serviceConfig.max_pets != null && petCount > serviceConfig.max_pets)
    return {
      error: `This provider accepts up to ${serviceConfig.max_pets} pets for this service.`,
    };

  /** base_price and additional_pet_price from DB are in cents; computeBookingTotalCents expects EUR. */
  let totalCents = computeBookingTotalCents(
    serviceConfig.base_price / 100,
    serviceConfig.additional_pet_price / 100,
    petCount
  );
  const start = new Date(input.startDatetime);
  const end = new Date(input.endDatetime);
  if (input.serviceType === "drop_in" && (input.visitsPerDay ?? 0) > 0) {
    const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
    totalCents = totalCents * numDays * (input.visitsPerDay ?? 1);
  }
  if (totalCents <= 0) return { error: "Invalid price." };

  const roundUpCents = input.roundUpEnabled ? computeRoundUpCents(totalCents) : 0;
  const chargeCents = totalCents + roundUpCents;
  const commissionAmount = Math.round(totalCents * COMMISSION_RATE);

  try {
    const booking = await prisma.booking.create({
      data: {
        ownerId: user.id,
        providerId: provider.providerId,
        petIds: input.petIds,
        serviceType: input.serviceType,
        startDatetime: new Date(input.startDatetime),
        endDatetime: new Date(input.endDatetime),
        specialInstructions: input.specialInstructions?.trim() || null,
        status: "pending",
        totalPrice: totalCents,
        commissionAmount,
        priceBreakdown: {
          basePriceCents: serviceConfig.base_price,
          additionalPetPriceCents: serviceConfig.additional_pet_price,
          petCount,
        },
      },
    });

    const stripe = getStripeServer();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: chargeCents,
      currency: "eur",
      capture_method: "manual",
      metadata: {
        bookingId: booking.id,
        roundUpCents: String(roundUpCents),
      },
      automatic_payment_methods: { enabled: true },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    const recentMeet = await prisma.meetAndGreet.findFirst({
      where: {
        ownerId: user.id,
        providerId: provider.providerId,
        ledToBooking: false,
        status: { in: ["confirmed", "completed"] },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (recentMeet) {
      await prisma.meetAndGreet.update({
        where: { id: recentMeet.id },
        data: { ledToBooking: true, bookingId: booking.id },
      });
    }

    if (roundUpCents > 0) {
      await recordRoundUpDonation({
        userId: user.id,
        bookingId: booking.id,
        roundUpAmountCents: roundUpCents,
        stripePaymentIntentId: paymentIntent.id,
      });
    }

    try {
      const providerUser = await prisma.user.findUnique({
        where: { id: provider.providerId },
        select: { email: true, phone: true, phoneVerified: true },
      });
      const pets = await prisma.pet.findMany({
        where: { id: { in: input.petIds } },
        select: { name: true, species: true },
      });
      const serviceLabel =
        SERVICE_TYPE_LABELS[input.serviceType] ?? input.serviceType;
      const dateStr = start.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const ownerName = (user.user_metadata?.name as string) ?? "A pet owner";
      const firstPet = pets[0];
      if (providerUser?.email) {
        await sendEmail({
          to: providerUser.email,
          subject: `New booking request from ${ownerName}`,
          react: BookingRequestEmail({
            ownerName,
            serviceType: serviceLabel,
            date: dateStr,
            petName: firstPet?.name ?? "Pet",
            species: firstPet?.species ?? "pet",
          }),
        });
      }
      if (providerUser?.phoneVerified && providerUser?.phone) {
        await sendSMS({
          to: providerUser.phone,
          body: buildBookingRequestSMS({
            ownerName,
            serviceType: serviceLabel,
            date: dateStr,
          }),
        });
      }
    } catch (notifyErr) {
      console.error("createBookingWithPaymentIntent: notify (email/SMS) failed", notifyErr);
    }

    const clientSecret =
      paymentIntent.client_secret ?? undefined;
    return { clientSecret, bookingId: booking.id };
  } catch (e) {
    console.error("createBookingWithPaymentIntent", e);
    return {
      error: e instanceof Error ? e.message : "Failed to create booking.",
    };
  }
}
