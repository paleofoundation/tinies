"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import ProviderIdentityVerifiedEmail from "@/lib/email/templates/provider-identity-verified";
import ProviderVerificationRejectedEmail from "@/lib/email/templates/provider-verification-rejected";

export type ProviderVerificationRow = {
  id: string;
  userId: string;
  slug: string;
  bio: string | null;
  idDocumentUrl: string | null;
  stripeVerificationSessionId: string | null;
  verified: boolean;
  verifiedAt: Date | null;
  user: { name: string; email: string };
};

/** Providers awaiting verification: unverified with ID doc or Stripe session. */
export async function getProvidersPendingVerification(): Promise<ProviderVerificationRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const u = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (u?.role !== "admin") return [];

  const rows = await prisma.providerProfile.findMany({
    where: {
      verified: false,
      OR: [
        { idDocumentUrl: { not: null } },
        { stripeVerificationSessionId: { not: null } },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });
  return rows.map((p) => ({
    id: p.id,
    userId: p.userId,
    slug: p.slug,
    bio: p.bio,
    idDocumentUrl: p.idDocumentUrl,
    stripeVerificationSessionId: p.stripeVerificationSessionId,
    verified: p.verified,
    verifiedAt: p.verifiedAt,
    user: p.user,
  }));
}

/** Recently verified providers. */
export async function getRecentlyVerifiedProviders(limit = 10): Promise<ProviderVerificationRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const u = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (u?.role !== "admin") return [];

  const rows = await prisma.providerProfile.findMany({
    where: { verified: true, verifiedAt: { not: null } },
    orderBy: { verifiedAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });
  return rows.map((p) => ({
    id: p.id,
    userId: p.userId,
    slug: p.slug,
    bio: p.bio,
    idDocumentUrl: p.idDocumentUrl,
    stripeVerificationSessionId: p.stripeVerificationSessionId,
    verified: p.verified,
    verifiedAt: p.verifiedAt,
    user: p.user,
  }));
}

export async function approveProviderVerification(profileId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const u = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (u?.role !== "admin") return { error: "Admin only." };

  const profile = await prisma.providerProfile.findUnique({
    where: { id: profileId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!profile) return { error: "Profile not found." };
  if (profile.verified) return { error: "Already verified." };

  await prisma.providerProfile.update({
    where: { id: profileId },
    data: { verified: true, verifiedAt: new Date() },
  });
  if (profile.user?.email) {
    await sendEmail({
      to: profile.user.email,
      subject: "Your identity has been verified!",
      react: ProviderIdentityVerifiedEmail({ providerName: profile.user.name || "there" }),
    });
  }
  revalidatePath("/dashboard/admin");
  return {};
}

export async function rejectProviderVerification(profileId: string, reason: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const u = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (u?.role !== "admin") return { error: "Admin only." };

  const profile = await prisma.providerProfile.findUnique({
    where: { id: profileId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!profile) return { error: "Profile not found." };

  if (profile.user?.email) {
    await sendEmail({
      to: profile.user.email,
      subject: "Identity verification update",
      react: ProviderVerificationRejectedEmail({
        providerName: profile.user.name || "there",
        reason: reason.trim() || "We were unable to verify your document. Please ensure it is clear and valid.",
      }),
    });
  }
  revalidatePath("/dashboard/admin");
  return {};
}
