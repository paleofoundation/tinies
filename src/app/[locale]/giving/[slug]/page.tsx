import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharityBySlug } from "@/lib/giving/actions";
import { getCanonicalSiteOrigin } from "@/lib/constants/site-url";
import { CharityDonateForm } from "./CharityDonateForm";
import { SetPreferredCharityButton } from "./SetPreferredCharityButton";

export const dynamic = "force-dynamic";

const SITE_ORIGIN = getCanonicalSiteOrigin();

type Props = { params: Promise<{ slug: string }> };

function absoluteOgImageUrl(src: string, origin: string): string {
  const t = src.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) return `${origin}${t}`;
  return `${origin}/${t}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let charity: Awaited<ReturnType<typeof getCharityBySlug>> = null;
  try {
    charity = await getCharityBySlug(slug);
  } catch (e) {
    console.error("getCharityBySlug (metadata)", e);
  }
  if (!charity) notFound();

  const title = charity.name;
  const ogTitle = `${charity.name} · Tinies Giving`;
  const description =
    charity.mission?.trim() ||
    `Donate to ${charity.name} through Tinies Giving — 100% to animal rescue partners in Cyprus.`;
  const url = `${SITE_ORIGIN}/giving/${charity.slug}`;
  const imageCandidates = [charity.logoUrl, ...charity.photos].filter((u): u is string => Boolean(u?.trim()));
  const ogImages = imageCandidates.slice(0, 4).map((src) => ({
    url: absoluteOgImageUrl(src, SITE_ORIGIN),
    alt: charity.name,
  }));
  const primaryOg = ogImages[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: "Tinies",
      type: "website",
      images: ogImages.length > 0 ? ogImages : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(primaryOg ? { images: [primaryOg] } : {}),
    },
  };
}

export default async function CharityProfilePage({ params }: Props) {
  const { slug } = await params;
  let charity: Awaited<ReturnType<typeof getCharityBySlug>> = null;
  try {
    charity = await getCharityBySlug(slug);
  } catch (e) {
    console.error("getCharityBySlug", e);
  }
  if (!charity) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/giving"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          ← Back to Giving
        </Link>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
          {charity.logoUrl && (
            <img
              src={charity.logoUrl}
              alt=""
              className="h-24 w-24 shrink-0 rounded-[var(--radius-lg)] object-cover sm:h-32 sm:w-32"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1
              className="font-normal tracking-tight sm:text-3xl"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
            >
              {charity.name}
            </h1>
            {charity.mission && (
              <p className="mt-3 text-lg" style={{ color: "var(--color-text-secondary)" }}>{charity.mission}</p>
            )}
            {charity.website && (
              <a
                href={charity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Visit website →
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--color-secondary)" }}>
              €{(charity.totalReceivedCents / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Total received through Tinies</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--color-secondary)" }}>{charity.supporterCount}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Supporters</p>
          </div>
        </div>

        {charity.photos.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Photos</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {charity.photos.slice(0, 6).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="aspect-square rounded-[var(--radius-lg)] object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {charity.howFundsUsed && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>How funds are used</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{charity.howFundsUsed}</p>
          </section>
        )}

        {charity.annualUpdateText && (
          <section className="mt-10 rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-primary-50)", borderColor: "var(--color-border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Annual impact update</h2>
            {charity.annualUpdateDate && (
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {new Date(charity.annualUpdateDate).toLocaleDateString("en-GB", { year: "numeric", month: "long" })}
              </p>
            )}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>{charity.annualUpdateText}</p>
          </section>
        )}

        <section className="mt-10 flex flex-wrap gap-4">
          <div className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", minWidth: "280px" }}>
            <h3 className="font-semibold" style={{ color: "var(--color-text)" }}>Donate once</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Make a one-time donation to {charity.name}.</p>
            <CharityDonateForm charityId={charity.id} />
          </div>
          <div className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--color-text)" }}>Set as my preferred charity</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Round-up and optional donations can go here. Requires an account.</p>
            <SetPreferredCharityButton charityId={charity.id} slug={charity.slug} />
          </div>
        </section>
      </main>
    </div>
  );
}
