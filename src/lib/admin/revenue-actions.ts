import { prisma } from "@/lib/prisma";
import { DonationSource, PlacementStatus } from "@prisma/client";

/** Split commission: 90% to rescue, remainder retained (whole cents). */
export function splitCommissionCents(totalCommissionCents: number): {
  toRescueCents: number;
  retainedCents: number;
} {
  const toRescueCents = Math.floor((totalCommissionCents * 90) / 100);
  const retainedCents = totalCommissionCents - toRescueCents;
  return { toRescueCents, retainedCents };
}

export type RevenuePeriodMetrics = {
  completedBookingsCount: number;
  bookingRevenueCents: number;
  commissionCents: number;
  commissionToRescueCents: number;
  commissionRetainedCents: number;
  adoptionCoordinationFeesCents: number;
  /** Booking GMV + adoption coordination fees (commission is not added again). */
  totalRevenueCents: number;
};

export type RevenueOverview = RevenuePeriodMetrics & {
  /** Sum of `donations` with source platform_commission (should align with rescue share recorded). */
  ledgerPlatformCommissionCents: number;
};

export type RevenueMonthRow = {
  yearMonth: string;
  label: string;
  bookingsCount: number;
  bookingRevenueCents: number;
  commissionCents: number;
  commissionToRescueCents: number;
  commissionRetainedCents: number;
  adoptionCoordinationFeesCents: number;
  totalRevenueCents: number;
};

export type RevenueComparison = {
  current: RevenuePeriodMetrics;
  previous: RevenuePeriodMetrics;
};

function emptyPeriod(): RevenuePeriodMetrics {
  return {
    completedBookingsCount: 0,
    bookingRevenueCents: 0,
    commissionCents: 0,
    commissionToRescueCents: 0,
    commissionRetainedCents: 0,
    adoptionCoordinationFeesCents: 0,
    totalRevenueCents: 0,
  };
}

function buildPeriodFromBookingsAndPlacements(
  bookings: { totalPrice: number; commissionAmount: number }[],
  placements: { coordinationFee: number | null }[]
): RevenuePeriodMetrics {
  let bookingRevenueCents = 0;
  let commissionCents = 0;
  for (const b of bookings) {
    bookingRevenueCents += b.totalPrice;
    commissionCents += b.commissionAmount;
  }
  const { toRescueCents, retainedCents } = splitCommissionCents(commissionCents);
  let adoptionCoordinationFeesCents = 0;
  for (const p of placements) {
    adoptionCoordinationFeesCents += p.coordinationFee ?? 0;
  }
  return {
    completedBookingsCount: bookings.length,
    bookingRevenueCents,
    commissionCents,
    commissionToRescueCents: toRescueCents,
    commissionRetainedCents: retainedCents,
    adoptionCoordinationFeesCents,
    totalRevenueCents: bookingRevenueCents + adoptionCoordinationFeesCents,
  };
}

/** All-time revenue totals from completed bookings and completed placements. */
export async function getRevenueOverview(): Promise<RevenueOverview> {
  const [agg, placementAgg, ledgerAgg] = await Promise.all([
    prisma.booking.aggregate({
      where: { status: "completed" },
      _count: { id: true },
      _sum: { totalPrice: true, commissionAmount: true },
    }),
    prisma.adoptionPlacement.aggregate({
      where: { status: PlacementStatus.completed },
      _sum: { coordinationFee: true },
    }),
    prisma.donation.aggregate({
      where: { source: DonationSource.platform_commission },
      _sum: { amount: true },
    }),
  ]);

  const bookingRevenueCents = agg._sum.totalPrice ?? 0;
  const commissionCents = agg._sum.commissionAmount ?? 0;
  const { toRescueCents, retainedCents } = splitCommissionCents(commissionCents);
  const adoptionCoordinationFeesCents = placementAgg._sum.coordinationFee ?? 0;

  return {
    completedBookingsCount: agg._count.id,
    bookingRevenueCents,
    commissionCents,
    commissionToRescueCents: toRescueCents,
    commissionRetainedCents: retainedCents,
    adoptionCoordinationFeesCents,
    totalRevenueCents: bookingRevenueCents + adoptionCoordinationFeesCents,
    ledgerPlatformCommissionCents: ledgerAgg._sum.amount ?? 0,
  };
}

function utcMonthStart(year: number, monthIndex0: number): Date {
  return new Date(Date.UTC(year, monthIndex0, 1, 0, 0, 0, 0));
}

function utcMonthEndExclusive(year: number, monthIndex0: number): Date {
  return new Date(Date.UTC(year, monthIndex0 + 1, 1, 0, 0, 0, 0));
}

function yearMonthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function labelForYearMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Last `months` calendar months (UTC), most recent first. */
export async function getRevenueByMonth(months: number = 12): Promise<RevenueMonthRow[]> {
  const now = new Date();
  const end = utcMonthEndExclusive(now.getUTCFullYear(), now.getUTCMonth());
  const start = utcMonthStart(now.getUTCFullYear(), now.getUTCMonth() - (months - 1));

  const [bookingRows, placementRows] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: "completed",
        updatedAt: { gte: start, lt: end },
      },
      select: { updatedAt: true, totalPrice: true, commissionAmount: true },
    }),
    prisma.adoptionPlacement.findMany({
      where: {
        status: PlacementStatus.completed,
        updatedAt: { gte: start, lt: end },
      },
      select: { updatedAt: true, coordinationFee: true },
    }),
  ]);

  const bucket = new Map<
    string,
    { bookings: { totalPrice: number; commissionAmount: number }[]; placements: { coordinationFee: number | null }[] }
  >();

  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = yearMonthKey(d);
    bucket.set(key, { bookings: [], placements: [] });
  }

  for (const b of bookingRows) {
    const key = yearMonthKey(b.updatedAt);
    const cell = bucket.get(key);
    if (cell) cell.bookings.push({ totalPrice: b.totalPrice, commissionAmount: b.commissionAmount });
  }
  for (const p of placementRows) {
    const key = yearMonthKey(p.updatedAt);
    const cell = bucket.get(key);
    if (cell) cell.placements.push({ coordinationFee: p.coordinationFee });
  }

  const orderedKeys = Array.from(bucket.keys()).sort((a, b) => b.localeCompare(a));

  return orderedKeys.map((yearMonth) => {
    const cell = bucket.get(yearMonth)!;
    const m = buildPeriodFromBookingsAndPlacements(cell.bookings, cell.placements);
    return {
      yearMonth,
      label: labelForYearMonth(yearMonth),
      bookingsCount: m.completedBookingsCount,
      bookingRevenueCents: m.bookingRevenueCents,
      commissionCents: m.commissionCents,
      commissionToRescueCents: m.commissionToRescueCents,
      commissionRetainedCents: m.commissionRetainedCents,
      adoptionCoordinationFeesCents: m.adoptionCoordinationFeesCents,
      totalRevenueCents: m.totalRevenueCents,
    };
  });
}

/** Current calendar month vs previous (UTC), with metrics for comparison UI. */
export async function getCurrentVsLastMonth(): Promise<RevenueComparison> {
  const now = new Date();
  const cy = now.getUTCFullYear();
  const cm = now.getUTCMonth();

  const curStart = utcMonthStart(cy, cm);
  const curEnd = utcMonthEndExclusive(cy, cm);
  const prevStart = utcMonthStart(cy, cm - 1);
  const prevEnd = utcMonthEndExclusive(cy, cm - 1);

  const [curBookings, curPlacements, prevBookings, prevPlacements] = await Promise.all([
    prisma.booking.findMany({
      where: { status: "completed", updatedAt: { gte: curStart, lt: curEnd } },
      select: { totalPrice: true, commissionAmount: true },
    }),
    prisma.adoptionPlacement.findMany({
      where: { status: PlacementStatus.completed, updatedAt: { gte: curStart, lt: curEnd } },
      select: { coordinationFee: true },
    }),
    prisma.booking.findMany({
      where: { status: "completed", updatedAt: { gte: prevStart, lt: prevEnd } },
      select: { totalPrice: true, commissionAmount: true },
    }),
    prisma.adoptionPlacement.findMany({
      where: { status: PlacementStatus.completed, updatedAt: { gte: prevStart, lt: prevEnd } },
      select: { coordinationFee: true },
    }),
  ]);

  return {
    current: buildPeriodFromBookingsAndPlacements(curBookings, curPlacements),
    previous: buildPeriodFromBookingsAndPlacements(prevBookings, prevPlacements),
  };
}

export function percentChange(previous: number, current: number): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
