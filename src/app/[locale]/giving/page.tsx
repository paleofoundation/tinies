import type { Metadata } from "next";
import Link from "next/link";
import {
  getGivingStats,
  getGivingMonthlyTransparencyRows,
  getGivingRescuePartnerCards,
  getAnimalsSupportedCount,
} from "@/lib/giving/actions";
import { getFeaturedCampaignsForMarketing } from "@/lib/campaign/campaign-public";
import { GivingFeaturedCampaignCard } from "./GivingFeaturedCampaignCard";
import { GivingRescuePartnerCard } from "./GivingRescuePartnerCard";

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

const HOME_Y = "py-[clamp(4rem,8vw,8rem)]";
const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatEurCents(cents: number): string {
  return eur.format(cents / 100);
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.19l-3.72-3.72a.75.75 0 111.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default async function GivingPage() {
  const [stats, monthlyRows, partners, animalsSupported, featuredCampaigns] = await Promise.all([
    getGivingStats(),
    getGivingMonthlyTransparencyRows(),
    getGivingRescuePartnerCards(),
    getAnimalsSupportedCount(),
    getFeaturedCampaignsForMarketing(6),
  ]);

  const rescuePartnerCount = partners.length;

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

      <div className="border-b bg-[var(--color-background)]" style={{ borderColor: BORDER_TEAL_15 }}>
        <div className={`${HOME_INNER} pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2.5rem,5vw,4rem)]`}>
          <p
            className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-secondary)" }}
          >
            Transparency
          </p>
          <h1
            className="mt-4 max-w-[1100px] text-[clamp(2.5rem,8vw,5.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            <span className="block" style={{ color: "#1C1C1C" }}>
              every booking
            </span>
            <span className="block" style={{ color: "var(--color-primary)" }}>
              helps.
            </span>
          </h1>
          <p
            className="mt-5 max-w-[600px] text-[1.125rem] leading-[1.7]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
          >
            90% of our commission goes directly to rescue animal care in Cyprus. And our community gives even more. Every euro is tracked. Every cent is
            accounted for.
          </p>
        </div>
      </div>

      <section className="text-center text-white" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className={`${HOME_INNER} py-[clamp(3rem,6vw,5rem)]`}>
          <p
            className="mb-4 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "rgba(255, 255, 255, 0.6)" }}
          >
            Total donated to date
          </p>
          <p
            className="text-[clamp(3rem,10vw,7rem)] font-black uppercase leading-none tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "#FFFFFF" }}
          >
            {formatEurCents(stats.totalAllTime)}
          </p>
          <p className="mt-4 text-[0.9375rem]" style={{ color: "rgba(255, 255, 255, 0.6)", fontFamily: "var(--font-body), sans-serif" }}>
            From bookings, donations, and Tinies Guardians — combined
          </p>
        </div>
      </section>

      <section className={`${HOME_Y} bg-[var(--color-background)]`}>
        <div className={HOME_INNER}>
          <p
            className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-primary)" }}
          >
            How giving works
          </p>
          <h2
            className="mb-12 max-w-[900px] text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
          >
            three ways
            <br />
            <span style={{ color: "var(--color-secondary)" }}>to help</span>
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                bar: "var(--color-primary)",
                icon: "📊",
                title: "We give 90%",
                body: "90% of every commission goes to animal rescue. Automatically. Always. Every booking you make funds rescue care.",
                cta: null as { href: string; label: string } | null,
              },
              {
                bar: "var(--color-primary)",
                icon: "🔄",
                title: "Round up your booking",
                body: "Round up to the nearest euro at checkout. Every cent goes directly to rescue. It's the easiest way to help.",
                cta: null,
              },
              {
                bar: "var(--color-secondary)",
                icon: "💛",
                title: "Become a Tinies Guardian",
                body: "Give monthly and support rescue animals year-round. From €3/month. 100% reaches the rescue you choose.",
                cta: { href: "/giving/become-a-guardian", label: "Learn more →" },
              },
            ].map((card) => (
              <div
                key={card.title}
                className="overflow-hidden rounded-[24px] border bg-[var(--color-background)] shadow-[0_2px_8px_rgba(10,128,128,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
                style={{ borderColor: BORDER_TEAL_15 }}
              >
                <div className="h-1.5" style={{ backgroundColor: card.bar }} />
                <div className="p-7">
                  <div className="mb-4 text-[32px] leading-none">{card.icon}</div>
                  <h3 className="mb-2.5 text-[1.125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    {card.title}
                  </h3>
                  <p className="text-[0.875rem] leading-[1.7]" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                    {card.body}
                  </p>
                  {card.cta ? (
                    <Link
                      href={card.cta.href}
                      className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-bold hover:underline"
                      style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
                    >
                      {card.cta.label} <ArrowIcon className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredCampaigns.length > 0 ? (
        <section className={HOME_Y} style={{ backgroundColor: "var(--color-primary-50)" }}>
          <div className={HOME_INNER}>
            <p
              className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
              style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-secondary)" }}
            >
              Featured campaigns
            </p>
            <h2
              className="max-w-[900px] text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
            >
              give directly
              <br />
              <span style={{ color: "var(--color-primary)" }}>to a cause</span>
            </h2>
            <p
              className="mb-10 mt-4 max-w-[520px] text-base leading-[1.7]"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
            >
              Direct gifts toward a specific goal — food, medical funds, shelter, or the next chapter for animals in care.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {featuredCampaigns.map((c) => (
                <GivingFeaturedCampaignCard key={`${c.orgSlug}-${c.slug}`} c={c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="text-white" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className={`${HOME_INNER} py-[clamp(2.5rem,5vw,4rem)]`}>
          <p
            className="mb-6 text-center text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "rgba(255, 255, 255, 0.6)" }}
          >
            Impact at a glance
          </p>
          <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-4 md:gap-6">
            {[
              [formatEurCents(stats.totalAllTime), "Total donated", "All time, all sources"],
              [String(animalsSupported), "Animals on Tinies", "Available for adoption now"],
              [String(rescuePartnerCount), "Rescue partners", "Verified and funded"],
              [String(stats.activeGuardiansCount), "Tinies Guardians", "Monthly supporters"],
            ].map(([val, label, sub]) => (
              <div key={label} className="border-t border-white/15 pt-6">
                <div
                  className="text-[clamp(1.75rem,4vw,2.5rem)] font-black uppercase leading-tight tracking-[-0.03em]"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {val}
                </div>
                <div
                  className="mt-1.5 text-[0.8125rem] font-bold uppercase tracking-[0.06em]"
                  style={{ color: "rgba(255, 255, 255, 0.85)", fontFamily: "var(--font-body), sans-serif" }}
                >
                  {label}
                </div>
                <div className="mt-1 text-[0.6875rem]" style={{ color: "rgba(255, 255, 255, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${HOME_Y} bg-[var(--color-background)]`}>
        <div className={HOME_INNER}>
          <p
            className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-primary)" }}
          >
            Our rescue partners
          </p>
          <h2
            className="max-w-[900px] text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
          >
            where the
            <br />
            <span style={{ color: "var(--color-secondary)" }}>money goes</span>
          </h2>
          <p
            className="mb-10 mt-4 max-w-[520px] text-base leading-[1.7]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
          >
            Verified organisations listing animals on Tinies. See how support flows to each partner.
          </p>
          {partners.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
              Verified rescue partners will appear here as they join the platform.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {partners.map((p) => (
                <GivingRescuePartnerCard key={p.slug} p={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={HOME_Y} style={{ backgroundColor: "var(--color-primary-50)" }}>
        <div className={HOME_INNER}>
          <p
            className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-primary)" }}
          >
            Ledger
          </p>
          <h2
            className="max-w-[900px] text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
          >
            monthly
            <br />
            <span style={{ color: "var(--color-secondary)" }}>breakdown</span>
          </h2>
          <p
            className="mb-10 mt-4 max-w-[520px] text-base leading-[1.7]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
          >
            Donations recorded in the Tinies ledger (last 12 months, months with activity only).
          </p>
          {monthlyRows.length === 0 ? (
            <div
              className="mx-auto max-w-lg rounded-[20px] border bg-[var(--color-background)] text-center"
              style={{ borderColor: "var(--color-primary)", padding: "48px 32px" }}
            >
              <div className="mb-4 text-[48px] leading-none opacity-30" aria-hidden>
                📊
              </div>
              <p className="mb-2 text-base font-semibold" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                No donation activity yet
              </p>
              <p
                className="mx-auto max-w-[400px] text-[0.875rem] leading-relaxed"
                style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}
              >
                When the community gives, it will show here — every euro tracked, every month recorded. Be the first.
              </p>
              <Link
                href="/giving/become-a-guardian"
                className="mt-5 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.8125rem] font-bold transition-colors hover:bg-[rgba(244,93,72,0.06)]"
                style={{
                  borderColor: "var(--color-secondary)",
                  color: "var(--color-secondary)",
                  fontFamily: "var(--font-body), sans-serif",
                }}
              >
                <HeartIcon className="h-4 w-4" />
                Start giving
              </Link>
            </div>
          ) : (
            <div
              className="overflow-x-auto rounded-[20px] border bg-[var(--color-background)]"
              style={{ borderColor: BORDER_TEAL_15 }}
            >
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: BORDER_TEAL_15, backgroundColor: "var(--color-primary-50)" }}>
                    <th className="px-4 py-3 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Month
                    </th>
                    <th className="px-4 py-3 text-right font-semibold tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Total donated
                    </th>
                    <th className="px-4 py-3 text-right font-semibold tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Platform (90%)
                    </th>
                    <th className="px-4 py-3 text-right font-semibold tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Round-ups
                    </th>
                    <th className="px-4 py-3 text-right font-semibold tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Guardians
                    </th>
                    <th className="px-4 py-3 text-right font-semibold tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      One-time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRows.map((row) => (
                    <tr key={`${row.year}-${row.month}`} className="border-b last:border-0" style={{ borderColor: BORDER_TEAL_15 }}>
                      <td className="px-4 py-3" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                        {row.label}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--color-text)" }}>
                        {formatEurCents(row.totalCents)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "rgba(28, 28, 28, 0.7)" }}>
                        {formatEurCents(row.platformCents)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "rgba(28, 28, 28, 0.7)" }}>
                        {formatEurCents(row.roundupCents)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "rgba(28, 28, 28, 0.7)" }}>
                        {formatEurCents(row.guardianCents)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "rgba(28, 28, 28, 0.7)" }}>
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

      <section className={`${HOME_Y} text-center text-white`} style={{ backgroundColor: "var(--color-secondary)" }}>
        <div className={HOME_INNER}>
          <p
            className="mb-4 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "rgba(255, 255, 255, 0.6)" }}
          >
            Monthly giving
          </p>
          <h2
            className="mx-auto max-w-[900px] text-[clamp(2rem,7vw,4.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            become a
            <br />
            <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>tinies guardian</span>
          </h2>
          <p
            className="mx-auto mt-5 max-w-[520px] text-base leading-[1.7]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255, 255, 255, 0.78)" }}
          >
            Supporting animal rescue every month. Starting from EUR 3/month. 100% goes directly to the rescue you choose. No admin fees. No middlemen.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/giving/become-a-guardian"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[0.9375rem] font-bold shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}
            >
              <HeartIcon className="h-[18px] w-[18px]" />
              Become a Guardian
            </Link>
            <Link
              href="/adopt"
              className="inline-flex items-center rounded-full border border-white/30 bg-transparent px-7 py-3.5 text-[0.875rem] font-semibold text-white transition-colors hover:bg-white/10"
              style={{ fontFamily: "var(--font-body), sans-serif" }}
            >
              Browse adoptable animals
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y" style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}>
        <div className={`${HOME_INNER} flex flex-wrap items-start justify-center gap-x-10 gap-y-3 py-[clamp(4rem,8vw,8rem)]`}>
          {[
            ["✓ 90% of commission", "Of every marketplace booking"],
            ["✓ 100% of donations", "Reach the rescue directly"],
            ["✓ Every euro tracked", "Public ledger and monthly breakdown"],
            ["✓ Zero admin fees", "Guardian contributions go in full"],
          ].map(([title, sub]) => (
            <div key={title} className="max-w-[220px] text-center">
              <div className="text-[0.8125rem] font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
                {title}
              </div>
              <div className="mt-0.5 text-[0.75rem] leading-snug" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                {sub}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
