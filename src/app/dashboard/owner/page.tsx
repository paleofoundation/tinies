import type { Metadata } from "next";
import Link from "next/link";
import { getOwnerPets, getOwnerBookings } from "./actions";
import { getOwnerMeetAndGreets } from "@/lib/meet-and-greet/actions";
import { OwnerDashboardClient } from "./OwnerDashboardClient";

export const metadata: Metadata = {
  title: "Owner Dashboard | Tinies",
  description: "Your pet care bookings and pets.",
};

export default async function OwnerDashboardPage() {
  const [{ pets, error }, { bookings }, { meetAndGreets = [] }] = await Promise.all([
    getOwnerPets(),
    getOwnerBookings(),
    getOwnerMeetAndGreets().then((r) => (r.error ? { meetAndGreets: [] } : r)),
  ]);

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

        <OwnerDashboardClient initialPets={pets} initialBookings={bookings} initialMeetAndGreets={meetAndGreets} />

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
