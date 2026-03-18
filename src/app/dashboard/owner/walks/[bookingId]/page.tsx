import { redirect } from "next/navigation";
import { getWalkRoute } from "../../actions";
import { WatchLiveWalkClient } from "./WatchLiveWalkClient";

type Props = { params: Promise<{ bookingId: string }> };

export default async function OwnerWatchLiveWalkPage({ params }: Props) {
  const { bookingId } = await params;
  const { data, error } = await getWalkRoute(bookingId);
  if (error || !data) {
    redirect("/dashboard/owner?tab=bookings");
  }
  return (
    <WatchLiveWalkClient
      bookingId={bookingId}
      initialRoute={data.walkRoute}
      initialWalkActivities={data.walkActivities}
      initialStartedAt={data.walkStartedAt}
      initialEndedAt={data.walkEndedAt}
      initialStatus={data.status}
    />
  );
}
