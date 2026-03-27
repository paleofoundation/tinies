import type { Metadata } from "next";
import Link from "next/link";
import { getOwnerPets, getOwnerBookings, getOwnerRecurringBookings } from "./actions";
import { getOwnerMeetAndGreets } from "@/lib/meet-and-greet/actions";
import { getDisputesForUser, getClaimsForUser } from "@/lib/disputes/actions";
import { OwnerDashboardClient } from "./OwnerDashboardClient";
import { OwnerFavoritesSection } from "./OwnerFavoritesSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Dashboard",
  description: "Your pet care bookings and pets.",
};

export default async function OwnerDashboardPage() {
  let pets: Awaited<ReturnType<typeof getOwnerPets>>["pets"] = [];
  let error: string | undefined;
  let bookings: Awaited<ReturnType<typeof getOwnerBookings>>["bookings"] = [];
  let meetAndGreets: Awaited<ReturnType<typeof getOwnerMeetAndGreets>>["meetAndGreets"] = [];
  let disputesList: Awaited<ReturnType<typeof getDisputesForUser>>["disputes"] = [];
  let claimsList: Awaited<ReturnType<typeof getClaimsForUser>>["claims"] = [];
  let recurringList: Awaited<ReturnType<typeof getOwnerRecurringBookings>>["recurring"] = [];
  try {
    const [petsResult, bookingsResult, meetResult, disputesResult, claimsResult, recurringResult] = await Promise.all([
      getOwnerPets(),
      getOwnerBookings(),
      getOwnerMeetAndGreets().then((r) => (r.error ? { meetAndGreets: [] } : r)),
      getDisputesForUser().then((r) => (r.error ? { disputes: [] } : r)),
      getClaimsForUser().then((r) => (r.error ? { claims: [] } : r)),
      getOwnerRecurringBookings().then((r) => (r.error ? { recurring: [] } : r)),
    ]);
    pets = petsResult.pets;
    error = petsResult.error;
    bookings = bookingsResult.bookings;
    meetAndGreets = meetResult.meetAndGreets ?? [];
    disputesList = disputesResult.disputes ?? [];
    claimsList = claimsResult.claims ?? [];
    recurringList = recurringResult.recurring ?? [];
  } catch (e) {
    console.error("OwnerDashboardPage data fetch", e);
    error = "Failed to load dashboard.";
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main
        className="mx-auto px-4 py-20 sm:px-6 sm:py-20"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <h1
          className="font-normal"
          style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "var(--text-2xl)",
            color: "var(--color-text)",
          }}
        >
          Owner dashboard
        </h1>
        <p className="mt-2" style={{ color: "var(--color-text-secondary)" }}>
          Manage your pets and bookings.
        </p>

        {error && (
          <p className="mt-4 text-sm" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        )}

        <OwnerFavoritesSection />

        <OwnerDashboardClient
          initialPets={pets}
          initialBookings={bookings}
          initialMeetAndGreets={meetAndGreets}
          initialDisputes={disputesList}
          initialClaims={claimsList}
          initialRecurring={recurringList}
        />

        <p className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/dashboard/owner/giving"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            Giving settings
          </Link>
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
