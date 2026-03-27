import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getPublicCampaignByOrgAndSlug, getRecentCampaignSupporters } from "@/lib/campaign/campaign-public";
import { CampaignDonateFormEditorial } from "./CampaignDonateFormEditorial";
import { CampaignEditorialBottomCta } from "./CampaignEditorialBottomCta";
import { CampaignShareEditorial } from "./CampaignShareEditorial";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").replace(/\/$/, "");

const SHARE_BODY = "Help 92 rescue cats in Cyprus find safe land. Every euro counts.";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string; campaignSlug: string }>;
  searchParams: Promise<{ thanks?: string }>;
};

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";
const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6";

const DEFAULT_IMPACT_TIERS = [
  { icon: "🐱", amount: "€3", desc: "Feeds one cat for a week" },
  { icon: "💊", amount: "€15", desc: "Flea treatment for five cats" },
  { icon: "🏥", amount: "€50", desc: "Emergency vet visit" },
  { icon: "🏠", amount: "€100", desc: "Feeds entire haven for three days" },
] as const;

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurWhole = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatEurCents(cents: number): string {
  return eur.format(cents / 100);
}

function formatEurGoal(cents: number): string {
  return eurWhole.format(cents / 100);
}

function plainExcerpt(markdown: string, maxLen: number): string {
  const t = markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

function campaignStatusLabel(status: string): string {
  if (status === "active") return "Campaign active";
  const s = status.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
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

  const barWidth = pct != null ? Math.max(pct, 2) : 0;

  const updatesSorted = [...data.updates].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const rescueAbout =
    plainExcerpt(data.description, 220) || data.subtitle?.trim() || "Verified rescue organisation partnering with Tinies.";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <section className="relative w-full overflow-hidden" style={{ height: "clamp(280px, 35vw, 440px)" }}>
        {hero ? (
          <Image src={hero} alt={data.title} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-muted-75) 50%, var(--color-secondary) 100%)`,
            }}
            aria-hidden
          />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6">
          <div className={`pointer-events-auto w-full ${HOME_INNER}`}>
            <Link
              href={`/rescue/${data.org.slug}`}
              className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-white/90 transition-opacity hover:opacity-100"
              style={{ fontFamily: "var(--font-body), sans-serif" }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
              {data.org.name}
            </Link>
          </div>
        </div>
      </section>

      <main>
        <div className={`${HOME_INNER} pt-10 pb-16`}>
          {thanks === "1" ? (
            <div
              className="mb-8 rounded-[20px] border px-5 py-4 sm:px-6 sm:py-5"
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
            <div className="flex flex-col gap-8">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  <span
                    className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
                    style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-secondary)" }}
                  >
                    Campaign
                  </span>
                  {data.org.verified ? (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold"
                      style={{
                        backgroundColor: "rgba(10, 128, 128, 0.08)",
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-body), sans-serif",
                      }}
                    >
                      ✓ Verified rescue
                    </span>
                  ) : null}
                </div>
                <h1
                  className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
                  style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
                >
                  {data.title}
                </h1>
                {data.subtitle ? (
                  <p
                    className="mt-3 text-[1.0625rem] leading-[1.7]"
                    style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
                  >
                    {data.subtitle}
                  </p>
                ) : null}
                <p className="mt-1.5 text-[0.875rem]" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.5)" }}>
                  Organised by{" "}
                  <Link href={`/rescue/${data.org.slug}`} className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                    {data.org.name}
                  </Link>
                </p>

                <div
                  className="mt-7 rounded-[20px] border p-6"
                  style={{
                    borderColor: BORDER_TEAL_15,
                    backgroundColor: "var(--color-primary-50)",
                  }}
                >
                  {data.goalAmountCents != null && data.goalAmountCents > 0 ? (
                    <>
                      <div className="mb-3 flex items-baseline justify-between gap-4">
                        <div>
                          <span className="text-2xl font-extrabold tabular-nums" style={{ color: "var(--color-primary)" }}>
                            {formatEurCents(data.raisedAmountCents)}
                          </span>
                          <span className="ml-2 text-[0.875rem]" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                            of {formatEurGoal(data.goalAmountCents)} goal
                          </span>
                        </div>
                        <div className="text-[0.875rem] font-bold tabular-nums" style={{ color: "var(--color-primary)" }}>
                          {pct}%
                        </div>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(10, 128, 128, 0.12)" }}>
                        <div
                          className="h-full rounded-full transition-[width]"
                          style={{
                            width: `${barWidth}%`,
                            background: "linear-gradient(90deg, #0A8080, #0DAAAA)",
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-3">
                        <span className="text-2xl font-extrabold tabular-nums" style={{ color: "var(--color-primary)" }}>
                          {formatEurCents(data.raisedAmountCents)}
                        </span>
                        <span className="ml-2 text-[0.875rem]" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                          raised
                        </span>
                      </div>
                      <p className="text-[0.875rem]" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                        No goal set for this campaign yet.
                      </p>
                    </>
                  )}
                  <div
                    className="mt-3 flex flex-wrap gap-6 text-[0.8125rem]"
                    style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}
                  >
                    <span>
                      <strong style={{ color: "var(--color-text)" }}>{data.donorCount.toLocaleString("en-GB")}</strong> supporter
                      {data.donorCount !== 1 ? "s" : ""}
                    </span>
                    <span>{campaignStatusLabel(data.status)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-[1.125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  Your impact
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {DEFAULT_IMPACT_TIERS.map((t) => (
                    <div
                      key={t.amount}
                      className="rounded-[18px] border bg-[var(--color-background)] p-5 text-center"
                      style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
                    >
                      <div className="mb-2 text-[28px] leading-none">{t.icon}</div>
                      <div
                        className="text-2xl font-black uppercase leading-none"
                        style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-primary)" }}
                      >
                        {t.amount}
                      </div>
                      <p className="mt-2 text-[0.75rem] leading-normal" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                        {t.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {data.description.trim() ? (
                <div
                  className="rounded-[20px] border bg-[var(--color-background)] p-6"
                  style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
                >
                  <h2 className="mb-4 text-[1.125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    The story
                  </h2>
                  <div className="space-y-4">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p
                            className="text-[0.9375rem] leading-[1.8]"
                            style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}
                          >
                            {children}
                          </p>
                        ),
                        li: ({ children }) => (
                          <li className="text-[0.9375rem] leading-[1.8]" style={{ color: "rgba(28, 28, 28, 0.7)" }}>
                            {children}
                          </li>
                        ),
                        ul: ({ children }) => <ul className="list-disc space-y-2 pl-5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5">{children}</ol>,
                      }}
                    >
                      {data.description}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null}

              {data.milestones.length > 0 ? (
                <div
                  className="rounded-[20px] border bg-[var(--color-background)] p-6"
                  style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
                >
                  <h2 className="mb-5 text-[1.125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    Milestones
                  </h2>
                  <div className="flex flex-col">
                    {data.milestones.map((m, i) => (
                      <div key={`${m.title}-${i}`} className="flex gap-4">
                        <div className="flex w-6 shrink-0 flex-col items-center">
                          <div
                            className="mt-1 shrink-0 rounded-full"
                            style={
                              m.reached
                                ? { width: 12, height: 12, backgroundColor: "var(--color-primary)" }
                                : {
                                    width: 12,
                                    height: 12,
                                    border: `2px solid ${BORDER_TEAL_15}`,
                                    backgroundColor: "transparent",
                                  }
                            }
                          />
                          {i < data.milestones.length - 1 ? (
                            <div className="my-1 w-0.5 flex-1 min-h-[12px]" style={{ backgroundColor: BORDER_TEAL_15 }} />
                          ) : null}
                        </div>
                        <div className={i < data.milestones.length - 1 ? "pb-6" : ""}>
                          <div
                            className="text-[0.9375rem] font-semibold"
                            style={{
                              color: m.reached ? "#1C1C1C" : "rgba(28, 28, 28, 0.5)",
                              fontFamily: "var(--font-body), sans-serif",
                            }}
                          >
                            {m.title}
                          </div>
                          <p className="mt-0.5 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                            {m.description}
                          </p>
                          {m.reached && m.reachedAt ? (
                            <div
                              className="mt-1 text-[0.6875rem] font-semibold"
                              style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
                            >
                              Reached {m.reachedAt}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div
                className="rounded-[20px] border p-6"
                style={{
                  borderColor: BORDER_TEAL_15,
                  background: "linear-gradient(135deg, rgba(10,128,128,0.06) 0%, rgba(244,93,72,0.04) 100%)",
                }}
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2} className="h-5 w-5 shrink-0" aria-hidden>
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <div className="text-[0.9375rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    100% transparent
                  </div>
                </div>
                <p className="text-[0.8125rem] leading-[1.7]" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                  Every euro donated through Tinies is tracked publicly. You can see exactly where funds go — food, vet care, shelter operations — on our transparency page.
                </p>
                <Link
                  href="/giving"
                  className="mt-3 inline-block text-[0.8125rem] font-bold hover:underline"
                  style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
                >
                  View transparency report →
                </Link>
              </div>

              {updatesSorted.length > 0 ? (
                <div
                  className="rounded-[20px] border bg-[var(--color-background)] p-6"
                  style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
                >
                  <h2 className="mb-5 text-[1.125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    Campaign updates
                  </h2>
                  <ul className="space-y-8 border-l-2 pl-6" style={{ borderColor: BORDER_TEAL_15 }}>
                    {updatesSorted.map((u, i) => (
                      <li key={`${u.date}-${i}`} className="relative">
                        <span
                          className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: "var(--color-primary)" }}
                          aria-hidden
                        />
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                          {u.date}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                          {u.title}
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-[0.9375rem] leading-[1.8]" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                          {u.text}
                        </p>
                        {u.photoUrl ? (
                          <div className="relative mt-4 aspect-video max-w-lg overflow-hidden rounded-xl border" style={{ borderColor: BORDER_TEAL_15 }}>
                            <Image src={u.photoUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 512px" />
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {supporters.length > 0 ? (
                <div
                  className="rounded-[20px] border bg-[var(--color-background)] p-6"
                  style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
                >
                  <h2 className="mb-5 text-[1.125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    Recent supporters
                  </h2>
                  <ul className="divide-y rounded-xl border" style={{ borderColor: BORDER_TEAL_15 }}>
                    {supporters.map((s) => (
                      <li key={s.id} className="px-4 py-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-semibold text-[0.9375rem]" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                            {s.donorName ?? "Anonymous"}
                          </span>
                          <span className="tabular-nums text-[0.9375rem] font-bold" style={{ color: "var(--color-primary)" }}>
                            {formatEurCents(s.amountCents)}
                          </span>
                        </div>
                        {s.message ? (
                          <p className="mt-2 text-sm italic" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                            &ldquo;{s.message}&rdquo;
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                          {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(s.createdAt))}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
              <CampaignDonateFormEditorial orgSlug={data.org.slug} campaignSlug={data.slug} />
              <CampaignShareEditorial shareUrl={shareUrl} shareBody={SHARE_BODY} />
              <div
                className="rounded-[20px] border bg-[var(--color-background)] p-6"
                style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
              >
                <div
                  className="mb-3.5 text-[0.8125rem] font-bold uppercase tracking-[0.06em]"
                  style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}
                >
                  About the rescue
                </div>
                <div className="text-[0.9375rem] font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  {data.org.name}
                </div>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                  {rescueAbout}
                </p>
                <Link
                  href={`/rescue/${data.org.slug}`}
                  className="mt-3 inline-block text-[0.8125rem] font-bold hover:underline"
                  style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
                >
                  View rescue profile →
                </Link>
              </div>
              <div
                className="rounded-2xl border p-5 text-center"
                style={{
                  borderColor: BORDER_TEAL_15,
                  background: "linear-gradient(135deg, rgba(244,93,72,0.08) 0%, rgba(10,128,128,0.06) 100%)",
                }}
              >
                <div className="text-[0.8125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  Want to help every month?
                </div>
                <p className="mt-1.5 text-[0.75rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                  Become a Tinies Guardian — from €3/month, 100% goes to rescue care.
                </p>
                <Link
                  href="/giving/become-a-guardian"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-[18px] py-2 text-[0.75rem] font-bold transition-colors hover:bg-[rgba(244,93,72,0.06)]"
                  style={{
                    borderColor: "var(--color-secondary)",
                    color: "var(--color-secondary)",
                    fontFamily: "var(--font-body), sans-serif",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Become a Guardian
                </Link>
              </div>
            </aside>
          </div>
        </div>

        <CampaignEditorialBottomCta />
      </main>
    </div>
  );
}
