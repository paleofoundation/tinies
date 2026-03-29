import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getHomepageData, type HomepageData } from "@/lib/home/get-homepage-data";
import { withQueryTimeout } from "@/lib/utils/with-query-timeout";
import { cn } from "@/lib/utils";
import { getCanonicalSiteOrigin } from "@/lib/constants/site-url";

const SITE_ORIGIN = getCanonicalSiteOrigin();

export const metadata: Metadata = {
  title: "Pet Care Services",
  description:
    "Find trusted care for your tiny. Dog walking, pet sitting, boarding, drop-in visits, and daycare from verified providers in Cyprus.",
  alternates: { canonical: `${SITE_ORIGIN}/services` },
  openGraph: {
    title: "Pet Care Services | Tinies",
    description:
      "Find trusted care for your tiny. Dog walking, pet sitting, boarding, drop-in visits, and daycare from verified providers in Cyprus.",
    url: `${SITE_ORIGIN}/services`,
    siteName: "Tinies",
    type: "website",
  },
};

export const revalidate = 300;

const HOME_Y = "py-[clamp(4rem,8vw,8rem)]";
const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";
const CARD_SHADOW = "0 2px 8px rgba(10, 128, 128, 0.06)";

function splitPriceRange(range: string): { main: string; unit: string } {
  const idx = range.indexOf(" per ");
  if (idx === -1) return { main: range, unit: "" };
  return { main: range.slice(0, idx).trim(), unit: range.slice(idx + 1).trim() };
}

const CATEGORIES = [
  {
    type: "walking",
    name: "Dog Walking",
    description: "Regular walks to keep your dog happy and healthy.",
    priceRange: "€10–25 per walk",
    emoji: "🐕",
  },
  {
    type: "sitting",
    name: "Pet Sitting",
    description: "Care at your home while you're away.",
    priceRange: "€25–50 per day",
    emoji: "🏠",
  },
  {
    type: "boarding",
    name: "Overnight Boarding",
    description: "Your pet stays with a verified carer overnight.",
    priceRange: "€30–60 per night",
    emoji: "🌙",
  },
  {
    type: "drop_in",
    name: "Drop-In Visits",
    description: "20–30 min visits to feed, play, and check on your pet.",
    priceRange: "€10–20 per visit",
    emoji: "👋",
  },
  {
    type: "daycare",
    name: "Daycare",
    description: "Daytime care at the carer's home. Drop off and pick up same day.",
    priceRange: "€15–30 per day",
    emoji: "☀️",
  },
] as const;

const HOW_BOOKING_STEPS = [
  {
    num: "01",
    title: "Search",
    text: "Filter by service, location, and availability. Every provider is ID-verified.",
  },
  {
    num: "02",
    title: "Book",
    text: "Pay securely. Payment is only captured when your provider accepts.",
  },
  {
    num: "03",
    title: "Relax",
    text: "Get photo updates and message your carer anytime.",
  },
] as const;

const EMPTY_HOME_DATA: HomepageData = {
  completedBookingsCount: 0,
  fiveStarReviewsCount: 0,
  completedAdoptionsCount: 0,
  donationsTotalCents: 0,
  verifiedProvidersCount: 0,
  activeGuardiansCount: 0,
  featuredProviders: [],
  featuredListings: [],
  recentReviews: [],
  featuredCampaign: null,
};

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <div className="flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-4 w-4 shrink-0"
          strokeWidth={1.5}
          style={{
            fill: i < rounded ? "var(--color-secondary)" : "transparent",
            color: i < rounded ? "var(--color-secondary)" : "var(--color-text-muted)",
          }}
        />
      ))}
    </div>
  );
}

export default async function ServicesPage() {
  const homeData = await withQueryTimeout(
    getHomepageData(),
    EMPTY_HOME_DATA,
    "services-page:getHomepageData",
    5000
  );
  const { verifiedProvidersCount, completedBookingsCount, recentReviews } = homeData;
  const testimonials = recentReviews.slice(0, 3);

  const statsRow = [
    {
      value: `${verifiedProvidersCount}+`,
      label: "Verified providers",
      sub: "Across Cyprus",
    },
    {
      value: `${completedBookingsCount}+`,
      label: "Happy tinies",
      sub: "Booked and cared for",
    },
    {
      value: "90%",
      label: "To rescue",
      sub: "Of every commission",
    },
    {
      value: "€2,000",
      label: "Guarantee",
      sub: "Vet cost coverage",
    },
  ] as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      {/* Hero — solid white (mock), coral eyebrow, display headline */}
      <section className="border-b" style={{ backgroundColor: "var(--color-background)", borderColor: BORDER_TEAL_15 }}>
        <div className={`${HOME_INNER} ${HOME_Y}`}>
          <p
            className="mb-4 font-extrabold uppercase leading-none"
            style={{
              color: "var(--color-secondary)",
              fontFamily: "var(--font-display), sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
            }}
          >
            Pet care
          </p>
          <h1
            className="max-w-[900px] font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
            }}
          >
            <span className="block" style={{ color: "var(--color-text)" }}>
              Find trusted care
            </span>{" "}
            <span className="block" style={{ color: "var(--color-primary)" }}>
              For your tiny.
            </span>
          </h1>
          <p
            className="mt-6 max-w-[560px] leading-[1.7]"
            style={{
              color: "rgba(28, 28, 28, 0.7)",
              fontFamily: "var(--font-body), sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
            }}
          >
            Dog walking, sitting, boarding, drop-ins, and daycare from verified providers in Cyprus.
          </p>
        </div>
      </section>

      {/* Service types — mint / noise, five cards */}
      <section
        className={`theme-soft-noise border-b ${HOME_Y}`}
        style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-6">
            {CATEGORIES.map((cat) => {
              const { main, unit } = splitPriceRange(cat.priceRange);
              return (
                <Link
                  key={cat.type}
                  href={`/services/search?type=${cat.type}`}
                  className="flex flex-col rounded-[24px] bg-white p-8 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
                  style={{ boxShadow: CARD_SHADOW }}
                >
                  <span className="text-3xl leading-none" aria-hidden>
                    {cat.emoji}
                  </span>
                  <h2
                    className="mt-5 text-lg font-bold leading-snug"
                    style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
                  >
                    {cat.name}
                  </h2>
                  <p
                    className="mt-3 flex-1 text-sm leading-relaxed"
                    style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.68)" }}
                  >
                    {cat.description}
                  </p>
                  <hr className="mt-5 border-0 border-t" style={{ borderColor: "rgba(28, 28, 28, 0.1)" }} />
                  <p
                    className="mt-4 text-sm font-bold leading-tight"
                    style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
                  >
                    {main}
                    {unit ? (
                      <>
                        <br />
                        {unit}
                      </>
                    ) : null}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How booking works — split editorial + three cards */}
      <section
        className={`${HOME_Y} border-b`}
        style={{ backgroundColor: "var(--color-background)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-14">
            <div className="min-w-0 max-w-lg">
              <p
                className="mb-4 font-extrabold uppercase leading-none"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                }}
              >
                Simple process
              </p>
              <h2
                className="font-black uppercase leading-[0.95] tracking-[-0.04em]"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "clamp(2rem, 5vw, 3.25rem)",
                }}
              >
                <span style={{ color: "var(--color-text)" }}>How booking </span>
                <span style={{ color: "var(--color-secondary)" }}>works</span>
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-relaxed"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.68)" }}
              >
                Search verified carers, book securely, and relax while your pet is looked after — with updates along the
                way.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {HOW_BOOKING_STEPS.map((step) => (
                <div
                  key={step.num}
                  className="rounded-[24px] border bg-white p-6"
                  style={{ borderColor: BORDER_TEAL_15 }}
                >
                  <p
                    className="text-[1.875rem] font-black leading-none"
                    style={{ color: "var(--color-primary)", fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {step.num}
                  </p>
                  <h3
                    className="mt-4 text-base font-bold"
                    style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.68)" }}
                  >
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats band — full teal, four columns with sublabels */}
      <section style={{ backgroundColor: "#0A8080" }}>
        <div className={`${HOME_INNER} ${HOME_Y}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {statsRow.map((s) => (
              <div
                key={s.label}
                className={cn(
                  "min-w-0 py-2 text-center lg:px-6 lg:text-left",
                  "[&:nth-child(n+3)]:border-t [&:nth-child(n+3)]:border-white/20 [&:nth-child(n+3)]:pt-10",
                  "lg:[&:nth-child(n+3)]:border-t-0 lg:[&:nth-child(n+3)]:pt-0",
                  "[&:nth-child(2n)]:border-l [&:nth-child(2n)]:border-white/20 [&:nth-child(2n)]:pl-4",
                  "lg:[&:nth-child(2n)]:border-l-0 lg:[&:nth-child(2n)]:pl-0",
                  "lg:[&:nth-child(n+2)]:border-l lg:[&:nth-child(n+2)]:border-white/20 lg:[&:nth-child(n+2)]:pl-8"
                )}
              >
                <p
                  className="font-black uppercase leading-none text-white"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                  }}
                >
                  {s.value}
                </p>
                <p
                  className="mt-2 font-bold uppercase text-white"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  {s.label}
                </p>
                <p
                  className="mt-2 text-sm text-white/75"
                  style={{ fontFamily: "var(--font-body), sans-serif" }}
                >
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — white cards, coral stars */}
      <section className={HOME_Y} style={{ backgroundColor: "var(--color-background)" }}>
        <div className={HOME_INNER}>
          <p
            className="mb-10 font-extrabold uppercase leading-none"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-display), sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
            }}
          >
            What pet owners say
          </p>
          {testimonials.length === 0 ? (
            <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28,28,28,0.68)" }}>
              Reviews from completed bookings will show here soon.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col rounded-[24px] border bg-white p-6"
                  style={{ borderColor: BORDER_TEAL_15, boxShadow: CARD_SHADOW }}
                >
                  <StarRow rating={r.rating} />
                  <p
                    className="mt-4 flex-1 text-sm italic leading-relaxed"
                    style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.72)" }}
                  >
                    &ldquo;{r.textExcerpt}&rdquo;
                  </p>
                  <hr className="mt-5 border-0 border-t" style={{ borderColor: "rgba(28, 28, 28, 0.12)" }} />
                  <p
                    className="mt-4 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {r.reviewerFirstName.toUpperCase()} · {r.providerName.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Rescue CTA band */}
      <section className={HOME_Y} style={{ backgroundColor: "var(--color-secondary)", color: "#fff" }}>
        <div className={HOME_INNER}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-14">
            <div className="min-w-0">
              <p
                className="mb-4 font-extrabold uppercase leading-none"
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                }}
              >
                Every booking helps
              </p>
              <h2
                className="font-black uppercase leading-[0.95] tracking-[-0.04em]"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "clamp(2rem, 5vw, 3.25rem)",
                }}
              >
                <span className="block text-white">YOU BOOK CARE.</span>
                <span className="block" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  WE FUND RESCUE.
                </span>
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-relaxed text-white/90"
                style={{ fontFamily: "var(--font-body), sans-serif" }}
              >
                Ninety percent of every commission goes to food, vet bills, shelter, and transport for rescue animals
                across Cyprus — not as an afterthought, but as the point of the platform.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/how-it-works"
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-center text-sm font-semibold no-underline transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "#fff",
                    color: "var(--color-secondary)",
                    fontFamily: "var(--font-body), sans-serif",
                  }}
                >
                  Learn how it works
                </Link>
                <Link
                  href="/giving"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white bg-transparent px-6 py-2.5 text-center text-sm font-semibold text-white no-underline transition-opacity hover:bg-white/10"
                  style={{ fontFamily: "var(--font-body), sans-serif" }}
                >
                  Meet the rescues
                </Link>
              </div>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  {
                    title: "Food & litter",
                    body: "Daily feeding runs for shelters and sanctuary cats.",
                  },
                  {
                    title: "Vet care",
                    body: "Emergency treatment, sterilisation, vaccines.",
                  },
                  {
                    title: "Shelter",
                    body: "Safe housing for rescued animals.",
                  },
                  {
                    title: "Transport",
                    body: "EU pet passport and relocation support.",
                  },
                ] as const
              ).map((card) => (
                <div
                  key={card.title}
                  className="backdrop-blur-[4px]"
                  style={{
                    borderRadius: "16px",
                    padding: "20px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <h3
                    className="text-base font-bold text-white"
                    style={{ fontFamily: "var(--font-body), sans-serif" }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed text-white/80"
                    style={{ fontFamily: "var(--font-body), sans-serif" }}
                  >
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee strip */}
      <section
        className={`${HOME_Y} border-y`}
        style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {(
              [
                {
                  title: "✓ ID-verified providers",
                  subtitle: "Every carer is checked",
                },
                {
                  title: "✓ EUR 2,000 guarantee",
                  subtitle: "Vet cost protection",
                },
                {
                  title: "✓ Free cancellation",
                  subtitle: "On flexible bookings",
                },
                {
                  title: "✓ Secure payments",
                  subtitle: "Held until service confirmed",
                },
              ] as const
            ).map((item) => (
              <div key={item.title} className="min-w-[140px] max-w-[220px] flex-1 text-center sm:min-w-[160px] sm:flex-none">
                <p
                  className="font-bold leading-snug"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "0.8125rem",
                    color: "var(--color-primary)",
                  }}
                >
                  {item.title}
                </p>
                <p
                  className="mt-1 leading-snug"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "0.75rem",
                    color: "rgba(28, 28, 28, 0.5)",
                  }}
                >
                  {item.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
