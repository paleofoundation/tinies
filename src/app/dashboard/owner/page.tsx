import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Owner Dashboard | Tinies",
  description: "Your pet care bookings and pets.",
};

export default function OwnerDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 sm:py-20">
        <h1 className="text-2xl font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Owner dashboard</h1>
        <p className="mt-2 text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
          Your bookings and pets will appear here.
        </p>
        <p className="mt-6">
          <Link href="/" className="text-[#0A6E5C] font-semibold hover:underline" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
