import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { BadgeCheck, CheckCircle, Circle } from "lucide-react";
import { getPublicCampaignByOrgAndSlug, getRecentCampaignSupporters } from "@/lib/campaign/campaign-public";
import { CampaignDonateForm } from "@/components/campaign/CampaignDonateForm";
import { CampaignShareRow } from "@/components/campaign/CampaignShareRow";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").replace(/\/$/, "");

const SHARE_BODY = "Help 92 rescue cats in Cyprus find safe land. Every euro counts.";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string; campaignSlug: string }>;
  searchParams: Promise<{ thanks?: string }>;
};

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatEurCents(cents: number): string {
  return eur.format(cents / 100);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, campaignSlug } = await params;
  const data = await getPublicCampaignByOrgAndSlug(slug, campaignSlug);
  if (!data) return { title: "Campaign" };
  const title = `${data.title} · ${data.org.name}`;
  const ogTitle = `${title} | Tinies`;
  const description = data.subtitle?.trim() || data.description.slice(0, 160);
  const url = `${BASE_URL}/rescue/${data.org.slug}/campaign/${data.slug}`;
  const og = data.coverPhotoUrl ?? data.org.coverPhotoUrl;
  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: "Tinies",
      type: "website",
      images: og ? [{ url: og }] : undefined,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  };
}

export default async function PublicCampaignPage({ params, searchParams }: Props) {
  const { slug, campaignSlug } = await params;
  const { thanks } = await searchParams;
  const data = await getPublicCampaignByOrgAndSlug(slug, campaignSlug);
  if (!data) notFound();

  const supporters = await getRecentCampaignSupporters(data.id, 20);
  const shareUrl = `${BASE_URL}/rescue/${data.org.slug}/campaign/${data.slug}`;
  const hero = data.coverPhotoUrl ?? data.org.coverPhotoUrl;
  const pct =
    data.goalAmountCents != null && data.goalAmountCents > 0
      ? Math.min(100, Math.round((100 * data.raisedAmountCents) / data.goalAmountCents))
      : null;

  const updatesSorted = [...data.updates].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <div
        className="relative w-full overflow-hidden"
        style={{
          background: `linear-gradient(180deg, var(--color-primary-muted-09) 0%, var(--color-background) 100%)`,
        }}
      >
        <div className="relative h-52 sm:h-64 md:h-72">
          {hero ? (
            <Image src={hero} alt="" fill className="object-cover" priority sizes="100vw" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-muted-75) 50%, var(--color-secondary) 100%)`,
              }}
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" aria-hidden />
        </div>

        <div className="relative mx-auto px-4 pb-10 pt-8 sm:px-6" style={{ maxWidth: "var(--max-width)" }}>
          <Link href={`/rescue/${data.org.slug}`} className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
            ← {data.org.name}
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <h1
              className="font-normal tracking-tight"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "var(--color-text)" }}
            >
              {data.title}
            </h1>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
              style={{ borderColor: "var(--color-border)", fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
            >
              <BadgeCheck className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
              Verified rescue
            </span>
          </div>
          {data.subtitle ? (
            <p className="mt-3 max-w-3xl text-lg leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              {data.subtitle}
            </p>
          ) : null}
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
            Organised by{" "}
            <Link href={`/rescue/${data.org.slug}`} className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
              {data.org.name}
            </Link>
          </p>
        </div>
      </div>

      <main className="mx-auto px-4 py-10 sm:px-6 sm:py-14" style={{ maxWidth: "var(--max-width)" }}>
        {thanks === "1" ? (
          <div
            className="mb-10 rounded-[var(--radius-xl)] border px-5 py-4 sm:px-6 sm:py-5"
            style={{
              borderColor: "var(--color-primary-200)",
              backgroundColor: "var(--color-primary-muted-08)",
              fontFamily: "var(--font-body), sans-serif",
            }}
            role="status"
          >
            <p className="font-semibold" style={{ color: "var(--color-text)" }}>
              Thank you!
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Your donation brings us closer to safe land for 92 cats.
            </p>
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-12">
            <section aria-labelledby="progress-heading">
              <h2 id="progress-heading" className="sr-only">
                Progress
              </h2>
              <div
                className="rounded-[var(--radius-xl)] border p-6 sm:p-8"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
              >
                {data.goalAmountCents != null && data.goalAmountCents > 0 ? (
                  <>
                    <div className="h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct ?? 0}%`,
                          backgroundColor: "var(--color-primary)",
                          minWidth: data.raisedAmountCents > 0 ? "4px" : undefined,
                        }}
                      />
                    </div>
                    <p className="mt-4 text-lg font-semibold tabular-nums" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                      {formatEurCents(data.raisedAmountCents)} raised of {formatEurCents(data.goalAmountCents)} goal
                      {pct != null ? ` · ${pct}%` : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold tabular-nums" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                      {formatEurCents(data.raisedAmountCents)} raised
                    </p>
                    <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
                      No goal set for this campaign yet.
                    </p>
                  </>
                )}
                <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  <span className="font-semibold tabular-nums" style={{ color: "var(--color-text)" }}>
                    {data.donorCount.toLocaleString("en-GB")}
                  </span>{" "}
                  supporter{data.donorCount !== 1 ? "s" : ""}
                </p>
              </div>
            </section>

            <section aria-labelledby="story-heading">
              <h2
                id="story-heading"
                className="font-normal text-2xl"
                style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
              >
                The story
              </h2>
              <div
                className="prose prose-sm mt-6 max-w-none leading-relaxed sm:prose-base"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
              >
                <ReactMarkdown>{data.description}</ReactMarkdown>
              </div>
            </section>

            {updatesSorted.length > 0 ? (
              <section aria-labelledby="updates-heading">
                <h2
                  id="updates-heading"
                  className="font-normal text-2xl"
                  style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
                >
                  Campaign updates
                </h2>
                <ul className="mt-6 space-y-8 border-l-2 pl-6" style={{ borderColor: "var(--color-border)" }}>
                  {updatesSorted.map((u, i) => (
                    <li key={`${u.date}-${i}`} className="relative">
                      <span
                        className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: "var(--color-primary)" }}
                        aria-hidden
                      />
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                        {u.date}
                      </p>
                      <h3 className="mt-1 font-normal text-lg" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                        {u.title}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        {u.text}
                      </p>
                      {u.photoUrl ? (
                        <div className="relative mt-4 aspect-video max-w-lg overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
                          <Image src={u.photoUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 512px" />
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {data.milestones.length > 0 ? (
              <section aria-labelledby="milestones-heading">
                <h2
                  id="milestones-heading"
                  className="font-normal text-2xl"
                  style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
                >
                  Milestones
                </h2>
                <ul className="mt-6 space-y-4">
                  {data.milestones.map((m, i) => (
                    <li
                      key={`${m.title}-${i}`}
                      className="flex gap-3 rounded-[var(--radius-lg)] border p-4"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                    >
                      {m.reached ? (
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-text-muted)" }} aria-hidden />
                      )}
                      <div>
                        <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                          {m.title}
                        </p>
                        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {m.description}
                        </p>
                        {m.reached && m.reachedAt ? (
                          <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                            Reached {m.reachedAt}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {supporters.length > 0 ? (
              <section aria-labelledby="supporters-heading">
                <h2
                  id="supporters-heading"
                  className="font-normal text-2xl"
                  style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
                >
                  Recent supporters
                </h2>
                <ul className="mt-6 divide-y rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                  {supporters.map((s) => (
                    <li key={s.id} className="px-4 py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                          {s.donorName ?? "Anonymous"}
                        </span>
                        <span className="tabular-nums font-semibold" style={{ color: "var(--color-primary)" }}>
                          {formatEurCents(s.amountCents)}
                        </span>
                      </div>
                      {s.message ? (
                        <p className="mt-2 text-sm italic" style={{ color: "var(--color-text-secondary)" }}>
                          &ldquo;{s.message}&rdquo;
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(s.createdAt))}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="share-heading">
              <h2 id="share-heading" className="sr-only">
                Share
              </h2>
              <CampaignShareRow shareUrl={shareUrl} shareBody={SHARE_BODY} />
            </section>
          </div>

          <div className="lg:sticky lg:top-24">
            <CampaignDonateForm orgSlug={data.org.slug} campaignSlug={data.slug} />
          </div>
        </div>
      </main>
    </div>
  );
}
