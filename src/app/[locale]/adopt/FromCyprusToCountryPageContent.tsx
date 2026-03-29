import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { CountryAdoptionSeo } from "@/lib/adoption/country-requirements";
import { getApprovedSuccessStoriesForDestinationMatchers } from "@/lib/adoption/success-stories";
import { AdoptionListingCard } from "@/components/adoption/AdoptionListingCard";
import type { AdoptBrowseListing } from "@/lib/adoption/available-listings";
import { getCanonicalSiteOrigin } from "@/lib/constants/site-url";

const BASE_URL = getCanonicalSiteOrigin();

function formatStoryDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

type Props = { seo: CountryAdoptionSeo };

/** SEO country landing: /adopt/from-cyprus-to-{slug} — rendered from unified [slug] route. */
export async function FromCyprusToCountryPageContent({ seo }: Props) {
  const country = seo.slug;

  let listingsRaw: AdoptBrowseListing[] = [];
  let stories: Awaited<ReturnType<typeof getApprovedSuccessStoriesForDestinationMatchers>> = [];
  try {
    const [listings, storyRows] = await Promise.all([
      prisma.adoptionListing.findMany({
        where: {
          status: "available",
          active: true,
          internationalEligible: true,
          destinationCountries: { hasSome: seo.listingDestinationValues },
        },
        select: {
          slug: true,
          name: true,
          species: true,
          breed: true,
          estimatedAge: true,
          sex: true,
          photos: true,
          org: { select: { name: true, slug: true, location: true, verified: true } },
        },
        take: 12,
        orderBy: { updatedAt: "desc" },
      }),
      getApprovedSuccessStoriesForDestinationMatchers(seo.successStoryCountryMatchers, 6),
    ]);
    listingsRaw = listings;
    stories = storyRows;
  } catch (e) {
    console.error("FromCyprusToCountryPageContent data", country, e);
  }

  const listings: AdoptBrowseListing[] = listingsRaw;

  const pageUrl = `${BASE_URL}/adopt/from-cyprus-to-${country}`;
  const browseInternationalHref = "/adopt?international=true";

  const howItWorks = [
    {
      step: 1,
      title: `Browse animals eligible for ${seo.heroCountryPhrase}`,
      body: "Filter international listings and read profiles from verified Cyprus rescues.",
    },
    {
      step: 2,
      title: "Submit your adoption application",
      body: "Tell us about your home and experience. The rescue reviews and follows up through Tinies.",
    },
    {
      step: 3,
      title: "We coordinate vet prep, passport, and transport",
      body: "Vaccinations, microchip, EU pet passport, and travel are organised with trusted partners.",
    },
    {
      step: 4,
      title: "Your new family member arrives at your door",
      body: "We stay in touch through arrival and early days so your tiny settles in safely.",
    },
  ];

  const feeIncluded = [
    "Veterinary preparation (vaccinations, microchip, spay/neuter where applicable)",
    "EU pet passport",
    `Transport to ${seo.heroCountryPhrase}`,
    "Tinies coordination",
    "Post-adoption support and check-ins",
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `Adopt a rescue animal from Cyprus to ${seo.seoTitleCountry}`,
        description: `International rescue adoption from Cyprus to ${seo.seoTitleCountry} with vet preparation, EU pet passport, transport, and coordination through Tinies.`,
        isPartOf: {
          "@type": "WebSite",
          name: "Tinies",
          url: BASE_URL,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#eligible-animals`,
        name: `Animals eligible for adoption to ${seo.heroCountryPhrase}`,
        numberOfItems: listings.length,
        itemListElement: listings.map((l, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: l.name,
          url: `${BASE_URL}/adopt/${l.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8">
        <div className="absolute inset-0 rounded-b-[3rem] sm:rounded-b-[4rem]" style={{ backgroundColor: "var(--color-primary-muted-06)" }} />
        <div className="relative mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h1
            className="font-normal tracking-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            Adopt a rescue animal from Cyprus to {seo.heroCountryPhrase}
          </h1>
          <p
            className="mt-4 max-w-2xl text-lg leading-relaxed"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            We coordinate everything — vet preparation, EU pet passport, transport, and customs documentation. One transparent fee. No hidden costs.
          </p>
        </div>
      </section>

      <div className="mx-auto px-4 pb-20 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)", paddingBottom: "var(--space-section)" }}>
        <section aria-labelledby="how-heading">
          <h2
            id="how-heading"
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <li
                key={item.step}
                className="rounded-[var(--radius-lg)] border p-6"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
              >
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
                >
                  {item.step}
                </span>
                <h3 className="mt-4 text-base font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16" aria-labelledby="req-heading">
          <h2
            id="req-heading"
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            Key requirements for {seo.heroCountryPhrase}
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
            Rules change over time; we confirm the exact steps for your animal and destination. The following is a practical overview, not legal advice.
          </p>
          <div
            className="mt-8 rounded-[var(--radius-lg)] border p-6 sm:p-8"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
          >
            <h3 className="flex items-center gap-2 text-base font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
              <CheckCircle className="h-5 w-5 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
              Import &amp; travel checklist
            </h3>
            <ul className="mt-4 space-y-2">
              {seo.requirements.map((req) => (
                <li key={req} className="flex gap-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  <span className="shrink-0" style={{ color: "var(--color-primary)" }}>
                    •
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                Transport &amp; routing:{" "}
              </span>
              {seo.transportNotes}
            </p>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="eligible-heading">
          <h2
            id="eligible-heading"
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            Eligible animals
          </h2>
          <p className="mt-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Verified rescues — listed for international adoption to {seo.heroCountryPhrase}.
          </p>
          {listings.length > 0 ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {listings.map((listing) => (
                <AdoptionListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-base leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              No animals are listed for {seo.heroCountryPhrase} right now. New rescues join regularly — browse all international listings or check back soon.
            </p>
          )}
        </section>

        <section className="mt-16" aria-labelledby="fee-heading">
          <h2
            id="fee-heading"
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            What&apos;s included in the adoption fee?
          </h2>
          <div
            className="mt-6 rounded-[var(--radius-lg)] border p-6 sm:p-8"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
          >
            <ul className="space-y-3">
              {feeIncluded.map((line) => (
                <li key={line} className="flex gap-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "var(--color-primary)" }}>✓</span>
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
              {seo.typicalTotalNarrative}
            </p>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="stories-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="stories-heading"
              className="font-normal sm:text-2xl"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              Tinies who made it
            </h2>
            <Link
              href="/adopt/tinies-who-made-it"
              className="text-sm font-semibold hover:underline"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
            >
              View all stories →
            </Link>
          </div>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Success stories from families who adopted to {seo.heroCountryPhrase} (when available).
          </p>
          {stories.length > 0 ? (
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((s) => {
                const cover = s.afterPhoto ?? s.beforePhoto;
                return (
                  <article
                    key={s.placementId}
                    className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border transition-shadow hover:shadow-[var(--shadow-md)]"
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                  >
                    <Link href={`/adopt/tinies-who-made-it#story-${s.placementId}`} className="relative block aspect-[4/3] bg-[var(--color-background)]">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={`${s.animalName}, adoption success story`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                          Photo soon
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-6" style={{ padding: "var(--space-card)" }}>
                      <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                        {s.animalName}
                      </h3>
                      <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                        {s.originLabel} → {s.destinationLabel}
                      </p>
                      {s.quote ? (
                        <blockquote
                          className="mt-3 line-clamp-4 border-l-2 pl-3 text-sm italic leading-relaxed"
                          style={{ borderColor: "var(--color-primary)", color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}
                        >
                          &ldquo;{s.quote}&rdquo;
                        </blockquote>
                      ) : null}
                      <p className="mt-3 text-xs" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
                        Adopted {formatStoryDate(s.adoptedAt)}
                      </p>
                      <Link
                        href={`/adopt/tinies-who-made-it#story-${s.placementId}`}
                        className="mt-4 text-sm font-semibold hover:underline"
                        style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
                      >
                        Read full story →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              We&apos;re collecting the first stories for this destination. See the full gallery for all approved happy tails.
            </p>
          )}
        </section>

        <section className="mt-16">
          <div
            className="rounded-[var(--radius-xl)] border px-6 py-10 text-center sm:px-10"
            style={{ backgroundColor: "var(--color-primary-50)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
          >
            <h2 className="text-xl font-normal sm:text-2xl" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
              Browse animals available for adoption to {seo.heroCountryPhrase}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              See every internationally eligible tiny on Tinies, then apply when you find your match.
            </p>
            <Link
              href={browseInternationalHref}
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
            >
              Browse international adoptions
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
