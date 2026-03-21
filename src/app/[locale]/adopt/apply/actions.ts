"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { validateAdoptionApplication } from "@/lib/validations/adoption-application";
import AdoptionApplicationReceivedEmail from "@/lib/email/templates/adoption-application-received";
import type { SubmitResult } from "@/app/[locale]/adopt/apply/application-submit-types";

/** Get adoption listing by slug; null if not found or not available. */
export async function getListingBySlug(slug: string) {
  const listing = await prisma.adoptionListing.findFirst({
    where: { slug, status: "available", active: true, org: { verified: true } },
    select: {
      id: true,
      slug: true,
      name: true,
      species: true,
      breed: true,
      estimatedAge: true,
      temperament: true,
      medicalHistory: true,
      specialNeeds: true,
      photos: true,
      orgId: true,
      org: {
        select: {
          name: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });
  return listing;
}

/** Ensure the current user exists in Prisma (for applicantId FK). */
async function ensureApplicantInPrisma(
  userId: string,
  email: string,
  name: string
) {
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      name: name || email || "Adopter",
      passwordHash: "supabase-auth-placeholder",
      role: "adopter",
    },
    update: {},
  });
}

export async function submitAdoptionApplication(
  _prevState: SubmitResult,
  formData: FormData
): Promise<SubmitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to submit an application." };
  }

  const raw = {
    listingSlug: formData.get("listingSlug"),
    country: formData.get("country"),
    city: formData.get("city"),
    livingSituation: formData.get("livingSituation"),
    hasGarden: formData.get("hasGarden"),
    otherPets: formData.get("otherPets"),
    childrenAges: formData.get("childrenAges"),
    experience: formData.get("experience"),
    reason: formData.get("reason"),
    vetReference: formData.get("vetReference"),
  };

  const validated = validateAdoptionApplication(raw);
  if (!validated.success) return { error: validated.error };
  const data = validated.data;

  const listing = await getListingBySlug(data.listingSlug);
  if (!listing) {
    return { error: "This animal is no longer available for adoption." };
  }

  try {
    await ensureApplicantInPrisma(
      user.id,
      user.email ?? "",
      (user.user_metadata?.name as string) ?? user.email ?? "Adopter"
    );

    await prisma.adoptionApplication.create({
      data: {
        listingId: listing.id,
        applicantId: user.id,
        country: data.country,
        city: data.city,
        livingSituation: data.livingSituation,
        hasGarden: data.hasGarden ?? null,
        otherPets: data.otherPets || null,
        childrenAges: data.childrenAges || null,
        experience: data.experience || null,
        reason: data.reason || null,
        vetReference: data.vetReference || null,
        status: "new",
      },
    });

    const rescueEmail = listing.org.user?.email;
    if (rescueEmail) {
      await sendEmail({
        to: rescueEmail,
        subject: `New adoption application for ${listing.name} | Tinies`,
        react: AdoptionApplicationReceivedEmail({
          animalName: listing.name,
          species: listing.species,
          applicantName: (user.user_metadata?.name as string) ?? user.email ?? "An applicant",
          country: data.country,
          city: data.city,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app"}/dashboard/rescue`,
        }),
      });
    }

    redirect("/dashboard/adopter");
  } catch (e) {
    console.error("submitAdoptionApplication failed:", e);
    return {
      error: e instanceof Error ? e.message : "Something went wrong. Please try again.",
    };
  }
}
