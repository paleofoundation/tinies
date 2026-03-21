"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getStripeServer } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import ReviewReceivedEmail from "@/lib/email/templates/review-received";
import OwnerCancelledEmail from "@/lib/email/templates/owner-cancelled";
import { sendSMS, buildOwnerCancelledProviderSMS } from "@/lib/sms";
import { validatePetFormData, MAX_PHOTOS } from "@/lib/validations/pet";
import { reviewFormSchema, MAX_PHOTOS as MAX_REVIEW_PHOTOS } from "@/lib/validations/review";
import type { CancellationPolicy } from "@prisma/client";
import type { CreatePetResult, UpdatePetResult, DeletePetResult, OwnerBookingCard, WalkRouteData } from "@/lib/utils/owner-helpers";

/** Create a bucket named "pets" in Supabase Storage (Dashboard → Storage) and allow public read if you want public image URLs. */
const PETS_BUCKET = "pets";
/** Bucket for review photos. Create "reviews" in Supabase Storage if needed. */
const REVIEWS_BUCKET = "reviews";
const REVIEW_EDIT_HOURS = 48;

/** Ensure the current Supabase user exists in Prisma so we can create pets (ownerId FK). */
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

function toOptionalString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s === "" ? undefined : s;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === "" || value == null) return undefined;
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (value === "" || value == null) return undefined;
  return value === true || value === "true";
}

/** Extract pet form fields from FormData (for create/update). */
function parsePetFormData(formData: FormData) {
  return {
    name: toOptionalString(formData.get("name")),
    species: toOptionalString(formData.get("species")),
    breed: toOptionalString(formData.get("breed")),
    ageYears: toOptionalNumber(formData.get("ageYears")),
    weightKg: toOptionalNumber(formData.get("weightKg")),
    sex: toOptionalString(formData.get("sex")),
    spayedNeutered: toOptionalBoolean(formData.get("spayedNeutered")),
    temperament: toOptionalString(formData.get("temperament")),
    medicalNotes: toOptionalString(formData.get("medicalNotes")),
    dietaryNeeds: toOptionalString(formData.get("dietaryNeeds")),
    vetName: toOptionalString(formData.get("vetName")),
    vetPhone: toOptionalString(formData.get("vetPhone")),
    existingPhotoUrls: formData.get("existingPhotoUrls") ?? undefined,
  };
}

/** Parse existing photo URLs from FormData (for update). */
function parseExistingPhotoUrls(formData: FormData): string[] {
  const s = formData.get("existingPhotoUrls");
  if (!s || typeof s !== "string" || !s.trim()) return [];
  try {
    const parsed = JSON.parse(s) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Get new photo files from FormData (keys like "photos" or "photos[]"). */
function getPhotoFiles(formData: FormData): File[] {
  const files: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0 && value.type.startsWith("image/")) {
      if (key === "photos" || key === "photo" || key.startsWith("photos[")) {
        files.push(value);
      }
    }
  }
  return files;
}

/** Upload a file to Supabase Storage and return its public URL. */
async function uploadPetPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  petId: string,
  file: File,
  index: number
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80);
  const path = `${userId}/${petId}/${Date.now()}-${index}-${safeName}`;

  const { error } = await supabase.storage.from(PETS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from(PETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createPet(formData: FormData): Promise<CreatePetResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to add a pet." };

  const raw = parsePetFormData(formData);
  const validated = validatePetFormData(raw);
  if (!validated.success) return { error: validated.error };

  const { data } = validated;
  if (!data.name || !data.species) return { error: "Name and species are required." };

  const photoFiles = getPhotoFiles(formData);
  if (photoFiles.length > MAX_PHOTOS) return { error: `Maximum ${MAX_PHOTOS} photos allowed.` };

  try {
    await ensureOwnerInPrisma(
      user.id,
      user.email ?? "",
      (user.user_metadata?.name as string) ?? user.email ?? "Owner"
    );

    const pet = await prisma.pet.create({
      data: {
        ownerId: user.id,
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        ageYears: data.ageYears ?? null,
        weightKg: data.weightKg ?? null,
        sex: data.sex || null,
        spayedNeutered: data.spayedNeutered ?? null,
        temperament: data.temperament || null,
        medicalNotes: data.medicalNotes || null,
        dietaryNeeds: data.dietaryNeeds || null,
        vetName: data.vetName || null,
        vetPhone: data.vetPhone || null,
        photos: [],
      },
    });

    const photoUrls: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const url = await uploadPetPhoto(supabase, user.id, pet.id, photoFiles[i], i);
      photoUrls.push(url);
    }
    if (photoUrls.length > 0) {
      await prisma.pet.update({
        where: { id: pet.id },
        data: { photos: photoUrls },
      });
    }

    revalidatePath("/dashboard/owner");
    revalidatePath("/dashboard/owner/pets/new");
    return { petId: pet.id };
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "Failed to add pet." };
  }
}

export async function updatePet(petId: string, formData: FormData): Promise<UpdatePetResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to update a pet." };

  const raw = parsePetFormData(formData);
  const validated = validatePetFormData(raw);
  if (!validated.success) return { error: validated.error };

  const { data } = validated;
  if (!data.name || !data.species) return { error: "Name and species are required." };

  const existing = await prisma.pet.findFirst({
    where: { id: petId, ownerId: user.id },
    select: { id: true, photos: true },
  });
  if (!existing) return { error: "Pet not found or you do not have permission to edit it." };

  const existingPhotoUrls = parseExistingPhotoUrls(formData);
  const photoFiles = getPhotoFiles(formData);
  if (existingPhotoUrls.length + photoFiles.length > MAX_PHOTOS) {
    return { error: `Maximum ${MAX_PHOTOS} photos allowed.` };
  }

  try {
    const newUrls: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const url = await uploadPetPhoto(supabase, user.id, petId, photoFiles[i], i);
      newUrls.push(url);
    }
    const allPhotos = [...existingPhotoUrls, ...newUrls].slice(0, MAX_PHOTOS);

    await prisma.pet.update({
      where: { id: petId },
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        ageYears: data.ageYears ?? null,
        weightKg: data.weightKg ?? null,
        sex: data.sex || null,
        spayedNeutered: data.spayedNeutered ?? null,
        temperament: data.temperament || null,
        medicalNotes: data.medicalNotes || null,
        dietaryNeeds: data.dietaryNeeds || null,
        vetName: data.vetName || null,
        vetPhone: data.vetPhone || null,
        photos: allPhotos,
      },
    });

    revalidatePath("/dashboard/owner");
    revalidatePath(`/dashboard/owner/pets/${petId}/edit`);
    return {};
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "Failed to update pet." };
  }
}

/** Get a single pet for edit (only if owned by current user). */
export async function getPetForEdit(
  petId: string
): Promise<{
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    ageYears: number | null;
    weightKg: number | null;
    sex: string | null;
    spayedNeutered: boolean | null;
    temperament: string | null;
    medicalNotes: string | null;
    dietaryNeeds: string | null;
    vetName: string | null;
    vetPhone: string | null;
    photos: string[];
  } | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { pet: null, error: "Not signed in." };
  try {
    const pet = await prisma.pet.findFirst({
      where: { id: petId, ownerId: user.id },
    });
    return { pet };
  } catch (e) {
    console.error(e);
    return { pet: null, error: "Failed to load pet." };
  }
}

/** Get current user's pets for the dashboard. */
export async function getOwnerPets(): Promise<{ pets: { id: string; name: string; species: string; breed: string | null; ageYears: number | null; photos: string[] }[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { pets: [], error: "Not signed in." };
  try {
    const pets = await prisma.pet.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, species: true, breed: true, ageYears: true, photos: true },
    });
    return { pets };
  } catch (e) {
    console.error(e);
    return { pets: [], error: "Failed to load pets." };
  }
}

export async function deletePet(petId: string): Promise<DeletePetResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to delete a pet." };

  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId: user.id },
    select: { id: true },
  });
  if (!pet) return { error: "Pet not found or you do not have permission to delete it." };

  try {
    await prisma.pet.delete({ where: { id: petId } });
    revalidatePath("/dashboard/owner");
    return {};
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "Failed to delete pet." };
  }
}

// ---------------------------------------------------------------------------
// Owner booking dashboard (Phase 1.5)
// ---------------------------------------------------------------------------

/** Get current user's bookings as owner, with provider and pet names. */
export async function getOwnerBookings(): Promise<{
  bookings: OwnerBookingCard[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { bookings: [], error: "Not signed in." };
  try {
    const rows = await prisma.booking.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        provider: { select: { id: true, name: true, avatarUrl: true } },
        reviews: { select: { id: true, createdAt: true } },
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
    const editCutoffMs = REVIEW_EDIT_HOURS * 60 * 60 * 1000;
    const bookings: OwnerBookingCard[] = rows.map((b) => {
      const review = b.reviews[0] ?? null;
      const canEdit =
        review &&
        Date.now() - new Date(review.createdAt).getTime() < editCutoffMs;
      return {
        id: b.id,
        providerId: b.provider.id,
        providerName: b.provider.name,
        providerAvatarUrl: b.provider.avatarUrl,
        serviceType: b.serviceType,
        startDatetime: b.startDatetime,
        endDatetime: b.endDatetime,
        petNames: b.petIds.map((id) => petNameById.get(id) ?? "Pet"),
        totalPriceCents: b.totalPrice,
        status: b.status,
        specialInstructions: b.specialInstructions,
        existingReview: review
          ? { id: review.id, canEdit: !!canEdit }
          : null,
        walkStartedAt: b.walkStartedAt,
        walkEndedAt: b.walkEndedAt,
        walkDistanceKm: b.walkDistanceKm,
        walkDurationMinutes: b.walkDurationMinutes,
        walkSummaryMapUrl: b.walkSummaryMapUrl,
        serviceReport: b.serviceReport as OwnerBookingCard["serviceReport"],
        hasDispute: b.hasDispute,
        hasGuaranteeClaim: b.hasGuaranteeClaim,
        tipAmount: b.tipAmount,
      };
    });
    return { bookings };
  } catch (e) {
    console.error("getOwnerBookings", e);
    return { bookings: [], error: "Failed to load bookings." };
  }
}

/** Create a Stripe PaymentIntent for tipping a provider on a completed booking. 100% goes to provider. Returns clientSecret for Stripe Elements. */
export async function createTipPaymentIntent(bookingId: string, amountCents: number): Promise<{ clientSecret: string | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { clientSecret: null, error: "You must be signed in to tip." };
  if (amountCents < 100) return { clientSecret: null, error: "Minimum tip is €1." };
  if (amountCents > 10000) return { clientSecret: null, error: "Maximum tip is €100." };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, ownerId: user.id, status: "completed" },
    select: { id: true, tipAmount: true, tipStripePaymentIntentId: true, providerId: true },
  });
  if (!booking) return { clientSecret: null, error: "Booking not found or not completed." };
  if (booking.tipAmount != null || booking.tipStripePaymentIntentId) return { clientSecret: null, error: "You have already tipped for this booking." };
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: booking.providerId },
    select: { stripeConnectAccountId: true },
  });
  if (!profile?.stripeConnectAccountId) return { clientSecret: null, error: "This provider cannot receive tips yet." };
  try {
    const stripe = getStripeServer();
    const pi = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "eur",
      transfer_data: { destination: profile.stripeConnectAccountId },
      application_fee_amount: 0,
      metadata: { type: "booking_tip", bookingId: booking.id },
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: pi.client_secret };
  } catch (e) {
    console.error("createTipPaymentIntent", e);
    return { clientSecret: null, error: e instanceof Error ? e.message : "Failed to create tip payment." };
  }
}

/** Get walk route for a booking (owner or provider only). Used for live walk view and polling. */
export async function getWalkRoute(bookingId: string): Promise<{ data: WalkRouteData | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [{ ownerId: user.id }, { providerId: user.id }],
      serviceType: "walking",
    },
    select: {
      walkRoute: true,
      walkActivities: true,
      walkStartedAt: true,
      walkEndedAt: true,
      status: true,
    },
  });
  if (!booking) return { data: null, error: "Booking not found." };
  const route = (booking.walkRoute ?? []) as { lat: number; lng: number; timestamp: number }[];
  const activities = (booking.walkActivities ?? []) as { type: string; lat: number; lng: number; timestamp: number }[];
  return {
    data: {
      walkRoute: route,
      walkActivities: activities,
      walkStartedAt: booking.walkStartedAt,
      walkEndedAt: booking.walkEndedAt,
      status: booking.status,
    },
  };
}

/**
 * Compute refund amount in cents based on cancellation policy and time until start.
 * Returns 0, 50% of total, or 100% of total.
 */
function getRefundAmountCents(
  policy: CancellationPolicy,
  totalPriceCents: number,
  startDatetime: Date
): number {
  const now = Date.now();
  const start = new Date(startDatetime).getTime();
  const msUntilStart = start - now;
  const hoursUntil = msUntilStart / (60 * 60 * 1000);
  const daysUntil = msUntilStart / (24 * 60 * 60 * 1000);

  if (hoursUntil <= 0) return 0; // no-show or already started

  switch (policy) {
    case "flexible":
      if (hoursUntil >= 24) return totalPriceCents;
      return Math.round(totalPriceCents * 0.5);
    case "moderate":
      if (daysUntil >= 7) return totalPriceCents;
      if (daysUntil >= 2) return Math.round(totalPriceCents * 0.5);
      return 0; // under 48h
    case "strict":
      if (daysUntil >= 14) return totalPriceCents;
      if (daysUntil >= 7) return Math.round(totalPriceCents * 0.5);
      return 0;
    default:
      return 0;
  }
}

export async function cancelBooking(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to cancel." };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, ownerId: user.id },
    include: {
      provider: {
        include: {
          providerProfile: { select: { cancellationPolicy: true } },
        },
      },
    },
  });
  if (!booking) return { error: "Booking not found." };
  if (booking.status !== "pending" && booking.status !== "accepted") {
    return { error: "This booking cannot be cancelled." };
  }

  try {
    const ownerName = (user.user_metadata?.name as string) ?? "A pet owner";
    const dateStr = new Date(booking.startDatetime).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (booking.status === "pending") {
      if (booking.stripePaymentIntentId) {
        try {
          const stripe = getStripeServer();
          await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
        } catch (stripeErr) {
          console.warn("cancelBooking: Stripe cancel failed", stripeErr);
        }
      }
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelledBy: user.id,
        },
      });
      try {
        const providerUser = await prisma.user.findUnique({
          where: { id: booking.providerId },
          select: { email: true, phone: true, phoneVerified: true },
        });
        if (providerUser?.email) {
          await sendEmail({
            to: providerUser.email,
            subject: `${ownerName} cancelled the booking for ${dateStr}`,
            react: OwnerCancelledEmail({
              ownerName,
              date: dateStr,
              refundNote: "No charge was made.",
            }),
          });
        }
        if (providerUser?.phoneVerified && providerUser?.phone) {
          await sendSMS({
            to: providerUser.phone,
            body: buildOwnerCancelledProviderSMS({
              ownerName,
              date: dateStr,
              refundNote: "No charge was made.",
            }),
          });
        }
      } catch (emailErr) {
        console.error("cancelBooking: owner-cancelled email failed", emailErr);
      }
    } else {
      const policy =
        booking.provider.providerProfile?.cancellationPolicy ?? "flexible";
      const refundCents = getRefundAmountCents(
        policy,
        booking.totalPrice,
        booking.startDatetime
      );
      if (refundCents > 0 && booking.stripePaymentIntentId) {
        const stripe = getStripeServer();
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          amount: refundCents,
        });
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "cancelled",
            cancelledAt: new Date(),
            cancelledBy: user.id,
            refundAmount: refundCents,
            refundStripeId: refund.id,
            refundStatus: refund.status,
          },
        });
      } else {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "cancelled",
            cancelledAt: new Date(),
            cancelledBy: user.id,
          },
        });
      }
      const refundNote =
        refundCents > 0
          ? `Refund of EUR ${(refundCents / 100).toFixed(2)} has been initiated.`
          : "No refund applies under the cancellation policy.";
      try {
        const providerUser = await prisma.user.findUnique({
          where: { id: booking.providerId },
          select: { email: true, phone: true, phoneVerified: true },
        });
        if (providerUser?.email) {
          await sendEmail({
            to: providerUser.email,
            subject: `${ownerName} cancelled the booking for ${dateStr}`,
            react: OwnerCancelledEmail({
              ownerName,
              date: dateStr,
              refundNote,
            }),
          });
        }
        if (providerUser?.phoneVerified && providerUser?.phone) {
          await sendSMS({
            to: providerUser.phone,
            body: buildOwnerCancelledProviderSMS({
              ownerName,
              date: dateStr,
              refundNote,
            }),
          });
        }
      } catch (emailErr) {
        console.error("cancelBooking: owner-cancelled email failed", emailErr);
      }
    }
    revalidatePath("/dashboard/owner");
    return {};
  } catch (e) {
    console.error("cancelBooking", e);
    return {
      error: e instanceof Error ? e.message : "Failed to cancel booking.",
    };
  }
}

// ---------------------------------------------------------------------------
// Review system (Phase 2.2)
// ---------------------------------------------------------------------------

/** Get review for a booking (owner only). Returns providerId so client can create a review. */
export async function getBookingReview(bookingId: string): Promise<{
  review: { id: string; rating: number; text: string; photos: string[]; createdAt: Date } | null;
  providerId: string | null;
  canEdit: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { review: null, providerId: null, canEdit: false, error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, ownerId: user.id },
    select: { providerId: true, reviews: { select: { id: true, rating: true, text: true, photos: true, createdAt: true } } },
  });
  if (!booking) return { review: null, providerId: null, canEdit: false };
  const r = booking.reviews[0] ?? null;
  const canEdit =
    r && Date.now() - new Date(r.createdAt).getTime() < REVIEW_EDIT_HOURS * 60 * 60 * 1000;
  return {
    review: r
      ? { id: r.id, rating: r.rating, text: r.text, photos: r.photos, createdAt: r.createdAt }
      : null,
    providerId: booking.providerId,
    canEdit: !!canEdit,
  };
}

/** Upload a file to reviews bucket and return public URL. */
async function uploadReviewPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  reviewId: string,
  file: File,
  index: number
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80);
  const path = `${userId}/${reviewId}/${Date.now()}-${index}-${safeName}`;
  const { error } = await supabase.storage.from(REVIEWS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);
  const { data } = supabase.storage.from(REVIEWS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Recompute and update provider profile avgRating and reviewCount. */
async function updateProviderReviewStats(providerId: string) {
  const agg = await prisma.review.aggregate({
    where: { providerId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.providerProfile.update({
    where: { userId: providerId },
    data: {
      avgRating: agg._avg.rating ?? null,
      reviewCount: agg._count,
    },
  });
}

export async function createReview(formData: FormData): Promise<{ error?: string; reviewId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to leave a review." };

  const bookingId = formData.get("bookingId")?.toString()?.trim();
  const providerId = formData.get("providerId")?.toString()?.trim();
  const ratingRaw = formData.get("rating");
  const rating = ratingRaw != null ? Number(ratingRaw) : NaN;
  const text = formData.get("text")?.toString()?.trim() ?? "";

  if (!bookingId || !providerId) return { error: "Missing booking or provider." };
  const validated = reviewFormSchema.safeParse({ rating, text });
  if (!validated.success) return { error: validated.error.issues[0]?.message ?? "Invalid input." };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, ownerId: user.id, status: "completed" },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found or not completed." };
  const existing = await prisma.review.findUnique({ where: { bookingId }, select: { id: true } });
  if (existing) return { error: "You have already reviewed this booking." };

  const photoFiles = getPhotoFiles(formData);
  if (photoFiles.length > MAX_REVIEW_PHOTOS) return { error: `Maximum ${MAX_REVIEW_PHOTOS} photos allowed.` };

  try {
    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId: user.id,
        providerId,
        rating: validated.data.rating,
        text: validated.data.text,
        photos: [],
      },
    });
    const photoUrls: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const url = await uploadReviewPhoto(supabase, user.id, review.id, photoFiles[i], i);
      photoUrls.push(url);
    }
    if (photoUrls.length > 0) {
      await prisma.review.update({
        where: { id: review.id },
        data: { photos: photoUrls },
      });
    }
    await updateProviderReviewStats(providerId);
    try {
      const providerUser = await prisma.user.findUnique({
        where: { id: providerId },
        select: { email: true },
      });
      const ownerName = (user.user_metadata?.name as string) ?? user.email ?? "A pet owner";
      if (providerUser?.email) {
        await sendEmail({
          to: providerUser.email,
          subject: `${ownerName} left you a ${validated.data.rating}-star review!`,
          react: ReviewReceivedEmail({
            ownerName,
            rating: validated.data.rating,
          }),
        });
      }
    } catch (emailErr) {
      console.error("createReview: email send failed", emailErr);
    }
    revalidatePath("/dashboard/owner");
    revalidatePath("/services/provider");
    revalidatePath("/services/search");
    return { reviewId: review.id };
  } catch (e) {
    console.error("createReview", e);
    return { error: e instanceof Error ? e.message : "Failed to submit review." };
  }
}

export async function updateReview(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to edit a review." };

  const reviewId = formData.get("reviewId")?.toString()?.trim();
  const ratingRaw = formData.get("rating");
  const rating = ratingRaw != null ? Number(ratingRaw) : NaN;
  const text = formData.get("text")?.toString()?.trim() ?? "";

  if (!reviewId) return { error: "Missing review." };
  const validated = reviewFormSchema.safeParse({ rating, text });
  if (!validated.success) return { error: validated.error.issues[0]?.message ?? "Invalid input." };

  const review = await prisma.review.findFirst({
    where: { id: reviewId, reviewerId: user.id },
    select: { id: true, providerId: true, createdAt: true },
  });
  if (!review) return { error: "Review not found." };
  const canEdit =
    Date.now() - new Date(review.createdAt).getTime() < REVIEW_EDIT_HOURS * 60 * 60 * 1000;
  if (!canEdit) return { error: "Reviews can only be edited within 48 hours." };

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { rating: validated.data.rating, text: validated.data.text },
    });
    await updateProviderReviewStats(review.providerId);
    revalidatePath("/dashboard/owner");
    revalidatePath("/services/provider");
    revalidatePath("/services/search");
    return {};
  } catch (e) {
    console.error("updateReview", e);
    return { error: e instanceof Error ? e.message : "Failed to update review." };
  }
}
