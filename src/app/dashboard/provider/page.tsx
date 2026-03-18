import {
  getProviderStripeStatus,
  getProviderBookings,
  getProviderReviews,
  expireStaleBookings,
} from "./actions";
import { getProviderMeetAndGreets } from "@/lib/meet-and-greet/actions";
import { getDisputesForUser, getClaimsForUser } from "@/lib/disputes/actions";
import { ProviderDashboardClient } from "./ProviderDashboardClient";

export default async function ProviderDashboardPage() {
  const [stripeStatus, { bookings }, { reviews }, meetAndGreets, { disputes: disputesList = [] }, { claims: claimsList = [] }] = await Promise.all([
    getProviderStripeStatus(),
    (async () => {
      await expireStaleBookings();
      return getProviderBookings();
    })(),
    getProviderReviews(),
    getProviderMeetAndGreets(),
    getDisputesForUser().then((r) => (r.error ? { disputes: [] } : r)),
    getClaimsForUser().then((r) => (r.error ? { claims: [] } : r)),
  ]);
  const { requested = [], confirmed = [], completed = [] } = meetAndGreets.error ? {} : meetAndGreets;
  return (
    <ProviderDashboardClient
      stripeStatus={stripeStatus}
      initialBookings={bookings}
      initialReviews={reviews}
      initialMeetAndGreets={{ requested, confirmed, completed }}
      initialDisputes={disputesList}
      initialClaims={claimsList}
    />
  );
}
