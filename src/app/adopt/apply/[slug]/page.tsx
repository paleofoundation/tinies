import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingBySlug } from "../actions";
import { AdoptionApplicationForm } from "./AdoptionApplicationForm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let listing: Awaited<ReturnType<typeof getListingBySlug>> = null;
  try {
    listing = await getListingBySlug(slug);
  } catch (e) {
    console.error("getListingBySlug (metadata)", e);
  }
  if (!listing) return { title: "Adopt | Tinies" };
  const title = `Apply to adopt ${listing.name} | Tinies`;
  const description = `Apply to adopt ${listing.name}, a ${listing.species}${listing.breed ? ` (${listing.breed})` : ""} in Cyprus.`;
  const url = `${BASE_URL}/adopt/apply/${slug}`;
  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "Tinies", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AdoptApplyPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/adopt/apply/${slug}`)}`);
  }

  let listing: Awaited<ReturnType<typeof getListingBySlug>> = null;
  try {
    listing = await getListingBySlug(slug);
  } catch (e) {
    console.error("getListingBySlug", e);
  }
  if (!listing) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.name,
    description: [listing.temperament, listing.medicalHistory, listing.specialNeeds].filter(Boolean).join(" ") || `${listing.species} available for adoption`,
    image: listing.photos[0] ?? undefined,
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/adopt/apply/${slug}`,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <main
        className="mx-auto px-4 py-12 sm:px-6 sm:py-16"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <Link
          href={`/adopt/${listing.slug}`}
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          ← Back to {listing.name}
        </Link>

        <h1
          className="mt-6 font-normal tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          Apply to adopt {listing.name}
        </h1>
        <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Tell the rescue a bit about you and your home. They&apos;ll review your application and get in touch.
        </p>

        {/* Animal summary */}
        <div
          className="mt-8 flex flex-col gap-6 rounded-[var(--radius-lg)] border p-6 sm:flex-row sm:items-center"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="h-40 w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-background)] sm:h-32 sm:w-40">
            {listing.photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.photos[0]}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">🐾</div>
            )}
          </div>
          <div>
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-lg)", color: "var(--color-text)" }}>
              {listing.name}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {listing.species}
              {listing.breed ? ` · ${listing.breed}` : ""}
              {listing.estimatedAge ? ` · ${listing.estimatedAge}` : ""}
            </p>
          </div>
        </div>

        <AdoptionApplicationForm listingSlug={listing.slug} />
      </main>
    </div>
  );
}
