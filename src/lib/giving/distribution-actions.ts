"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getGivingFundBalance } from "@/lib/giving/actions";
import {
  type DistributionPreview,
  type DistributionPreviewRow,
  type PastDistributionBreakdownRow,
  type PastDistributionRow,
  equalSplitCents,
} from "@/lib/giving/distribution-shared";
import { UserRole } from "@prisma/client";

function startOfUtcMonth(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfUtcMonthExclusive(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

async function requireAdminUserId(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser || dbUser.role !== UserRole.admin) {
    return { error: "Admin access required." };
  }
  return { userId: user.id };
}

function parsePerCharityAmounts(
  raw: unknown
): { charityId: string; amount: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (typeof x !== "object" || x === null) return null;
      const o = x as { charityId?: string; charity_id?: string; amount?: unknown };
      const id = o.charityId ?? o.charity_id;
      const amt = typeof o.amount === "number" ? o.amount : Number(o.amount);
      if (!id || !Number.isFinite(amt)) return null;
      return { charityId: id, amount: amt };
    })
    .filter((x): x is { charityId: string; amount: number } => x != null);
}

/** Preview equal split of available fund balance across verified active charities. */
export async function getDistributionPreview(): Promise<DistributionPreview> {
  const balance = await getGivingFundBalance();
  const now = new Date();
  const monthStart = startOfUtcMonth(now);
  const monthEnd = endOfUtcMonthExclusive(monthStart);

  const [existingThisMonth, charities, donationStats] = await Promise.all([
    prisma.givingFundDistribution.findFirst({
      where: { month: monthStart },
      select: { id: true },
    }),
    prisma.charity.findMany({
      where: { verified: true, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.donation.groupBy({
      by: ["charityId"],
      where: {
        charityId: { not: null },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      _count: { id: true },
      _sum: { amount: true },
    }),
  ]);

  const statsByCharity = new Map<
    string,
    { count: number; totalCents: number }
  >();
  for (const row of donationStats) {
    if (!row.charityId) continue;
    statsByCharity.set(row.charityId, {
      count: row._count.id,
      totalCents: row._sum.amount ?? 0,
    });
  }

  const available = balance.availableForDistributionCents;
  const n = charities.length;
  const shares = equalSplitCents(available, n);

  const charityRows: DistributionPreviewRow[] = charities.map((c, i) => {
    const share = shares[i] ?? 0;
    const st = statsByCharity.get(c.id) ?? { count: 0, totalCents: 0 };
    return {
      charityId: c.id,
      charityName: c.name,
      proposedShareCents: share,
      directDonationCountThisMonth: st.count,
      directDonationsTotalCentsThisMonth: st.totalCents,
      totalWithShareCents: st.totalCents + share,
    };
  });

  let canApprove = true;
  let approveBlockedReason: string | undefined;
  if (existingThisMonth) {
    canApprove = false;
    approveBlockedReason = "A distribution for this calendar month already exists.";
  } else if (available <= 0) {
    canApprove = false;
    approveBlockedReason = "No balance available to distribute (or funds are locked in pending payouts).";
  } else if (n === 0) {
    canApprove = false;
    approveBlockedReason = "No verified active charities to receive a share.";
  }

  return {
    unallocatedCents: balance.unallocatedCents,
    pendingOrProcessingLockedCents: balance.pendingOrProcessingLockedCents,
    availableForDistributionCents: available,
    platformCommissionToFundCents: balance.platformCommissionToFundCents,
    distributedCompletedCents: balance.distributedCompletedCents,
    charityRows,
    currentMonthStartIso: monthStart.toISOString(),
    canApprove,
    approveBlockedReason,
  };
}

export async function approveDistribution(): Promise<{
  ok?: true;
  message?: string;
  error?: string;
}> {
  const auth = await requireAdminUserId();
  if ("error" in auth) return { error: auth.error };

  const monthStart = startOfUtcMonth();
  const existing = await prisma.givingFundDistribution.findFirst({
    where: { month: monthStart },
    select: { id: true },
  });
  if (existing) {
    return { error: "A distribution for this calendar month already exists." };
  }

  const balance = await getGivingFundBalance();
  const available = balance.availableForDistributionCents;
  if (available <= 0) {
    return {
      error: "No balance available to distribute (or funds are locked in pending payouts).",
    };
  }

  const charities = await prisma.charity.findMany({
    where: { verified: true, active: true },
    orderBy: { name: "asc" },
    select: { id: true },
  });
  if (charities.length === 0) {
    return { error: "No verified active charities to receive a share." };
  }

  const shares = equalSplitCents(available, charities.length);
  const perCharityAmounts = charities.map((c, i) => ({
    charityId: c.id,
    amount: shares[i] ?? 0,
  }));

  const totalCheck = perCharityAmounts.reduce((s, x) => s + x.amount, 0);
  if (totalCheck !== available) {
    return { error: "Internal split mismatch; please retry." };
  }

  try {
    await prisma.givingFundDistribution.create({
      data: {
        month: monthStart,
        totalFundAmount: available,
        distributionMethod: "equal",
        perCharityAmounts,
        approvedBy: auth.userId,
        approvedAt: new Date(),
        payoutStatus: "pending",
      },
    });
    revalidatePath("/dashboard/admin");
    const eur = (available / 100).toFixed(2);
    return {
      ok: true,
      message: `Distribution approved. €${eur} will be distributed to ${charities.length} charities.`,
    };
  } catch (e) {
    console.error("approveDistribution", e);
    return { error: e instanceof Error ? e.message : "Failed to save distribution." };
  }
}

export async function markDistributionCompleted(
  id: string
): Promise<{ ok?: true; error?: string }> {
  const auth = await requireAdminUserId();
  if ("error" in auth) return { error: auth.error };

  const row = await prisma.givingFundDistribution.findFirst({
    where: {
      id,
      payoutStatus: { in: ["pending", "processing"] },
    },
    select: { id: true },
  });
  if (!row) return { error: "Distribution not found or already completed." };

  try {
    await prisma.givingFundDistribution.update({
      where: { id },
      data: { payoutStatus: "completed" },
    });
    revalidatePath("/dashboard/admin");
    return { ok: true };
  } catch (e) {
    console.error("markDistributionCompleted", e);
    return { error: e instanceof Error ? e.message : "Failed to update." };
  }
}

export async function getPastDistributions(): Promise<{
  distributions: PastDistributionRow[];
  error?: string;
}> {
  try {
    const rows = await prisma.givingFundDistribution.findMany({
      orderBy: [{ month: "desc" }, { createdAt: "desc" }],
      include: {
        approvedByUser: { select: { name: true, email: true } },
      },
    });

    const allIds = new Set<string>();
    for (const r of rows) {
      for (const e of parsePerCharityAmounts(r.perCharityAmounts)) {
        allIds.add(e.charityId);
      }
    }
    const charityList =
      allIds.size > 0
        ? await prisma.charity.findMany({
            where: { id: { in: [...allIds] } },
            select: { id: true, name: true },
          })
        : [];
    const nameById = new Map(charityList.map((c) => [c.id, c.name]));

    const distributions: PastDistributionRow[] = rows.map((r) => {
      const parsed = parsePerCharityAmounts(r.perCharityAmounts);
      const breakdown: PastDistributionBreakdownRow[] = parsed.map((e) => ({
        charityId: e.charityId,
        charityName: nameById.get(e.charityId) ?? "Unknown charity",
        amountCents: e.amount,
      }));
      const m = r.month;
      return {
        id: r.id,
        monthLabel: new Date(m).toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }),
        monthStartIso: new Date(m).toISOString(),
        totalFundAmountCents: r.totalFundAmount,
        charityCount: parsed.length,
        distributionMethod: r.distributionMethod,
        payoutStatus: r.payoutStatus,
        approvedByName: r.approvedByUser?.name ?? r.approvedByUser?.email ?? null,
        approvedAtIso: r.approvedAt?.toISOString() ?? null,
        breakdown,
      };
    });

    return { distributions };
  } catch (e) {
    console.error("getPastDistributions", e);
    return { distributions: [], error: "Failed to load distributions." };
  }
}
