import {
  getCharityForDashboard,
  getCharityOverviewStats,
  getCharityDonations,
  getCharitySupportersCounts,
  getCharityPayouts,
} from "@/lib/charity/actions";
import { CharityDashboardClient } from "./CharityDashboardClient";

export const metadata = {
  title: "Charity Dashboard | Tinies",
  description: "Your donation activity, supporters, and profile.",
};

export default async function CharityDashboardPage() {
  const [
    { charity },
    overview,
    { donations },
    supporters,
    { payouts },
  ] = await Promise.all([
    getCharityForDashboard(),
    getCharityOverviewStats(),
    getCharityDonations(),
    getCharitySupportersCounts(),
    getCharityPayouts(),
  ]);

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
