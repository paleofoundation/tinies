import type { Metadata } from "next";
import { AdoptionListingStatus } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { withQueryTimeout } from "@/lib/utils/with-query-timeout";
import { RescueDirectoryCard, type RescueDirectoryCardOrg } from "./RescueDirectoryCard";
import { getCanonicalSiteOrigin } from "@/lib/constants/site-url";

const BASE_URL = getCanonicalSiteOrigin();

export const metadata: Metadata = {
  title: "Rescue partners",
  description: "Verified rescue organisations on Tinies in Cyprus — adoption listings, campaigns, and ways to help.",
  alternates: { canonical: `${BASE_URL}/rescue` },
  openGraph: {
    title: "Rescue partners | Tinies",
    description: "Verified rescue organisations on Tinies in Cyprus — adoption listings, campaigns, and ways to help.",
    url: `${BASE_URL}/rescue`,
    siteName: "Tinies",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const HOME_Y = "py-[clamp(4rem,8vw,8rem)]";
const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

const listingInCareFilter = {
  active: true,
  status: {
    notIn: [AdoptionListingStatus.adopted, AdoptionListingStatus.memorial],
  },
};

function formatSpeciesLabel(species: string[]): string {
  if (species.length === 0) return "Animals";
  const norm = [...new Set(species.map((s) => s.toLowerCase().trim()).filter(Boolean))];
  if (norm.length === 1) {
    const s = norm[0];
    if (s === "cat" || s === "cats") return "Cats";
    if (s === "dog" || s === "dogs") return "Dogs";
    return species[0].charAt(0).toUpperCase() + species[0].slice(1);
  }
  if (norm.length === 2 && norm.includes("cat") && norm.includes("dog")) return "Dogs & Cats";
  if (norm.every((x) => x === "cat" || x === "cats")) return "Cats";
  if (norm.every((x) => x === "dog" || x === "dogs")) return "Dogs";
  return "Mixed species";
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.19l-3.72-3.72a.75.75 0 111.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type RescueDirectoryOrgRow = {
  id: string;
  slug: string;
  name: string;
  mission: string | null;
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  district: string | null;
  location: string | null;
  verified: boolean;
  totalAnimalsRescued: number | null;
  _count: {
    listings: number;
    campaigns: number;
  };
};

export default async function RescuePartnersPage() {
  let orgRows: RescueDirectoryOrgRow[] = [];

  let donationSumCents = 0;
  let adoptedAnimalsCount = 0;
  let speciesGroups: { orgId: string; species: string }[] = [];

  try {
    const [orgs, donationAgg, adoptedCount, speciesGb] = await Promise.all([
      withQueryTimeout(
        prisma.rescueOrg.findMany({
          where: { verified: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            slug: true,
            name: true,
            mission: true,
            logoUrl: true,
            coverPhotoUrl: true,
            district: true,
            location: true,
            verified: true,
            totalAnimalsRescued: true,
            _count: {
              select: {
                listings: { where: listingInCareFilter },
                campaigns: { where: { status: "active" } },
              },
            },
          },
        }),
        [] as RescueDirectoryOrgRow[],
        "rescue-partners:list",
        5000
      ),
      withQueryTimeout(
        prisma.donation.aggregate({ _sum: { amount: true } }),
        { _sum: { amount: null } },
        "rescue-partners:donations",
        5000
      ),
      withQueryTimeout(
        prisma.adoptionListing.count({
          where: {
            org: { verified: true },
            status: AdoptionListingStatus.adopted,
          },
        }),
        0,
        "rescue-partners:adopted",
        5000
      ),
      withQueryTimeout(
        prisma.adoptionListing.groupBy({
          by: ["orgId", "species"],
          where: {
            org: { verified: true },
            active: true,
            status: {
              notIn: [AdoptionListingStatus.adopted, AdoptionListingStatus.memorial],
            },
          },
        }),
        [] as { orgId: string; species: string }[],
        "rescue-partners:species",
        5000
      ),
    ]);

    orgRows = orgs;
    donationSumCents = donationAgg._sum.amount ?? 0;
    adoptedAnimalsCount = adoptedCount;
    speciesGroups = speciesGb;
  } catch (e) {
    console.error("RescuePartnersPage data", e);
  }

  const speciesByOrgId = new Map<string, string[]>();
  for (const row of speciesGroups) {
    const list = speciesByOrgId.get(row.orgId) ?? [];
    list.push(row.species);
    speciesByOrgId.set(row.orgId, list);
  }

  const cardOrgs: RescueDirectoryCardOrg[] = orgRows.map((o) => ({
    slug: o.slug,
    name: o.name,
    mission: o.mission,
    logoUrl: o.logoUrl,
    coverPhotoUrl: o.coverPhotoUrl,
    district: o.district,
    location: o.location,
    verified: o.verified,
    inCareListingCount: o._count.listings,
    totalAnimalsRescued: o.totalAnimalsRescued,
    activeCampaignCount: o._count.campaigns,
    speciesLabel: formatSpeciesLabel(speciesByOrgId.get(o.id) ?? []),
  }));

  let totalInCare = orgRows.reduce((s, o) => s + o._count.listings, 0);
  if (totalInCare === 0) {
    totalInCare = orgRows.reduce((s, o) => s + (o.totalAnimalsRescued ?? 0), 0);
  }

  const partnerCount = orgRows.length;
  const inCareDisplay = totalInCare > 0 ? `${totalInCare}+` : "0";
  const donatedDisplay = eur.format(donationSumCents / 100);
  const adoptedDisplay = adoptedAnimalsCount > 0 ? `${adoptedAnimalsCount}+` : String(adoptedAnimalsCount);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <div className="border-b bg-[var(--color-background)]" style={{ borderColor: BORDER_TEAL_15 }}>
        <div className={`${HOME_INNER} pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2.5rem,5vw,4rem)]`}>
          <p
            className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-secondary)" }}
          >
            Directory
          </p>
          <h1
            className="mt-4 max-w-[1100px] text-[clamp(2.5rem,8vw,5.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            <span className="block" style={{ color: "#1C1C1C" }}>
              our rescue
            </span>{" "}
            <span className="block" style={{ color: "var(--color-primary)" }}>
              partners
            </span>
          </h1>
          <p
            className="mt-5 max-w-[600px] text-[1.125rem] leading-[1.7]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
          >
            Verified organisations on Tinies. Open a profile to read their story, support a campaign, or browse animals ready for adoption.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/adopt"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[0.875rem] font-semibold text-white shadow-[0_4px_16px_rgba(10,128,128,0.08)] transition-transform hover:-translate-y-0.5"
              style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-secondary)" }}
            >
              Browse adoptable animals
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/giving"
              className="inline-flex items-center gap-2 rounded-full border bg-[var(--color-background)] px-7 py-3.5 text-[0.875rem] font-semibold transition-colors hover:bg-[var(--color-primary-50)]"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                borderColor: "var(--color-primary)",
                color: "var(--color-primary)",
              }}
            >
              Tinies Giving
            </Link>
          </div>
        </div>
      </div>

      <section className="text-white" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className={`${HOME_INNER} py-[clamp(2.5rem,5vw,4rem)]`}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-6">
            {[
              [String(partnerCount), "Rescue partners"],
              [inCareDisplay, "Animals in care"],
              [donatedDisplay, "Donated through Tinies"],
              [adoptedDisplay, "Animals adopted"],
            ].map(([val, label]) => (
              <div key={label} className="border-t border-white/20 pt-5">
                <div
                  className="text-[clamp(1.75rem,4vw,2.5rem)] font-black uppercase leading-tight tracking-[-0.03em]"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {val}
                </div>
                <div
                  className="mt-1.5 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
                  style={{ color: "rgba(255, 255, 255, 0.72)", fontFamily: "var(--font-display), sans-serif" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={HOME_Y} style={{ backgroundColor: "var(--color-primary-50)" }}>
        <div className={HOME_INNER}>
          <p
            className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-primary)" }}
          >
            Verified rescues
          </p>
          <h2
            className="mb-12 max-w-[900px] text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
          >
            meet the
            <br />
            <span style={{ color: "var(--color-secondary)" }}>organisations</span>
          </h2>

          {cardOrgs.length === 0 ? (
            <p className="text-center text-sm" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
              Verified rescue partners will appear here as they join the platform.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {cardOrgs.map((org) => (
                <RescueDirectoryCard key={org.slug} org={org} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`${HOME_Y} bg-[var(--color-background)]`}>
        <div className={HOME_INNER}>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <p
                className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
                style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-primary)" }}
              >
                How it works
              </p>
              <h2
                className="mt-4 max-w-[520px] text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
                style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
              >
                rescues list.
                <br />
                <span style={{ color: "var(--color-secondary)" }}>tinies funds.</span>
              </h2>
              <p
                className="mt-4 max-w-[440px] text-base leading-[1.7]"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
              >
                Rescue organisations list their animals for adoption and run fundraising campaigns. Tinies provides the platform and directs 90% of marketplace commission to fund their daily operations.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ["01", "List animals", "Rescues create profiles for each animal — photos, personality, medical status, adoption requirements."],
                ["02", "Run campaigns", "Set fundraising goals for food, vet care, shelter. Donors give directly through the platform."],
                ["03", "Receive funding", "90% of every Tinies booking commission goes to rescue partners. Plus 100% of direct donations."],
                ["04", "Coordinate adoption", "Handle vet prep, documentation, and transport. Tinies connects adopters to rescues in one place."],
              ].map(([num, title, body]) => (
                <div
                  key={num}
                  className="rounded-[22px] border bg-[var(--color-background)] p-6 shadow-[0_2px_8px_rgba(10,128,128,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
                  style={{ borderColor: BORDER_TEAL_15 }}
                >
                  <div
                    className="text-[2rem] font-black leading-none tracking-[-0.03em]"
                    style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-primary)" }}
                  >
                    {num}
                  </div>
                  <div className="mt-3 text-base font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    {title}
                  </div>
                  <p className="mt-2.5 text-[0.8125rem] leading-[1.7]" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={HOME_Y} style={{ backgroundColor: "var(--color-secondary)", color: "#FFFFFF" }}>
        <div className={`${HOME_INNER} grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]`}>
          <div>
            <p
              className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
              style={{ fontFamily: "var(--font-display), sans-serif", color: "rgba(255, 255, 255, 0.6)" }}
            >
              For rescue organisations
            </p>
            <h2
              className="mt-3 max-w-[560px] text-[clamp(2rem,6vw,3.75rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              are you a
              <br />
              <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>rescue?</span>
            </h2>
            <p className="mt-4 max-w-[460px] text-base leading-[1.7]" style={{ color: "rgba(255, 255, 255, 0.78)", fontFamily: "var(--font-body), sans-serif" }}>
              List your animals for adoption, run fundraising campaigns, and receive funding from the Tinies marketplace commission. Free to join. Verified and transparent.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/for-rescues"
                className="inline-flex rounded-full bg-white px-7 py-3.5 text-[0.875rem] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-95"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}
              >
                Learn more
              </Link>
              <Link
                href="/dashboard/rescue/listings/new"
                className="inline-flex rounded-full border border-white/30 bg-transparent px-7 py-3.5 text-[0.875rem] font-semibold text-white transition-colors hover:bg-white/10"
                style={{ fontFamily: "var(--font-body), sans-serif" }}
              >
                List your animals
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Free platform", "No fees to list animals or run campaigns"],
              ["Direct donations", "100% of donor contributions reach you"],
              ["Marketplace funding", "90% of Tinies commission supports your work"],
              ["Adoption tools", "Manage enquiries, coordinate transport, track progress"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/15 p-[22px]"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(4px)" }}
              >
                <div className="text-[0.9375rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                  {title}
                </div>
                <p className="mt-2 text-[0.75rem] leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.65)", fontFamily: "var(--font-body), sans-serif" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${HOME_Y} text-center text-white`} style={{ backgroundColor: "var(--color-primary)" }}>
        <div className={HOME_INNER}>
          <p
            className="mb-4 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "rgba(255, 255, 255, 0.6)" }}
          >
            Support their work
          </p>
          <h2
            className="mx-auto max-w-[900px] text-[clamp(2rem,6vw,3.75rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            become a
            <br />
            <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>tinies guardian</span>
          </h2>
          <p
            className="mx-auto mt-5 max-w-[500px] text-base leading-[1.7]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255, 255, 255, 0.72)" }}
          >
            From €3/month, 100% goes directly to the rescue you choose. No admin fees. No middlemen. Just real support for real animals.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/giving/become-a-guardian"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[0.9375rem] font-bold shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
            >
              <HeartIcon className="h-[18px] w-[18px]" />
              Become a Guardian
            </Link>
            <Link
              href="/giving"
              className="inline-flex items-center rounded-full border border-white/30 bg-transparent px-7 py-3.5 text-[0.875rem] font-semibold text-white transition-colors hover:bg-white/10"
              style={{ fontFamily: "var(--font-body), sans-serif" }}
            >
              View all campaigns
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y" style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}>
        <div className={`${HOME_INNER} flex flex-wrap items-start justify-center gap-x-10 gap-y-3 py-[clamp(4rem,8vw,8rem)]`}>
          {[
            ["✓ Every rescue is verified", "Registered and reviewed before they go live"],
            ["✓ 90% to rescue", "Of every marketplace commission"],
            ["✓ 100% of donations", "Reach the rescue directly"],
            ["✓ Full transparency", "Every euro tracked publicly"],
          ].map(([title, sub]) => (
            <div key={title} className="max-w-[220px] text-center">
              <div className="text-[0.8125rem] font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
                {title}
              </div>
              <div className="mt-0.5 text-[0.75rem] leading-snug" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                {sub}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
