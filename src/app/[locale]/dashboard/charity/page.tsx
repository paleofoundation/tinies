import {
  getCharityForDashboard,
  getCharityOverviewStats,
  getCharityDonations,
  getCharitySupportersCounts,
  getCharityPayouts,
} from "@/lib/charity/actions";
import { CharityDashboardClient } from "./CharityDashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Charity Dashboard | Tinies",
  description: "Your donation activity, supporters, and profile.",
};

export default async function CharityDashboardPage() {
  let charity: Awaited<ReturnType<typeof getCharityForDashboard>>["charity"] = null;
  let overview: Awaited<ReturnType<typeof getCharityOverviewStats>>;
  let donations: Awaited<ReturnType<typeof getCharityDonations>>["donations"] = [];
  let supporters: Awaited<ReturnType<typeof getCharitySupportersCounts>>;
  let payouts: Awaited<ReturnType<typeof getCharityPayouts>>["payouts"] = [];
  try {
    const [dashboardResult, overviewResult, donationsResult, supportersResult, payoutsResult] = await Promise.all([
      getCharityForDashboard(),
      getCharityOverviewStats(),
      getCharityDonations(),
      getCharitySupportersCounts(),
      getCharityPayouts(),
    ]);
    charity = dashboardResult.charity;
    overview = overviewResult;
    donations = donationsResult.donations;
    supporters = supportersResult;
    payouts = payoutsResult.payouts;
  } catch (e) {
    console.error("CharityDashboardPage data fetch", e);
    overview = {
      totalReceivedCents: 0,
      totalThisMonthCents: 0,
      activeSupportersCount: 0,
      nextPayoutCents: null,
      nextPayoutMonth: null,
      monthlyTrend: [],
    };
    supporters = { roundUpDonors: 0, oneTimeDonors: 0, guardianSubscribers: 0 };
  }

  if (!charity) {
    return null;
  }

  return (
    <CharityDashboardClient
      charity={charity}
      initialOverview={overview}
      initialDonations={donations}
      initialSupporters={supporters}
      initialPayouts={payouts}
    />
  );
}
