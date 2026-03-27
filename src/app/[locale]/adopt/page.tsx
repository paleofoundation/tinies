import type { Metadata } from "next";
import { ArrowRight, Heart } from "lucide-react";
import { getAllAvailableAdoptionListings } from "@/lib/adoption/available-listings";
import {
  adoptBrowseQueryHasFilters,
  parseAdoptBrowseQuery,
} from "@/lib/adoption/adopt-browse-params";
import { Link } from "@/i18n/navigation";
import { AdoptEditorialBrowseFilters, AdoptEditorialSpeciesPills } from "./AdoptEditorialBrowseFilters";
import { AdoptEditorialListingCard } from "./AdoptEditorialListingCard";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Adopt a Tiny | Rescue Animals in Cyprus",
  description:
    "Every tiny deserves a home. Rescue organisations post their own adoption listings on Tinies. Browse dogs and cats, apply through the platform, and connect with rescues and transport providers.",
  openGraph: {
    title: "Adopt a Tiny | Rescue Animals in Cyprus",
    description: "Every tiny deserves a home. Browse rescue animals in Cyprus and apply to adopt through Tinies.",
    url: `${BASE_URL}/adopt`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adopt a Tiny | Rescue Animals in Cyprus",
    description: "Every tiny deserves a home. Browse rescue animals in Cyprus and apply to adopt through Tinies.",
  },
};

const HOME_Y = "py-[clamp(4rem,8vw,8rem)]";
const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";
const CARD_SHADOW = "0 2px 8px rgba(10, 128, 128, 0.06)";

function EditorialHowAdoptStep({
  num,
  title,
  description,
}: {
  num: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-[22px] border bg-white p-6 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
      style={{ borderColor: BORDER_TEAL_15, boxShadow: CARD_SHADOW }}
    >
      <div
        className="text-[2rem] font-black leading-none"
        style={{ color: "var(--color-primary)", fontFamily: "var(--font-display), sans-serif", fontWeight: 900 }}
      >
        {num}
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
        {description}
      </p>
    </div>
  );
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdoptPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const browseQuery = parseAdoptBrowseQuery(rawParams);
  const listings = await getAllAvailableAdoptionListings(browseQuery);
  const filtersActive = adoptBrowseQueryHasFilters(browseQuery);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      {/* HERO */}
      <section
        className="border-b pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2.5rem,5vw,4rem)]"
        style={{ backgroundColor: "var(--color-background)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <p
            className="uppercase"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 800,
              letterSpacing: "0.08em",
              fontSize: "0.75rem",
              color: "var(--color-secondary)",
            }}
          >
            Adoption
          </p>
          <h1
            className="mt-4 max-w-[min(100%,52rem)] uppercase"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.94,
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
            }}
          >
            <span className="block" style={{ color: "var(--color-text)" }}>
              every tiny
            </span>
            <span className="block" style={{ color: "var(--color-primary)" }}>
              deserves a home.
            </span>
          </h1>
          <p
            className="mt-6 max-w-[620px] text-[1.125rem] leading-[1.7]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28,28,28,0.7)" }}
          >
            Rescue organisations list their animals on Tinies. Browse dogs and cats, apply through the platform, and
            connect with rescues and transport providers — locally in Cyprus or internationally.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#animals"
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-background)",
                boxShadow: CARD_SHADOW,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 21s-6.716-4.35-9-8.5C1.5 9.5 3.5 6 7 6c2.5 0 4 2 5 3 1-1 2.5-3 5-3 3.5 0 5.5 3.5 4 6.5-2.284 4.15-9 8.5-9 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              </svg>
              Meet the tinies
            </a>
            <Link
              href="/adopt/tinies-who-made-it"
              className="inline-flex items-center justify-center gap-2 rounded-full border bg-white px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-[var(--color-primary-50)]"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                borderColor: "var(--color-primary)",
                color: "var(--color-primary)",
              }}
            >
              See tinies who made it
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* TWO PATHS */}
      <section
        className={`theme-soft-noise ${HOME_Y} border-b`}
        style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <p
            className="uppercase"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 800,
              letterSpacing: "0.08em",
              fontSize: "0.75rem",
              color: "var(--color-primary)",
            }}
          >
            Two ways to adopt
          </p>
          <h2
            className="mt-3 max-w-2xl uppercase"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.94,
              fontSize: "clamp(2rem, 6vw, 3.25rem)",
              color: "var(--color-secondary)",
            }}
          >
            <span className="block">local or</span>
            <span className="block">international</span>
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2" style={{ gap: "24px" }}>
            <div
              className="overflow-hidden rounded-[24px] border bg-white transition-transform duration-200 hover:-translate-y-1"
              style={{ borderColor: BORDER_TEAL_15, boxShadow: CARD_SHADOW }}
            >
              <div className="px-7 py-8 uppercase" style={{ backgroundColor: "var(--color-primary)", padding: "32px 28px" }}>
                <p
                  className="font-black leading-tight"
                  style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-background)", fontSize: "clamp(1.25rem,3vw,1.5rem)" }}
                >
                  <span className="block">adopt locally</span>
                  <span className="block opacity-90">in Cyprus</span>
                </p>
              </div>
              <div style={{ padding: "28px" }}>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
                  You&apos;re in Cyprus and ready to adopt. Browse animals listed by rescues near you, meet them, and take
                  your tiny home. Each rescue sets their own adoption process and fees.
                </p>
                <a
                  href="#animals"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-secondary)" }}
                >
                  Browse local animals
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
            <div
              className="overflow-hidden rounded-[24px] border bg-white transition-transform duration-200 hover:-translate-y-1"
              style={{ borderColor: BORDER_TEAL_15, boxShadow: CARD_SHADOW }}
            >
              <div className="uppercase" style={{ backgroundColor: "var(--color-secondary)", padding: "32px 28px" }}>
                <p
                  className="font-black leading-tight"
                  style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-background)", fontSize: "clamp(1.25rem,3vw,1.5rem)" }}
                >
                  <span className="block">adopt from</span>
                  <span className="block opacity-90">anywhere</span>
                </p>
              </div>
              <div style={{ padding: "28px" }}>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
                  You&apos;re in the UK, Germany, or elsewhere in the EU. Apply through Tinies; rescues and transport
                  providers handle vet prep, EU pet passport, and transport. One platform — they run the process.
                </p>
                <Link
                  href="/adopt?international=true"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-secondary)" }}
                >
                  Browse animals for international adoption
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW ADOPTION WORKS */}
      <section className={`${HOME_Y} border-b`} style={{ backgroundColor: "var(--color-background)", borderColor: BORDER_TEAL_15 }}>
        <div className={HOME_INNER}>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-14">
            <div className="min-w-0">
              <p
                className="uppercase"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  fontSize: "0.75rem",
                  color: "var(--color-primary)",
                }}
              >
                The process
              </p>
              <h2
                className="mt-3 max-w-md uppercase"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.94,
                  fontSize: "clamp(2rem, 6vw, 3.25rem)",
                  color: "var(--color-secondary)",
                }}
              >
                <span className="block">how adoption</span>
                <span className="block">works</span>
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}
              >
                Tinies connects you with registered rescues. You browse openly, apply in one place, and the rescue guides
                you through meetings, paperwork, and travel when needed.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <EditorialHowAdoptStep
                num="01"
                title="Browse"
                description="Explore dogs and cats listed by verified rescues in Cyprus — filter by species, area, and more."
              />
              <EditorialHowAdoptStep
                num="02"
                title="Apply"
                description="Submit your application through Tinies. The rescue reviews your details and gets back to you."
              />
              <EditorialHowAdoptStep
                num="03"
                title="Meet"
                description="Meet your tiny in person or by video. Ask questions and make sure it’s the right match."
              />
              <EditorialHowAdoptStep
                num="04"
                title="Welcome home"
                description="Complete adoption with the rescue’s process — then welcome your tiny to their forever home."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ANIMAL GRID */}
      <section
        id="animals"
        className={`theme-soft-noise ${HOME_Y} border-b`}
        style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 max-w-xl">
              <p
                className="uppercase"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  fontSize: "0.75rem",
                  color: "var(--color-secondary)",
                }}
              >
                Tinies looking for homes
              </p>
              <h2
                className="mt-3 uppercase"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.94,
                  fontSize: "clamp(2rem, 6vw, 3.25rem)",
                  color: "var(--color-primary)",
                }}
              >
                <span className="block">meet the</span>
                <span className="block">tinies.</span>
              </h2>
              <p className="mt-3 text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
                Animals listed by rescue organisations — waiting for you.
              </p>
            </div>
            <div className="w-full shrink-0 lg:max-w-md">
              <AdoptEditorialSpeciesPills query={browseQuery} />
            </div>
          </div>

          <AdoptEditorialBrowseFilters query={browseQuery} />

          <p
            className="mt-6 text-sm font-semibold"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
            aria-live="polite"
          >
            Showing {listings.length} {listings.length === 1 ? "animal" : "animals"}
          </p>

          {listings.length === 0 && filtersActive ? (
            <div
              className="mt-10 border bg-white px-6 py-10 text-center"
              style={{ borderColor: BORDER_TEAL_15, boxShadow: CARD_SHADOW }}
            >
              <p className="text-sm font-medium" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                No tinies match your filters. Try broadening your search.
              </p>
              <Link
                href="/adopt"
                className="mt-4 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)" }}
              >
                Clear filters
              </Link>
            </div>
          ) : null}
          {listings.length === 0 && !filtersActive ? (
            <p className="mt-10 text-center text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
              No adoptable animals are listed yet. Check back soon, or contact rescues you know to join Tinies.
            </p>
          ) : null}
          {listings.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {listings.map((listing) => (
                <AdoptEditorialListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* RESCUE MISSION */}
      <section className={HOME_Y} style={{ backgroundColor: "var(--color-primary)", color: "var(--color-background)" }}>
        <div className={HOME_INNER}>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-14">
            <div className="min-w-0">
              <p
                className="uppercase"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Behind every adoption
              </p>
              <h2
                className="mt-3 max-w-lg uppercase"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.94,
                  fontSize: "clamp(2rem, 6vw, 3.25rem)",
                }}
              >
                <span className="block text-white">rescues do</span>
                <span className="block" style={{ color: "rgba(255,255,255,0.8)" }}>
                  the real work.
                </span>
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.88)" }}
              >
                Registered rescues on Tinies handle vaccinations, sterilisation, health checks, and coordination with
                transport when you adopt internationally — so you always know who is responsible for each step.
              </p>
              <Link
                href="/rescue"
                className="mt-8 inline-flex items-center justify-center rounded-full border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Meet our rescue partners
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  t: "Vet prep",
                  d: "Health checks, vaccines, and records organised before travel or handover.",
                },
                {
                  t: "EU pet passport",
                  d: "Paperwork and passport steps coordinated for eligible international adoptions.",
                },
                { t: "Transport", d: "Trusted routes and handoffs when your tiny crosses borders." },
                { t: "Ongoing support", d: "Rescues stay in the loop for questions after your tiny arrives home." },
              ].map((cell) => (
                <div
                  key={cell.t}
                  className="rounded-2xl border p-[22px] backdrop-blur-[4px]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <p className="font-bold" style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem" }}>
                    {cell.t}
                  </p>
                  <p
                    className="mt-2 leading-relaxed"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    {cell.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EMOTIONAL CTA */}
      <section className={HOME_Y} style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-background)" }}>
        <div className={`${HOME_INNER} text-center`}>
          <p
            className="uppercase"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 800,
              letterSpacing: "0.08em",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Change a life
          </p>
          <h2
            className="mx-auto mt-3 max-w-3xl uppercase"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.94,
              fontSize: "clamp(2rem, 7vw, 4.5rem)",
            }}
          >
            <span className="block text-white">they&apos;re waiting</span>
            <span className="block" style={{ color: "rgba(255,255,255,0.8)" }}>
              for you.
            </span>
          </h2>
          <p
            className="mx-auto mt-5 max-w-[500px] text-base leading-relaxed"
            style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.92)" }}
          >
            Every listing is a real animal in rescue care. Browse today — your tiny might be one scroll away.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#animals"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-95"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-secondary)" }}
            >
              <Heart className="h-4 w-4 shrink-0" aria-hidden />
              Browse all tinies
            </a>
            <Link
              href="/giving/become-a-guardian"
              className="inline-flex items-center justify-center rounded-full border-2 border-white bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Support a rescue
            </Link>
          </div>
        </div>
      </section>

      {/* GUARANTEE STRIP */}
      <section
        className={`${HOME_Y} border-y`}
        style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="flex flex-col items-center justify-center gap-y-3 gap-x-10 sm:flex-row sm:flex-wrap">
            {[
              { t: "Registered rescues only", s: "Verified organisations on the platform" },
              { t: "Transparent process", s: "Clear steps from browse to adoption" },
              { t: "International support", s: "EU-focused coordination when you adopt abroad" },
              { t: "Post-adoption care", s: "Rescues and Tinies stay in touch after placement" },
            ].map((item) => (
              <div key={item.t} className="max-w-[220px] text-center sm:text-left">
                <p className="font-bold" style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "var(--color-primary)" }}>
                  ✓ {item.t}
                </p>
                <p className="mt-1" style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(28,28,28,0.5)" }}>
                  {item.s}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
