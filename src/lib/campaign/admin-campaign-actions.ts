"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const STATUSES = ["draft", "active", "paused", "completed"] as const;

export async function adminListCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      featured: true,
      raisedAmountCents: true,
      donorCount: true,
      rescueOrg: { select: { slug: true, name: true } },
    },
  });
}

export async function adminSetCampaignStatus(
  campaignId: string,
  status: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { ok: false, error: "Invalid status." };
  }
  const row = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, slug: true, rescueOrg: { select: { slug: true } } },
  });
  if (!row) return { ok: false, error: "Not found." };
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status },
  });
  revalidatePath("/dashboard/admin/campaigns");
  revalidatePath(`/rescue/${row.rescueOrg.slug}/campaign/${row.slug}`);
  revalidatePath("/giving");
  revalidatePath("/");
  return { ok: true };
}

export async function adminToggleCampaignFeatured(
  campaignId: string,
  featured: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, slug: true, rescueOrg: { select: { slug: true } } },
  });
  if (!row) return { ok: false, error: "Not found." };
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { featured },
  });
  revalidatePath("/dashboard/admin/campaigns");
  revalidatePath("/giving");
  revalidatePath("/");
  return { ok: true };
}
