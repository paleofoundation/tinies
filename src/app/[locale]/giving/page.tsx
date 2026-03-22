import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Coins, Heart, Leaf, Users } from "lucide-react";
import {
  getGivingStats,
  getGivingMonthlyTransparencyRows,
  getGivingRescuePartnerCards,
  getAnimalsSupportedCount,
} from "@/lib/giving/actions";
import { getFeaturedCampaignsForMarketing } from "@/lib/campaign/campaign-public";
import { GivingAnimatedTotal } from "@/components/giving/GivingAnimatedTotal";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tinies Giving | Every Booking Helps",
  description:
    "90% of Tinies commission goes directly to rescue animal care in Cyprus. See real totals: round-ups, Guardians, platform giving — full transparency.",
  openGraph: {
    title: "Tinies Giving | Every Booking Helps",
    description:
      "90% of our commission goes to rescue animal care in Cyprus. Real numbers, full transparency — round-ups, Guardians, and more.",
    url: `${BASE_URL}/giving`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tinies Giving | Every Booking Helps",
    description: "90% of our commission goes to rescue animal care in Cyprus. Full transparency.",
  },
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

export default async function GivingPage() {
  const [stats, monthlyRows, partners, animalsSupported, featuredCampaigns] = await Promise.all([
    getGivingStats(),
    getGivingMonthlyTransparencyRows(),
    getGivingRescuePartnerCards(),
    getAnimalsSupportedCount(),
    getFeaturedCampaignsForMarketing(6),
  ]);

  const donateActionJsonLd = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: "Support Tinies Giving",
    target: {
      "@type": "EntryPoint",
      url: `${BASE_URL}/giving/become-a-guardian`,
    },
    recipient: {
      "@type": "Organization",
      name: "Tinies Giving",
      description: "Animal rescue support in Cyprus — 90% of Tinies commission plus community donations.",
    },
    description:
      "Tinies allocates 90% of platform commission to rescue animal care in Cyprus. Donate via round-ups, one-time gifts, or monthly Tinies Guardians.",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donateActionJsonLd) }} />

      {/* Section 1 — Hero */}
      <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
        <div
          className="absolute inset-0 rounded-b-[3rem] sm:rounded-b-[4rem]"
          style={{ backgroundColor: "rgba(10, 128, 128, 0.06)" }}
        />
        <div className="relative mx-auto text-center" style={{ maxWidth: "var(--max-width)" }}>
          <h1
            className="font-normal tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-4xl)", color: "var(--color-text)" }}
          >
            Tinies Giving: Every booking helps.
          </h1>
          <p
            className="mt-5 mx-auto max-w-2xl text-lg leading-relaxed"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            90% of our commission goes directly to rescue animal care in Cyprus. And our community gives even more.
          </p>
          <div className="mt-12">
            <p className="text-sm font-medium uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Total donated to date (all sources)
            </p>
            <div className="mt-3 text-4xl font-bold tabular-nums sm:text-5xl lg:text-6xl">
              <GivingAnimatedTotal totalCents={stats.totalAllTime} className="inline-block" />
            </div>
          </div>
        </div>
      </section>

      {featuredCampaigns.length > 0 ? (
        <section className="border-t px-4 py-14 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
            <h2
              className="text-center font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
            >
              Featured rescue campaigns
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              Direct gifts toward a specific goal — land, medical funds, or the next chapter for animals in care.
            </p>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCampaigns.map((c) => (
                <li
                  key={`${c.orgSlug}-${c.slug}`}
                  className="overflow-hidden rounded-[var(--radius-xl)] border transition-shadow hover:shadow-[var(--shadow-md)]"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", boxShadow: "var(--shadow-sm)" }}
                >
                  <Link href={`/rescue/${c.orgSlug}/campaign/${c.slug}`} className="block">
                    <div className="relative aspect-[16/10] w-full" style={{ backgroundColor: "rgba(10, 128, 128, 0.06)" }}>
                      {c.coverPhotoUrl ? (
                        <Image src={c.coverPhotoUrl} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
                      ) : null}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                        {c.orgName}
                      </p>
                      <p className="mt-2 font-normal text-lg" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                        {c.title}
                      </p>
                      {c.subtitle ? (
                        <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {c.subtitle}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm font-medium tabular-nums" style={{ color: "var(--color-primary)" }}>
                        {formatEurCents(c.raisedAmountCents)} raised · {c.donorCount} supporters
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Section 2 — How it works */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8" style={{ paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <div className="grid gap-8 lg:grid-cols-3">
            <div
              className="rounded-[var(--radius-xl)] border p-8"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-md)",
                padding: "var(--space-card)",
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]"
                style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
              >
                <Leaf className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="mt-6 text-xl font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                We give 90%
              </h2>
              <p className="mt-3 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                90% of every commission goes to animal rescue. Automatically. Always.
              </p>
            </div>
            <div
              className="rounded-[var(--radius-xl)] border p-8"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-md)",
                padding: "var(--space-card)",
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]"
                style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
              >
                <Coins className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="mt-6 text-xl font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Round up your booking
              </h2>
              <p className="mt-3 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Round up to the nearest euro at checkout. Every cent goes to rescue.
              </p>
            </div>
            <div
              className="rounded-[var(--radius-xl)] border p-8"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-md)",
                padding: "var(--space-card)",
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]"
                style={{ backgroundColor: "var(--color-secondary-50)", color: "var(--color-secondary)" }}
              >
                <Heart className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="mt-6 text-xl font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Become a Tinies Guardian
              </h2>
              <p className="mt-3 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Give monthly and support rescue animals year-round.
              </p>
              <Link
                href="/giving/become-a-guardian"
                className="mt-6 inline-flex font-semibold hover:underline"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Impact numbers */}
      <section className="border-t px-4 py-16 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="font-normal text-center sm:text-3xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            Impact at a glance
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { label: "Total donated (all time)", value: formatEurCents(stats.totalAllTime), icon: Coins },
              { label: "Animals on Tinies (available now)", value: String(animalsSupported), icon: Heart },
              { label: "Charities funded", value: String(stats.charitiesSupported), icon: Building2 },
              {
                label: "Monthly Tinies Guardians",
                value: String(stats.activeGuardiansCount),
                icon: Users,
              },
            ].map((tile) => (
              <div
                key={tile.label}
                className="rounded-[var(--radius-lg)] border p-6 text-center"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
              >
                <tile.icon className="mx-auto h-8 w-8" style={{ color: "var(--color-primary)" }} aria-hidden />
                <p className="mt-4 text-2xl font-bold tabular-nums sm:text-3xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  {tile.value}
                </p>
                <p className="mt-2 text-xs font-medium sm:text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {tile.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Rescue partners */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--color-primary-50)", paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="font-normal sm:text-3xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            Our rescue partners
          </h2>
          <p className="mt-2 max-w-2xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Verified organisations listing animals on Tinies. See how support flows to each partner.
          </p>
          {partners.length === 0 ? (
            <p className="mt-10 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Verified rescue partners will appear here as they join the platform.
            </p>
          ) : (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <Link
                  key={p.slug}
                  href={`/rescue/${p.slug}`}
                  className="group flex flex-col rounded-[var(--radius-xl)] border p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                  style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
                >
                  <div
                    className="relative mx-auto h-20 w-20 shrink-0 overflow-hidden rounded-full border"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                  >
                    {p.logoUrl ? (
                      <Image src={p.logoUrl} alt={`${p.name} logo`} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" aria-hidden>
                        <Building2 className="h-10 w-10" style={{ color: "var(--color-primary-300)" }} strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <h3
                    className="mt-4 text-center text-lg font-semibold group-hover:underline"
                    style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
                  >
                    {p.name}
                  </h3>
                  {p.missionExcerpt ? (
                    <p className="mt-2 flex-1 text-center text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                      {p.missionExcerpt}
                    </p>
                  ) : null}
                  <div className="mt-4 text-center text-sm" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    {p.receivedThroughTiniesCents === null ? (
                      <span style={{ color: "var(--color-text-muted)" }}>Just joined</span>
                    ) : (
                      <>
                        <span className="block font-semibold tabular-nums" style={{ color: "var(--color-primary)" }}>
                          {formatEurCents(p.receivedThroughTiniesCents)}
                        </span>
                        <span className="mt-1 block text-xs" style={{ color: "var(--color-text-muted)" }}>
                          received through Tinies
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 5 — Monthly breakdown */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="font-normal sm:text-3xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            Monthly breakdown
          </h2>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Donations recorded in the Tinies ledger (last 12 months, months with activity only).
          </p>
          {monthlyRows.length === 0 ? (
            <p className="mt-8 rounded-[var(--radius-lg)] border p-6 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
              No donation activity in the last 12 months yet. When the community gives, it will show here — EUR 0.00 until then.
            </p>
          ) : (
            <div className="mt-8 overflow-x-auto rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-primary-50)" }}>
                    <th className="px-4 py-3 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Month
                    </th>
                    <th className="px-4 py-3 font-semibold text-right tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Total donated
                    </th>
                    <th className="px-4 py-3 font-semibold text-right tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Platform (90%)
                    </th>
                    <th className="px-4 py-3 font-semibold text-right tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Round-ups
                    </th>
                    <th className="px-4 py-3 font-semibold text-right tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Guardians
                    </th>
                    <th className="px-4 py-3 font-semibold text-right tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      One-time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRows.map((row) => (
                    <tr key={`${row.year}-${row.month}`} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-4 py-3" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                        {row.label}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--color-text)" }}>
                        {formatEurCents(row.totalCents)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                        {formatEurCents(row.platformCents)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                        {formatEurCents(row.roundupCents)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                        {formatEurCents(row.guardianCents)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                        {formatEurCents(row.oneTimeCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Section 6 — Guardian CTA */}
      <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <div
            className="rounded-[var(--radius-xl)] px-8 py-14 text-center sm:px-12 sm:py-16"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-background)" }}
          >
            <h2
              className="font-normal sm:text-3xl"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-background)" }}
            >
              Join our Tinies Guardians
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-base"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255, 255, 255, 0.92)" }}
            >
              Supporting animal rescue every month. Starting from EUR 3/month.
            </p>
            <Link
              href="/giving/become-a-guardian"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] bg-white px-8 font-semibold transition-opacity hover:opacity-95"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-primary)" }}
            >
              Become a Guardian
            </Link>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <p
          className="mx-auto max-w-2xl text-center text-xs leading-relaxed sm:text-sm"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
        >
          Every euro is tracked. Every cent is accounted for. Full transparency, always.
        </p>
      </section>
    </div>
  );
}
