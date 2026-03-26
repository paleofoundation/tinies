import Link from "next/link";
import { Suspense } from "react";
import { ImageIcon, Share2 } from "lucide-react";
import type { AdoptionListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAllPlacements } from "./adoptions/actions";
import { AdoptionPipelineSection } from "./AdoptionPipelineSection";
import { getOpenDisputesForAdmin, getOpenClaimsForAdmin } from "@/lib/disputes/actions";
import { DisputesClaimsSection } from "./DisputesClaimsSection";
import { AdminQRCodeSection } from "./AdminQRCodeSection";
import { getProvidersPendingVerification, getRecentlyVerifiedProviders } from "./provider-verification/actions";
import { ProviderVerificationSection } from "./provider-verification/ProviderVerificationSection";
import { getAllRescueOrgs } from "./rescue-org-actions";
import { RescueOrgVerifyButton } from "./rescue-orgs/RescueOrgVerifyButton";
import { getRevenueOverview, getRevenueByMonth, getCurrentVsLastMonth } from "@/lib/admin/revenue-actions";
import { AdminRevenueSection } from "./AdminRevenueSection";
import { getDistributionPreview, getPastDistributions } from "@/lib/giving/distribution-actions";
import { AdminGivingFundDistributionSection } from "./AdminGivingFundDistributionSection";

// TODO: enforce admin role – redirect or 403 if user is not admin (e.g. check session user role or app_metadata)

export const dynamic = "force-dynamic";

type AdminListingSummaryRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  estimatedAge: string | null;
  status: AdoptionListingStatus;
  createdAt: Date;
};

type AdminCharityQrRow = { id: string; name: string; slug: string };

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const placementStatus = typeof params.placementStatus === "string" ? params.placementStatus : undefined;

  let placements: Awaited<ReturnType<typeof getAllPlacements>>["placements"] = [];
  let openDisputes: Awaited<ReturnType<typeof getOpenDisputesForAdmin>>["disputes"] = [];
  let openClaims: Awaited<ReturnType<typeof getOpenClaimsForAdmin>>["claims"] = [];
  let listings: AdminListingSummaryRow[] = [];
  let charitiesForQr: AdminCharityQrRow[] = [];
  let pendingVerification: Awaited<ReturnType<typeof getProvidersPendingVerification>> = [];
  let recentlyVerified: Awaited<ReturnType<typeof getRecentlyVerifiedProviders>> = [];
  let rescueOrgs: Awaited<ReturnType<typeof getAllRescueOrgs>>["orgs"] = [];
  let rescueOrgsError: string | undefined;
  let pendingRescueVerificationCount = 0;
  let revenueOverview: Awaited<ReturnType<typeof getRevenueOverview>> | null = null;
  let revenueComparison: Awaited<ReturnType<typeof getCurrentVsLastMonth>> | null = null;
  let revenueMonthly: Awaited<ReturnType<typeof getRevenueByMonth>> | null = null;
  let revenueError: string | undefined;
  let givingDistributionPreview: Awaited<ReturnType<typeof getDistributionPreview>> | null = null;
  let givingPastDistributions: Awaited<ReturnType<typeof getPastDistributions>>["distributions"] = [];
  let givingDistributionFatalError: string | undefined;
  let givingPastDistributionsError: string | undefined;

  try {
    const placementsResult = await getAllPlacements(placementStatus);
    placements = placementsResult.placements;
  } catch (e) {
    console.error("AdminDashboardPage placements", e);
  }

  try {
    const disputesResult = await getOpenDisputesForAdmin();
    openDisputes = disputesResult.error ? [] : (disputesResult.disputes ?? []);
  } catch (e) {
    console.error("AdminDashboardPage disputes", e);
  }

  try {
    const claimsResult = await getOpenClaimsForAdmin();
    openClaims = claimsResult.error ? [] : (claimsResult.claims ?? []);
  } catch (e) {
    console.error("AdminDashboardPage claims", e);
  }

  try {
    listings = await prisma.adoptionListing.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        estimatedAge: true,
        status: true,
        createdAt: true,
      },
    });
  } catch (e) {
    console.error("AdminDashboardPage listings", e);
  }

  try {
    charitiesForQr = await prisma.charity.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
  } catch (e) {
    console.error("AdminDashboardPage charities", e);
  }

  try {
    pendingVerification = await getProvidersPendingVerification();
  } catch (e) {
    console.error("AdminDashboardPage pending verification", e);
  }

  try {
    recentlyVerified = await getRecentlyVerifiedProviders(10);
  } catch (e) {
    console.error("AdminDashboardPage recently verified", e);
  }

  try {
    const rescueResult = await getAllRescueOrgs();
    rescueOrgs = rescueResult.orgs;
    rescueOrgsError = rescueResult.error;
  } catch (e) {
    console.error("AdminDashboardPage rescue orgs list", e);
    rescueOrgsError = "Failed to load rescue organisations.";
  }

  try {
    pendingRescueVerificationCount = await prisma.rescueOrg.count({ where: { verified: false } });
  } catch (e) {
    console.error("AdminDashboardPage rescue org count", e);
  }

  try {
    const [ov, cmp, mo] = await Promise.all([
      getRevenueOverview(),
      getCurrentVsLastMonth(),
      getRevenueByMonth(12),
    ]);
    revenueOverview = ov;
    revenueComparison = cmp;
    revenueMonthly = mo;
  } catch (e) {
    console.error("AdminDashboardPage revenue", e);
    revenueError = "Failed to load revenue data.";
  }

  try {
    const [preview, pastResult] = await Promise.all([getDistributionPreview(), getPastDistributions()]);
    givingDistributionPreview = preview;
    givingPastDistributions = pastResult.distributions;
    if (pastResult.error) givingPastDistributionsError = pastResult.error;
  } catch (e) {
    console.error("AdminDashboardPage giving distribution", e);
    givingDistributionFatalError = "Failed to load giving fund distribution data.";
  }

  const statusLabel: Record<string, string> = {
    available: "Available",
    memorial: "Memorial",
    application_pending: "Application Pending",
    matched: "Matched",
    in_transit: "In Transit",
    adopted: "Adopted",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 sm:py-20" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-normal sm:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          Admin dashboard
        </h1>
        <p className="mt-1" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Manage adoption listings and platform settings.
        </p>

        {revenueError ? (
          <p className="mt-6 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-error)" }}>
            {revenueError}
          </p>
        ) : revenueOverview && revenueComparison && revenueMonthly ? (
          <AdminRevenueSection overview={revenueOverview} comparison={revenueComparison} monthlyRows={revenueMonthly} />
        ) : null}

        {givingDistributionFatalError ? (
          <AdminGivingFundDistributionSection
            preview={{
              unallocatedCents: 0,
              pendingOrProcessingLockedCents: 0,
              availableForDistributionCents: 0,
              platformCommissionToFundCents: 0,
              distributedCompletedCents: 0,
              charityRows: [],
              currentMonthStartIso: new Date().toISOString(),
              canApprove: false,
              approveBlockedReason: givingDistributionFatalError,
            }}
            past={[]}
            loadError={givingDistributionFatalError}
          />
        ) : givingDistributionPreview ? (
          <AdminGivingFundDistributionSection
            preview={givingDistributionPreview}
            past={givingPastDistributions}
            pastLoadError={givingPastDistributionsError}
          />
        ) : null}

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/dashboard/admin/feedback"
            className="inline-flex h-10 items-center rounded-[var(--radius-pill)] border px-4 text-sm font-semibold hover:bg-[var(--color-primary-50)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
          >
            Feedback
          </Link>
          <Link
            href="/dashboard/admin/campaigns"
            className="inline-flex h-10 items-center rounded-[var(--radius-pill)] border px-4 text-sm font-semibold hover:bg-[var(--color-primary-50)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
          >
            Rescue campaigns
          </Link>
          <Link
            href="/dashboard/admin/invite-charity"
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] border-2 px-6 font-semibold transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
          >
            Invite Charity
          </Link>
        </div>

        {/* Site images */}
        <section
          className="mt-8 rounded-[var(--radius-lg)] border p-8"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
                style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
                aria-hidden
              >
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <h2
                  className="text-lg font-normal"
                  style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
                >
                  Site Images
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  Upload and manage all images on the site.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/admin/images"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
            >
              Manage images
            </Link>
          </div>
        </section>

        {/* Social links (footer) */}
        <section
          className="mt-8 rounded-[var(--radius-lg)] border p-8"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
                style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
                aria-hidden
              >
                <Share2 className="h-6 w-6" />
              </div>
              <div>
                <h2
                  className="text-lg font-normal"
                  style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
                >
                  Social links
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  LinkedIn, Facebook, X, and Instagram URLs for the footer. Icons show for visitors; empty fields stay inactive until you add a link.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/admin/social-links"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border-2 px-6 font-semibold transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              Edit social links
            </Link>
          </div>
        </section>

        {/* Adoption Listings tab */}
        <section className="mt-8 rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="text-lg font-normal"
              style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
            >
              Adoption Listings
            </h2>
            <Link
              href="/dashboard/admin/adoptions/new"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
            >
              Add New Listing
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="pb-3 pr-4 text-left font-semibold ">Name</th>
                  <th className="pb-3 pr-4 text-left font-semibold ">Species</th>
                  <th className="pb-3 pr-4 text-left font-semibold ">Breed</th>
                  <th className="pb-3 pr-4 text-left font-semibold ">Age</th>
                  <th className="pb-3 pr-4 text-left font-semibold ">Status</th>
                  <th className="pb-3 pr-4 text-left font-semibold ">Date added</th>
                  <th className="pb-3 text-left font-semibold ">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center ">
                      No adoption listings yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  listings.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="py-3 pr-4 font-medium ">{row.name}</td>
                      <td className="py-3 pr-4 ">{row.species}</td>
                      <td className="py-3 pr-4 ">{row.breed ?? "—"}</td>
                      <td className="py-3 pr-4 ">{row.estimatedAge ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 font-medium" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)", borderColor: "var(--color-primary-200)" }}>
                          {statusLabel[row.status] ?? row.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 ">
                        {new Date(row.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/dashboard/admin/adoptions/${row.id}/edit`}
                          className="font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rescue Organisations */}
        <section
          className="mt-8 rounded-[var(--radius-lg)] border p-8"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="text-lg font-normal"
              style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
            >
              Rescue Organisations
            </h2>
            <Link
              href="/dashboard/admin/rescue-orgs/new"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
            >
              Register New Rescue Org
            </Link>
          </div>

          {pendingRescueVerificationCount > 0 && (
            <p
              className="mt-3 text-sm font-medium"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
            >
              {pendingRescueVerificationCount} rescue organisation
              {pendingRescueVerificationCount === 1 ? "" : "s"} pending verification — use the table below to
              review and verify.
            </p>
          )}

          {rescueOrgsError && (
            <p className="mt-4 text-sm" style={{ color: "var(--color-error)", fontFamily: "var(--font-body), sans-serif" }}>
              {rescueOrgsError}
            </p>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="pb-3 pr-4 text-left font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    Name
                  </th>
                  <th className="pb-3 pr-4 text-left font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    Location
                  </th>
                  <th className="pb-3 pr-4 text-left font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    Verified
                  </th>
                  <th className="pb-3 pr-4 text-left font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    Listings
                  </th>
                  <th className="pb-3 pr-4 text-left font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    Date added
                  </th>
                  <th className="pb-3 text-left font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rescueOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                      {rescueOrgsError ? "Could not load organisations." : "No rescue organisations yet. Register one to get started."}
                    </td>
                  </tr>
                ) : (
                  rescueOrgs.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="py-3 pr-4 font-medium" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                        {row.name}
                      </td>
                      <td className="py-3 pr-4" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                        {row.location ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: row.verified ? "var(--color-primary-50)" : "var(--color-background)",
                            color: row.verified ? "var(--color-primary)" : "var(--color-text-secondary)",
                            borderColor: row.verified ? "var(--color-primary-200)" : "var(--color-border)",
                            fontFamily: "var(--font-body), sans-serif",
                          }}
                        >
                          {row.verified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 pr-4" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                        {row.listingCount}
                      </td>
                      <td className="py-3 pr-4" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                        {new Date(row.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/dashboard/admin/rescue-orgs/${row.id}/edit`}
                            className="font-semibold hover:underline"
                            style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
                          >
                            Edit
                          </Link>
                          <span style={{ color: "var(--color-border)" }} aria-hidden>
                            |
                          </span>
                          <RescueOrgVerifyButton orgId={row.id} verified={row.verified} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Adoption Pipeline */}
        <Suspense fallback={<div className="mt-8 rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>Loading pipeline…</div>}>
          <AdoptionPipelineSection placements={placements} />
        </Suspense>

        <DisputesClaimsSection initialDisputes={openDisputes} initialClaims={openClaims} />

        <ProviderVerificationSection pending={pendingVerification} recentlyVerified={recentlyVerified} />

        <AdminQRCodeSection charities={charitiesForQr} />

        <p className="mt-8">
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
