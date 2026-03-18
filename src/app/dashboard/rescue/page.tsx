import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getRescueOrgDashboard,
  getOrgListings,
  getOrgApplications,
  getOrgPlacements,
} from "./actions";
import { RescueDashboardClient } from "./RescueDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rescue Dashboard | Tinies",
  description: "Manage your adoption listings and inquiries.",
};

export default async function RescueDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard/rescue");
  }

  let org: Awaited<ReturnType<typeof getRescueOrgDashboard>>["org"] = null;
  let orgError: string | undefined;
  let listings: Awaited<ReturnType<typeof getOrgListings>>["listings"] = [];
  let listError: string | undefined;
  let applications: Awaited<ReturnType<typeof getOrgApplications>>["applications"] = [];
  let appError: string | undefined;
  let placements: Awaited<ReturnType<typeof getOrgPlacements>>["placements"] = [];
  try {
    const [dashboardResult, listingsResult, applicationsResult, placementsResult] = await Promise.all([
      getRescueOrgDashboard(),
      getOrgListings(),
      getOrgApplications(),
      getOrgPlacements(),
    ]);
    org = dashboardResult.org;
    orgError = dashboardResult.error;
    listings = listingsResult.listings;
    listError = listingsResult.error;
    applications = applicationsResult.applications;
    appError = applicationsResult.error;
    placements = placementsResult.placements ?? [];
  } catch (e) {
    console.error("RescueDashboardPage data fetch", e);
    orgError = "Failed to load dashboard.";
  }

  if (orgError) {
    return (
      <div
        className="min-h-screen px-4 py-20 sm:px-6"
        style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
      >
        <main className="mx-auto max-w-xl">
          <p className="text-sm" style={{ color: "var(--color-error)" }}>{orgError}</p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  if (!org) {
    return (
      <div
        className="min-h-screen px-4 py-20 sm:px-6"
        style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
      >
        <main className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h1
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            Rescue organisation dashboard
          </h1>
          <div
            className="mt-8 rounded-[var(--radius-lg)] border p-8"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
          >
            <p className="text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              You don&apos;t have a rescue organisation account yet. Rescue organisations can list adoptable animals, receive applications, and manage placements through Tinies.
            </p>
            <p className="mt-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              To register your organisation, get in touch with us. We&apos;ll set up your rescue profile and give you access to this dashboard. In the meantime, you can browse the platform as an adopter or pet owner.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/adopt"
                className="inline-flex h-10 items-center rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:opacity-90"
              >
                Browse adoptions
              </Link>
              <Link
                href="/for-rescues"
                className="inline-flex h-10 items-center rounded-[var(--radius-pill)] border px-5 text-sm font-semibold hover:bg-[var(--color-primary-50)]"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                For rescues
              </Link>
            </div>
          </div>
          <p className="mt-8">
            <Link href="/" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
              ← Back to home
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-12 sm:px-6 sm:py-16"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-normal"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          {org.name}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Manage your listings, adoption inquiries, and org profile.
        </p>
        {(listError || appError) && (
          <p className="mt-4 text-sm" style={{ color: "var(--color-error)" }}>
            {listError ?? appError}
          </p>
        )}
        <RescueDashboardClient
          org={org}
          listings={listings}
          applications={applications}
          placements={placements}
        />
        <p className="mt-10">
          <Link href="/" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
