import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerGivingData } from "@/lib/giving/actions";
import { OwnerGivingSettings } from "./OwnerGivingSettings";

export const metadata: Metadata = {
  title: "Giving Settings | Tinies",
  description: "Preferred charity, round-up, Guardian subscription, and giving history.",
};

export default async function OwnerGivingPage() {
  const data = await getOwnerGivingData();
  if (!data) redirect("/login?next=/dashboard/owner/giving");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-8 sm:px-6" style={{ maxWidth: "var(--max-width)" }}>
        <Link
          href="/dashboard/owner"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          ← Owner dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Giving settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Preferred charity, round-up at checkout, Guardian subscription, and your giving history.
        </p>

        <OwnerGivingSettings data={data} />

        {/* Giving history */}
        <section className="mt-10 rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Your giving history</h2>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: "var(--color-secondary)" }}>
            €{(data.totalDonatedCents / 100).toFixed(2)} total donated
          </p>
          {data.donationsByMonth.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>By month</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {data.donationsByMonth.slice(-12).reverse().map((row) => (
                  <li key={`${row.year}-${row.month}`} className="flex justify-between">
                    <span style={{ color: "var(--color-text)" }}>
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][row.month - 1]} {row.year}
                    </span>
                    <span className="tabular-nums" style={{ color: "var(--color-text)" }}>€{(row.totalCents / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.donationsByCharity.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>By charity</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {data.donationsByCharity.map((row) => (
                  <li key={row.charityId ?? "fund"} className="flex justify-between">
                    <span style={{ color: "var(--color-text)" }}>{row.charityName ?? "Tinies Giving Fund"}</span>
                    <span className="tabular-nums" style={{ color: "var(--color-text)" }}>€{(row.totalCents / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.totalDonatedCents === 0 && (
            <p className="mt-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>No donations yet. Round up at your next booking or make a one-time donation on the Giving page.</p>
          )}
        </section>
      </main>
    </div>
  );
}
