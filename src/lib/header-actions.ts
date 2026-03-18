"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** Used by Header to show correct dashboard link and "Become a Provider" only when not a provider. */
export async function getHeaderNavMeta(): Promise<{ hasProviderProfile: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hasProviderProfile: false };
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  return { hasProviderProfile: !!profile };
}
