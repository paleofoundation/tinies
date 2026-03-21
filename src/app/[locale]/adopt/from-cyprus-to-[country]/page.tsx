import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ArrowRight, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { COUNTRY_SLUGS, COUNTRY_SLUG_TO_NAME, COUNTRY_SLUG_TO_DESTINATION } from "@/lib/constants/seo-landings";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

type Props = {
  params: Promise<{ country: string }>;
};

const COUNTRY_GUIDES: Record<
  string,
  { intro: string; requirements: string[]; timeline: string; cta: string }
> = {
  uk: {
    intro:
      "Adopting a rescue animal from Cyprus to the UK is a journey we support from start to finish. Our rescue partners prepare dogs and cats for travel with full vet checks, microchipping, and the rabies titer test required by UK law. We coordinate paperwork and transport so you can focus on welcoming your new tiny.",
    requirements: [
      "Rabies vaccination and EU pet passport",
      "Rabies titer test (blood test) at least 30 days before travel",
      "UK-approved transport (we work with registered carriers)",
      "Pre-arrival tapeworm treatment for dogs",
    ],
    timeline:
      "From application to arrival typically takes 3–4 months, depending on vet prep and transport availability. We’ll keep you updated at every step.",
    cta: "Ready to find your match? Browse dogs and cats eligible for adoption to the UK.",
  },
  germany: {
    intro:
      "Bringing a Cypriot rescue to Germany is something we help with regularly. Our rescues ensure each animal is microchipped, vaccinated, and ready for EU entry. We’ll guide you through the paperwork and connect you with reliable transport.",
    requirements: [
      "Microchip (ISO 11784/11785)",
      "Rabies vaccination and EU pet passport",
      "Compliance with EU animal health regulations",
      "Some breed-specific rules may apply — we’ll flag these per listing",
    ],
    timeline:
      "Most adoptions to Germany are completed within 2–4 months after approval, including vet prep and transport booking.",
    cta: "See dogs and cats that can come to Germany.",
  },
  netherlands: {
    intro:
      "Adopting from Cyprus to the Netherlands is straightforward with Tinies. Our rescue partners prepare animals to EU standards, and we handle the logistics so your new pet can travel safely to you.",
    requirements: [
      "Microchip and rabies vaccination",
      "EU pet passport",
      "Health certificate issued close to travel date",
      "Transport booked with an approved carrier",
    ],
    timeline:
      "Expect roughly 2–3 months from application to arrival, depending on vet scheduling and transport slots.",
    cta: "Browse animals eligible for adoption to the Netherlands.",
  },
  sweden: {
    intro:
      "We help adopters in Sweden welcome rescue dogs and cats from Cyprus. Animals are fully prepared for EU travel and we coordinate transport and documentation so everything is in order for Swedish entry.",
    requirements: [
      "Microchip and rabies vaccination",
      "EU pet passport",
      "Treatment against Echinococcus (for dogs) before entry",
      "Health certificate and approved transport",
    ],
    timeline:
      "Plan for about 2–4 months from approval to arrival, including vet prep and transport.",
    cta: "Find dogs and cats that can be adopted to Sweden.",
  },
  "other-eu": {
    intro:
      "Tinies works with rescues across Cyprus to rehome dogs and cats to other EU countries. Each animal is vet-checked, vaccinated, and prepared for travel. We’ll tailor the process to your destination and keep you informed.",
    requirements: [
      "Microchip and rabies vaccination",
      "EU pet passport where applicable",
      "Destination-specific rules (we’ll confirm for your country)",
      "Approved transport and health documentation",
    ],
    timeline:
      "Timelines vary by destination and transport availability; we’ll give you an estimate once your application is approved.",
    cta: "Browse all internationally eligible animals and filter by destination.",
  },
};

export async function generateStaticParams() {
  return COUNTRY_SLUGS.map((country) => ({ country }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const countryName = COUNTRY_SLUG_TO_NAME[country] ?? country;
  const title = `Adopt a Rescue Animal from Cyprus to ${countryName.charAt(0).toUpperCase() + countryName.slice(1)} | Tinies`;
  const description = `How to adopt a dog or cat from Cyprus to ${countryName}. Requirements, timeline, and eligible rescue listings. Every tiny deserves a home.`;
  const url = `${BASE_URL}/adopt/from-cyprus-to-${country}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Tinies",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CountryAdoptionPage({ params }: Props) {
  const { country } = await params;
  const countryName = COUNTRY_SLUG_TO_NAME[country] ?? country;
  const destinationValues = COUNTRY_SLUG_TO_DESTINATION[country];

  if (!destinationValues || !countryName) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>Page not found</h1>
        <Link href="/adopt" className="mt-4 inline-block font-medium" style={{ color: "var(--color-primary)" }}>
          Browse adoptions →
        </Link>
      </div>
    );
  }

  const listings = await prisma.adoptionListing.findMany({
    where: {
      status: "available",
      active: true,
      internationalEligible: true,
      destinationCountries: { hasSome: destinationValues },
      org: { verified: true },
    },
    select: {
      slug: true,
      name: true,
      species: true,
      breed: true,
      estimatedAge: true,
      photos: true,
    },
    take: 12,
    orderBy: { updatedAt: "desc" },
  });

  const guide = COUNTRY_GUIDES[country] ?? COUNTRY_GUIDES["other-eu"];
  const displayCountryName =
    countryName.startsWith("the ") ? countryName : countryName.charAt(0).toUpperCase() + countryName.slice(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <div className="mx-auto px-4 py-16 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-normal tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
        >
          Adopt a rescue animal from Cyprus to {displayCountryName}
        </h1>
        <p className="mt-4 max-w-2xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          {guide.intro}
        </p>

        <section className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h2 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
              <CheckCircle className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
              What you’ll need
            </h2>
            <ul className="mt-4 space-y-2">
              {guide.requirements.map((req, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "var(--color-primary)" }}>•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
              Timeline
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              {guide.timeline}
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            Eligible animals
          </h2>
          <p className="mt-2 text-base" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {guide.cta}
          </p>
          {listings.length > 0 ? (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <li
                  key={listing.slug}
                  className="rounded-[var(--radius-lg)] border p-4 transition-shadow hover:shadow-[var(--shadow-md)]"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <Link href={`/adopt/${listing.slug}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-background)]">
                      {listing.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.photos[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">🐾</div>
                      )}
                    </div>
                    <h3 className="mt-3 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      {listing.name}
                    </h3>
                    <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {listing.species}
                      {listing.breed ? ` · ${listing.breed}` : ""}
                      {listing.estimatedAge ? ` · ${listing.estimatedAge}` : ""}
                    </p>
                  </Link>
                  <Link
                    href={`/adopt/apply/${listing.slug}`}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--color-secondary)" }}
                  >
                    Adopt this Tiny
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-base" style={{ color: "var(--color-text-secondary)" }}>
              No animals are currently listed for adoption to {displayCountryName}. New rescues are added regularly — check back or browse all adoptable animals.
            </p>
          )}
          <div className="mt-10">
            <Link
              href="/adopt"
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Heart className="h-5 w-5" />
              Browse all adoptable animals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
