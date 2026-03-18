import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getAllPlacements } from "./adoptions/actions";
import { AdoptionPipelineSection } from "./AdoptionPipelineSection";

// TODO: enforce admin role – redirect or 403 if user is not admin (e.g. check session user role or app_metadata)

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const placementStatus = typeof params.placementStatus === "string" ? params.placementStatus : undefined;
  const { placements } = await getAllPlacements(placementStatus);

  const listings = await prisma.adoptionListing.findMany({
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

  const statusLabel: Record<string, string> = {
    available: "Available",
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

        {/* Adoption Pipeline */}
        <Suspense fallback={<div className="mt-8 rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>Loading pipeline…</div>}>
          <AdoptionPipelineSection placements={placements} />
        </Suspense>

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
