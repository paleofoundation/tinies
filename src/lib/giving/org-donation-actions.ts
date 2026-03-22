"use server";

import { revalidatePath } from "next/cache";
import { DonationSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { OrgDonationRow, OrgDonationSummary, OrgPayoutRow } from "@/lib/giving/org-donation-types";
import { resolveCharityIdsForRescueOrg } from "@/lib/giving/resolve-charity-ids-for-rescue-org";

const SOURCE_LABELS: Record<DonationSource, string> = {
  roundup: "Round-up",
  guardian: "Guardian",
  one_time: "One-time",
  signup: "Signup",
  platform_commission: "Platform commission (Giving Fund)",
  campaign: "Rescue campaign",
};

type PerCharityEntry = { charity_id?: string; charityId?: string; amount: number };

function parsePerCharityAmounts(json: unknown): PerCharityEntry[] {
  if (!Array.isArray(json)) return [];
  return json as PerCharityEntry[];
}

function charityIdFromEntry(e: PerCharityEntry): string {
  return e.charity_id ?? e.charityId ?? "";
}

export async function getOrgDonationSummary(orgId: string): Promise<OrgDonationSummary> {
  const charityIds = await resolveCharityIdsForRescueOrg(orgId);
  if (charityIds.length === 0) {
    return {
      totalReceivedDirectCents: 0,
      totalReceivedFundPayoutsCents: 0,
      totalReceivedAllTimeCents: 0,
      thisMonthDirectCents: 0,
      supporterCount: 0,
      pendingPayoutCents: 0,
      latestDonationAt: null,
      charityIds: [],
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [directAll, directMonth, donorRows, guardianCount, latestDonation, distributions] = await Promise.all([
    prisma.donation.aggregate({
      where: { charityId: { in: charityIds } },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: { charityId: { in: charityIds }, createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.donation.findMany({
      where: { charityId: { in: charityIds }, userId: { not: null } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.guardianSubscription.count({
      where: { charityId: { in: charityIds }, status: "active" },
    }),
    prisma.donation.findFirst({
      where: { charityId: { in: charityIds } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.givingFundDistribution.findMany({
      select: {
        month: true,
        perCharityAmounts: true,
        payoutStatus: true,
      },
    }),
  ]);

  const totalReceivedDirectCents = directAll._sum.amount ?? 0;
  const thisMonthDirectCents = directMonth._sum.amount ?? 0;

  let totalReceivedFundPayoutsCents = 0;
  let pendingPayoutCents = 0;

  for (const d of distributions) {
    const amounts = parsePerCharityAmounts(d.perCharityAmounts);
    for (const e of amounts) {
      const cid = charityIdFromEntry(e);
      if (!charityIds.includes(cid) || e.amount <= 0) continue;
      if (d.payoutStatus === "completed") {
        totalReceivedFundPayoutsCents += e.amount;
      } else if (d.payoutStatus === "pending" || d.payoutStatus === "processing") {
        pendingPayoutCents += e.amount;
      }
    }
  }

  const uniqueDonors = new Set(donorRows.map((r) => r.userId).filter(Boolean)).size;
  const supporterCount = uniqueDonors + guardianCount;

  const totalReceivedAllTimeCents = totalReceivedDirectCents + totalReceivedFundPayoutsCents;

  return {
    totalReceivedDirectCents,
    totalReceivedFundPayoutsCents,
    totalReceivedAllTimeCents,
    thisMonthDirectCents,
    supporterCount,
    pendingPayoutCents,
    latestDonationAt: latestDonation?.createdAt ?? null,
    charityIds,
  };
}

export async function getOrgRecentDonations(orgId: string, limit = 50): Promise<OrgDonationRow[]> {
  const charityIds = await resolveCharityIdsForRescueOrg(orgId);
  if (charityIds.length === 0) return [];

  const rows = await prisma.donation.findMany({
    where: { charityId: { in: charityIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true } } },
  });

  return rows.map((d) => ({
    id: d.id,
    createdAt: d.createdAt,
    amountCents: d.amount,
    sourceLabel: SOURCE_LABELS[d.source] ?? d.source,
    donorDisplay: d.user?.name?.trim() || "Anonymous",
  }));
}

function payoutPaymentMethod(
  stripeTransferIds: unknown,
  charityId: string
): string {
  if (stripeTransferIds == null) return "Stripe Transfer";
  if (typeof stripeTransferIds === "object" && !Array.isArray(stripeTransferIds)) {
    const o = stripeTransferIds as Record<string, string>;
    if (o[charityId]) return "Stripe Transfer";
  }
  if (Array.isArray(stripeTransferIds) && stripeTransferIds.length > 0) {
    return "Stripe Transfer";
  }
  return "Bank transfer";
}

export async function getOrgPayoutHistory(orgId: string): Promise<OrgPayoutRow[]> {
  const charityIds = await resolveCharityIdsForRescueOrg(orgId);
  if (charityIds.length === 0) return [];

  const distributions = await prisma.givingFundDistribution.findMany({
    orderBy: { month: "desc" },
    take: 36,
    select: {
      id: true,
      month: true,
      perCharityAmounts: true,
      payoutStatus: true,
      approvedAt: true,
      stripeTransferIds: true,
    },
  });

  const rows: OrgPayoutRow[] = [];
  for (const d of distributions) {
    const amounts = parsePerCharityAmounts(d.perCharityAmounts);
    const entry = amounts.find((e) => charityIds.includes(charityIdFromEntry(e)) && e.amount > 0);
    if (!entry) continue;
    const cid = charityIdFromEntry(entry);
    const status = d.payoutStatus;
    const paidAt = status === "completed" ? d.approvedAt ?? null : null;
    rows.push({
      id: d.id,
      monthLabel: new Date(d.month).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      amountCents: entry.amount,
      paymentMethod: payoutPaymentMethod(d.stripeTransferIds, cid),
      status,
      paidAt,
    });
  }
  return rows;
}

export async function markRescueDonationsTabSeen(orgId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const org = await prisma.rescueOrg.findFirst({
    where: { id: orgId, userId: user.id },
    select: { id: true },
  });
  if (!org) return { error: "Organisation not found." };
  try {
    await prisma.rescueOrg.update({
      where: { id: orgId },
      data: { donationsTabLastSeenAt: new Date() },
    });
    revalidatePath("/dashboard/rescue");
    return {};
  } catch (e) {
    console.error("markRescueDonationsTabSeen", e);
    return { error: "Could not update." };
  }
}
