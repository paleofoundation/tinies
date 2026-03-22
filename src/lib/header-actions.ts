"use server";

import type { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getSiteImage } from "@/lib/images/get-site-image";

/** Used by Header: dashboard routing, provider flag, optional avatar from DB. */
export async function getHeaderNavMeta(): Promise<{
  hasProviderProfile: boolean;
  dbRole: UserRole | null;
  avatarUrl: string | null;
  logoUrl: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const logoUrl = await getSiteImage("logo");
  if (!user) {
    return { hasProviderProfile: false, dbRole: null, avatarUrl: null, logoUrl };
  }

  const [profile, dbUser] = await Promise.all([
    prisma.providerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, avatarUrl: true },
    }),
  ]);

  return {
    hasProviderProfile: !!profile,
    dbRole: dbUser?.role ?? null,
    avatarUrl: dbUser?.avatarUrl ?? null,
    logoUrl,
  };
}
