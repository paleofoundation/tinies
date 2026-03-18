import {
  getProviderStripeStatus,
  getProviderBookings,
  getProviderReviews,
  expireStaleBookings,
} from "./actions";
import { getProviderMeetAndGreets } from "@/lib/meet-and-greet/actions";
import { ProviderDashboardClient } from "./ProviderDashboardClient";

export default async function ProviderDashboardPage() {
  const [stripeStatus, { bookings }, { reviews }, meetAndGreets] = await Promise.all([
    getProviderStripeStatus(),
    (async () => {
      await expireStaleBookings();
      return getProviderBookings();
    })(),
    getProviderReviews(),
    getProviderMeetAndGreets(),
  ]);
  const { requested = [], confirmed = [], completed = [] } = meetAndGreets.error ? {} : meetAndGreets;
  return (
    <ProviderDashboardClient
      stripeStatus={stripeStatus}
      initialBookings={bookings}
      initialReviews={reviews}
      initialMeetAndGreets={{ requested, confirmed, completed }}
    />
  );
}
