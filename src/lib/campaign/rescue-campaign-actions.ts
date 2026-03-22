"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { parseCampaignMilestones, parseCampaignUpdates, type CampaignUpdateEntry } from "@/lib/campaign/campaign-types";
import type { Prisma } from "@prisma/client";

const CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed"] as const;

async function getRescueOrgForUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { org: null as null | { id: string; slug: string }, error: "You must be signed in." };
  const org = await prisma.rescueOrg.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true },
  });
  if (!org) return { org: null, error: "No rescue organisation found." };
  return { org, error: undefined };
}

export async function listMyCampaigns() {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { campaigns: [] as const, error };
  const campaigns = await prisma.campaign.findMany({
    where: { rescueOrgId: org.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      featured: true,
      raisedAmountCents: true,
      donorCount: true,
      goalAmountCents: true,
      updatedAt: true,
    },
  });
  return { campaigns, error: undefined };
}

export async function createRescueCampaign(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { ok: false, error: error ?? "Not found." };

  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!title) return { ok: false, error: "Title is required." };
  if (!slug) {
    slug = slugify(title, { lower: true, strict: true });
  }
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  if (!description) return { ok: false, error: "Description is required." };
  const coverPhotoUrl = String(formData.get("coverPhotoUrl") ?? "").trim() || null;
  const goalRaw = String(formData.get("goalAmountEur") ?? "").trim();
  const goalAmountCents = goalRaw ? Math.round(parseFloat(goalRaw) * 100) : null;
  if (goalAmountCents != null && (Number.isNaN(goalAmountCents) || goalAmountCents < 0)) {
    return { ok: false, error: "Invalid goal amount." };
  }
  const status = CAMPAIGN_STATUSES.includes(String(formData.get("status")) as (typeof CAMPAIGN_STATUSES)[number])
    ? String(formData.get("status"))
    : "draft";
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true";

  const exists = await prisma.campaign.findUnique({ where: { slug }, select: { id: true } });
  if (exists) return { ok: false, error: "That URL slug is already taken. Choose another." };

  await prisma.campaign.create({
    data: {
      rescueOrgId: org.id,
      slug,
      title,
      subtitle,
      description,
      coverPhotoUrl,
      goalAmountCents,
      status,
      featured,
      milestones: [],
      updates: [],
    },
  });

  revalidatePath("/dashboard/rescue/campaigns");
  revalidatePath(`/rescue/${org.slug}`);
  revalidatePath("/giving");
  revalidatePath("/");
  return { ok: true };
}

export async function updateRescueCampaign(
  campaignId: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { ok: false, error: error ?? "Not found." };

  const existing = await prisma.campaign.findFirst({
    where: { id: campaignId, rescueOrgId: org.id },
    select: { id: true, slug: true },
  });
  if (!existing) return { ok: false, error: "Campaign not found." };

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const coverPhotoUrl = String(formData.get("coverPhotoUrl") ?? "").trim() || null;
  const goalRaw = String(formData.get("goalAmountEur") ?? "").trim();
  const goalAmountCents = goalRaw ? Math.round(parseFloat(goalRaw) * 100) : null;
  if (goalAmountCents != null && (Number.isNaN(goalAmountCents) || goalAmountCents < 0)) {
    return { ok: false, error: "Invalid goal amount." };
  }
  const status = CAMPAIGN_STATUSES.includes(String(formData.get("status")) as (typeof CAMPAIGN_STATUSES)[number])
    ? String(formData.get("status"))
    : "draft";
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true";

  if (!title || !description) return { ok: false, error: "Title and description are required." };

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      title,
      subtitle,
      description,
      coverPhotoUrl,
      goalAmountCents,
      status,
      featured,
    },
  });

  revalidatePath("/dashboard/rescue/campaigns");
  revalidatePath(`/dashboard/rescue/campaigns/${campaignId}/edit`);
  revalidatePath(`/rescue/${org.slug}/campaign/${existing.slug}`);
  revalidatePath(`/rescue/${org.slug}`);
  revalidatePath("/giving");
  revalidatePath("/");
  return { ok: true };
}

export async function appendRescueCampaignUpdate(
  campaignId: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { ok: false, error: error ?? "Not found." };

  const camp = await prisma.campaign.findFirst({
    where: { id: campaignId, rescueOrgId: org.id },
    select: { updates: true, slug: true },
  });
  if (!camp) return { ok: false, error: "Campaign not found." };

  const title = String(formData.get("updateTitle") ?? "").trim();
  const text = String(formData.get("updateText") ?? "").trim();
  const date = String(formData.get("updateDate") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const photoUrl = String(formData.get("updatePhotoUrl") ?? "").trim() || null;
  if (!title || !text) return { ok: false, error: "Update title and text are required." };

  const prev = parseCampaignUpdates(camp.updates as Prisma.JsonValue);
  const next: CampaignUpdateEntry[] = [{ date, title, text, photoUrl }, ...prev];

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { updates: next as unknown as Prisma.InputJsonValue },
  });

  revalidatePath(`/dashboard/rescue/campaigns/${campaignId}/edit`);
  revalidatePath(`/rescue/${org.slug}/campaign/${camp.slug}`);
  return { ok: true };
}

export async function markRescueCampaignMilestone(
  campaignId: string,
  milestoneIndex: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { ok: false, error: error ?? "Not found." };

  const camp = await prisma.campaign.findFirst({
    where: { id: campaignId, rescueOrgId: org.id },
    select: { milestones: true, slug: true },
  });
  if (!camp) return { ok: false, error: "Campaign not found." };

  const list = parseCampaignMilestones(camp.milestones as Prisma.JsonValue);
  if (milestoneIndex < 0 || milestoneIndex >= list.length) {
    return { ok: false, error: "Invalid milestone." };
  }
  const copy = [...list];
  copy[milestoneIndex] = {
    ...copy[milestoneIndex],
    reached: true,
    reachedAt: new Date().toISOString().slice(0, 10),
  };

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { milestones: copy as unknown as Prisma.InputJsonValue },
  });

  revalidatePath(`/dashboard/rescue/campaigns/${campaignId}/edit`);
  revalidatePath(`/rescue/${org.slug}/campaign/${camp.slug}`);
  return { ok: true };
}

export async function getRescueCampaignForEdit(campaignId: string) {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { campaign: null, error };
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, rescueOrgId: org.id },
  });
  if (!campaign) return { campaign: null, error: "Not found." };
  return { campaign, error: undefined, orgSlug: org.slug };
}

export async function getRescueCampaignSupporters(campaignId: string) {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { rows: [], error };
  const c = await prisma.campaign.findFirst({
    where: { id: campaignId, rescueOrgId: org.id },
    select: { id: true },
  });
  if (!c) return { rows: [], error: "Not found." };
  const rows = await prisma.campaignDonation.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { donation: { select: { amount: true, createdAt: true } } },
  });
  return {
    rows: rows.map((r) => ({
      id: r.id,
      donorName: r.donorName,
      message: r.message,
      amountCents: r.donation.amount,
      createdAt: r.donation.createdAt,
    })),
    error: undefined,
  };
}
