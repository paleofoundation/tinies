import Link from "next/link";
import { prisma } from "@/lib/prisma";

// TODO: enforce admin role – redirect or 403 if user is not admin (e.g. check session user role or app_metadata)

export default async function AdminDashboardPage() {
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
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 sm:py-20">
        <h1
          className="text-2xl font-normal text-[#1B2432] sm:text-3xl"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          Admin dashboard
        </h1>
        <p className="mt-1 text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
          Manage adoption listings and platform settings.
        </p>

        {/* Adoption Listings tab */}
        <section className="mt-8 rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="text-lg font-normal text-[#1B2432]"
              style={{ fontFamily: "var(--tiny-font-display), serif" }}
            >
              Adoption Listings
            </h2>
            <Link
              href="/dashboard/admin/adoptions/new"
              className="inline-flex items-center justify-center rounded-[999px] bg-[#0A6E5C] px-5 h-12 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              Add New Listing
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="pb-3 pr-4 text-left font-semibold text-[#1B2432]">Name</th>
                  <th className="pb-3 pr-4 text-left font-semibold text-[#1B2432]">Species</th>
                  <th className="pb-3 pr-4 text-left font-semibold text-[#1B2432]">Breed</th>
                  <th className="pb-3 pr-4 text-left font-semibold text-[#1B2432]">Age</th>
                  <th className="pb-3 pr-4 text-left font-semibold text-[#1B2432]">Status</th>
                  <th className="pb-3 pr-4 text-left font-semibold text-[#1B2432]">Date added</th>
                  <th className="pb-3 text-left font-semibold text-[#1B2432]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                      No adoption listings yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  listings.map((row) => (
                    <tr key={row.id} className="border-b border-[#E5E7EB] last:border-0">
                      <td className="py-3 pr-4 font-medium text-[#1B2432]">{row.name}</td>
                      <td className="py-3 pr-4 text-[#6B7280]">{row.species}</td>
                      <td className="py-3 pr-4 text-[#6B7280]">{row.breed ?? "—"}</td>
                      <td className="py-3 pr-4 text-[#6B7280]">{row.estimatedAge ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-[999px] bg-[#0A6E5C]/15 px-2.5 py-0.5 text-[#0A6E5C] font-medium">
                          {statusLabel[row.status] ?? row.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[#6B7280]">
                        {new Date(row.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/dashboard/admin/adoptions/${row.id}/edit`}
                          className="font-semibold text-[#0A6E5C] hover:underline"
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

        <p className="mt-8">
          <Link
            href="/"
            className="text-sm text-[#6B7280] hover:text-[#1B2432] hover:underline"
            style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
