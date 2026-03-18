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

export default async function ProviderDashboardPage() {
  const [completeness, stripeStatus, bookingsResult, reviews, earningsResult, meetAndGreets, disputesResult, claimsResult] = await Promise.all([
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

  if (completeness.showWizard && completeness.profile) {
    const areaPriceGuidance = await getProviderAreaPriceGuidance(completeness.profile.district);
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
      initialReviews={reviews}
      initialEarnings={earnings}
      initialMeetAndGreets={{ requested, confirmed, completed }}
      initialDisputes={disputesList}
      initialClaims={claimsList}
      profileCompletenessPercentage={completeness.percentage}
    />
  );
}
