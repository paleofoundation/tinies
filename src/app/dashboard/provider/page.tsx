import {
  getProviderStripeStatus,
  getProviderBookings,
  getProviderReviews,
  getProviderEarnings,
  expireStaleBookings,
  getProviderProfileCompleteness,
  getProviderAreaPriceGuidance,
} from "./actions";
import { getProviderMeetAndGreets } from "@/lib/meet-and-greet/actions";
import { getDisputesForUser, getClaimsForUser } from "@/lib/disputes/actions";
import { ProviderDashboardClient } from "./ProviderDashboardClient";
import { ProviderOnboardingWizard } from "./ProviderOnboardingWizard";

export const dynamic = "force-dynamic";

export default async function ProviderDashboardPage() {
  let completeness: Awaited<ReturnType<typeof getProviderProfileCompleteness>>;
  let stripeStatus: Awaited<ReturnType<typeof getProviderStripeStatus>>;
  let bookingsResult: Awaited<ReturnType<typeof getProviderBookings>>;
  let reviews: Awaited<ReturnType<typeof getProviderReviews>>;
  let earningsResult: Awaited<ReturnType<typeof getProviderEarnings>>;
  let meetAndGreets: Awaited<ReturnType<typeof getProviderMeetAndGreets>>;
  let disputesResult: Awaited<ReturnType<typeof getDisputesForUser>>;
  let claimsResult: Awaited<ReturnType<typeof getClaimsForUser>>;
  try {
    [completeness, stripeStatus, bookingsResult, reviews, earningsResult, meetAndGreets, disputesResult, claimsResult] = await Promise.all([
      getProviderProfileCompleteness(),
      getProviderStripeStatus(),
      (async () => {
        await expireStaleBookings();
        return getProviderBookings();
      })(),
      getProviderReviews(),
      getProviderEarnings(),
      getProviderMeetAndGreets(),
      getDisputesForUser().then((r) => (r.error ? { disputes: [] } : r)),
      getClaimsForUser().then((r) => (r.error ? { claims: [] } : r)),
    ]);
  } catch (e) {
    console.error("ProviderDashboardPage data fetch", e);
    completeness = { showWizard: false, percentage: 0, profile: null, incompleteSteps: [] };
    stripeStatus = { hasProfile: false, hasStripeConnect: false };
    bookingsResult = { bookings: [] };
    reviews = { reviews: [], error: "Failed to load." };
    earningsResult = { earnings: null };
    meetAndGreets = { requested: [], confirmed: [], completed: [], error: "Failed to load." };
    disputesResult = { disputes: [] };
    claimsResult = { claims: [] };
  }

  if (completeness.showWizard && completeness.profile) {
    let areaPriceGuidance: Awaited<ReturnType<typeof getProviderAreaPriceGuidance>> = {};
    try {
      areaPriceGuidance = await getProviderAreaPriceGuidance(completeness.profile.district);
    } catch (e) {
      console.error("getProviderAreaPriceGuidance", e);
    }
    return (
      <ProviderOnboardingWizard
        initialProfile={completeness.profile}
        areaPriceGuidance={areaPriceGuidance}
      />
    );
  }

  const { bookings } = bookingsResult;
  const earnings = earningsResult.earnings ?? null;
  const { disputes: disputesList = [] } = disputesResult;
  const { claims: claimsList = [] } = claimsResult;
  const { requested = [], confirmed = [], completed = [] } = meetAndGreets.error ? {} : meetAndGreets;

  return (
    <ProviderDashboardClient
      stripeStatus={stripeStatus}
      initialBookings={bookings}
      initialReviews={reviews.reviews}
      initialEarnings={earnings}
      initialMeetAndGreets={{ requested, confirmed, completed }}
      initialDisputes={disputesList}
      initialClaims={claimsList}
      profileCompletenessPercentage={completeness.percentage}
    />
  );
}
