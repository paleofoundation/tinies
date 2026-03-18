import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { getSearchProviders } from "@/app/services/search/actions";
import {
  SERVICE_TYPE_SLUGS,
  DISTRICT_SLUGS,
  SERVICE_SLUG_TO_TYPE,
  DISTRICT_SLUG_TO_NAME,
  SERVICE_TYPE_TO_LABEL,
} from "@/lib/constants/seo-landings";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

type Props = {
  params: Promise<{ serviceType: string; district: string }>;
};

function formatEur(cents: number): string {
  return `EUR ${(cents / 100).toFixed(2)}`;
}

export async function generateStaticParams() {
  const params: { serviceType: string; district: string }[] = [];
  for (const serviceType of SERVICE_TYPE_SLUGS) {
    for (const district of DISTRICT_SLUGS) {
      params.push({ serviceType, district });
    }
  }
  return params;
}

function getDistrictDescription(serviceLabel: string, districtName: string): string {
  return `Find trusted ${serviceLabel.toLowerCase()} in ${districtName}. Book verified local carers on Tinies — every booking helps rescue animals in Cyprus.`;
}

const DISTRICT_FAQS: Record<string, { q: string; a: string }[]> = {
  default: [
    {
      q: "How do I book a pet carer in Cyprus?",
      a: "Search for providers on Tinies, pick your service and dates, and book securely. Your payment is held until the carer confirms. You can message them before and during the stay.",
    },
    {
      q: "Are Tinies providers verified?",
      a: "Yes. Every provider completes ID verification and is reviewed by our team before they can accept bookings. You’ll see their rating and reviews from other pet owners.",
    },
    {
      q: "What if I need to cancel?",
      a: "It depends on the provider’s cancellation policy (flexible, moderate, or strict). You can see this on their profile. We’ll process refunds according to that policy.",
    },
    {
      q: "Does booking help rescue animals?",
      a: "Yes. A portion of every Tinies booking goes to the Giving Fund, supporting animal sanctuaries and rescues in Cyprus. You can round up at checkout to give a little extra.",
    },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serviceType, district } = await params;
  const serviceLabel = SERVICE_TYPE_TO_LABEL[SERVICE_SLUG_TO_TYPE[serviceType]] ?? serviceType;
  const districtName = DISTRICT_SLUG_TO_NAME[district] ?? district;
  const title = `${serviceLabel} in ${districtName} | Tinies`;
  const description = getDistrictDescription(serviceLabel, districtName);
  const url = `${BASE_URL}/${serviceType}/${district}`;
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

export default async function DistrictServicePage({ params }: Props) {
  const { serviceType, district } = await params;
  const internalType = SERVICE_SLUG_TO_TYPE[serviceType];
  const districtName = DISTRICT_SLUG_TO_NAME[district] ?? district;

  if (!internalType || !districtName) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>Page not found</h1>
        <Link href="/services" className="mt-4 inline-block font-medium" style={{ color: "var(--color-primary)" }}>
          Browse pet care services →
        </Link>
      </div>
    );
  }

  const serviceLabel = SERVICE_TYPE_TO_LABEL[internalType] ?? serviceType;
  const providers = await getSearchProviders({
    serviceType: internalType,
    district: districtName,
  });

  const faqs = DISTRICT_FAQS.default;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto px-4 py-16 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-normal tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
        >
          {serviceLabel} in {districtName}
        </h1>
        <p className="mt-4 max-w-2xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          {getDistrictDescription(serviceLabel, districtName)}
        </p>

        <section className="mt-12">
          <h2 className="sr-only">Providers in {districtName}</h2>
          {providers.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {providers.slice(0, 9).map((provider) => (
                <li
                  key={provider.slug}
                  className="rounded-[var(--radius-lg)] border p-6 transition-shadow hover:shadow-[var(--shadow-md)]"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="flex gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-base font-semibold" style={{ color: "var(--color-primary)" }}>
                      {provider.avatarUrl ? (
                        <Image
                          src={provider.avatarUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized={provider.avatarUrl.includes("supabase")}
                        />
                      ) : (
                        <span>{provider.initials}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                        {provider.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {provider.rating != null ? Number(provider.rating.toFixed(1)) : "—"}
                        <span className="ml-1">({provider.reviewCount} reviews)</span>
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {provider.district ?? districtName}
                      </p>
                      <p className="mt-2 font-semibold" style={{ color: "var(--color-secondary)" }}>
                        {provider.priceFrom != null ? `From ${formatEur(provider.priceFrom)}` : "—"}
                      </p>
                      <Link
                        href={`/services/provider/${provider.slug}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                        style={{ color: "var(--color-primary)" }}
                      >
                        View profile <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
              No providers in {districtName} for {serviceLabel.toLowerCase()} yet. Check back soon or search other districts.
            </p>
          )}
          {providers.length > 0 && (
            <div className="mt-8">
              <Link
                href={`/services/search?type=${internalType}&district=${encodeURIComponent(districtName)}`}
                className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                View all {serviceLabel.toLowerCase()} in {districtName} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        <section className="mt-16 border-t pt-12" style={{ borderColor: "var(--color-border)" }}>
          <h2
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            Frequently asked questions
          </h2>
          <ul className="mt-8 space-y-6">
            {faqs.map((faq, i) => (
              <li key={i}>
                <h3 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  {faq.q}
                </h3>
                <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {faq.a}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
