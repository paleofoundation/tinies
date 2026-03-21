import type { Metadata } from "next";
import Image from "next/image";
import { Building2, Coins, Heart, PawPrint } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getGivingStats, getAnimalsSupportedCount } from "@/lib/giving/actions";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

const GARDENS_HERO_IMAGE =
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg";

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatEurCents(cents: number): string {
  return eur.format(cents / 100);
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Tinies | Built to Fund Animal Rescue",
  description:
    "Tinies exists to fund rescue and care for animals who have no one else. A Cyprus pet care and adoption marketplace where 90% of every commission goes back to the animals — starting with Gardens of St Gertrude.",
  openGraph: {
    title: "About Tinies | Built to Fund Animal Rescue",
    description:
      "The real story: a sustainable marketplace built to feed and heal rescue animals in Cyprus. 90% of every euro we earn goes back to the animals.",
    url: `${BASE_URL}/about`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Tinies | Built to Fund Animal Rescue",
    description:
      "Not charity bolted onto a business — the business exists to fund the charity. Every booking helps a tiny.",
  },
};

export default async function AboutPage() {
  const [stats, animalsListed] = await Promise.all([getGivingStats(), getAnimalsSupportedCount()]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8">
          <div
            className="absolute inset-0 rounded-b-[3rem] sm:rounded-b-[4rem]"
            style={{ backgroundColor: "rgba(10, 128, 128, 0.07)" }}
          />
          <div className="relative mx-auto text-center" style={{ maxWidth: "var(--max-width)" }}>
            <h1
              className="font-normal tracking-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-4xl)", color: "var(--color-text)" }}
            >
              No matter the size.
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
            >
              Tinies was built with one purpose: to fund the rescue and care of animals who have no one else.
            </p>
          </div>
        </section>

        {/* Our story */}
        <section className="px-4 pb-16 sm:px-6 lg:px-8" style={{ paddingBottom: "var(--space-section)" }}>
          <div className="mx-auto" style={{ maxWidth: "42rem" }}>
            <h2
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
            >
              Our story
            </h2>
            <div
              className="mt-8 space-y-6 leading-relaxed"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-text)" }}
            >
              <p className="text-xl font-medium sm:text-2xl" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                Tinies started with 92 cats.
              </p>
              <p>
                Gardens of St Gertrude is a cat sanctuary in Parekklisia, Cyprus, caring for rescue cats who were abandoned,
                injured, or born on the streets. Feeding, sheltering, and providing veterinary care for 92 cats costs real money
                — every single day.
              </p>
              <p>
                We built Tinies to solve that problem. Not with donations alone, but with a sustainable business model: a pet
                services marketplace where 90% of every commission goes directly to animal rescue.
              </p>
              <p>
                Every dog walk booked on Tinies feeds a rescue cat. Every pet sitting booking pays for veterinary care. Every
                adoption coordinated through our platform funds the ongoing work of sanctuaries and rescue organisations across
                Cyprus.
              </p>
              <p className="font-medium" style={{ color: "var(--color-text)" }}>
                This isn&apos;t charity bolted onto a business. The business exists to fund the charity. That&apos;s the
                difference.
              </p>
            </div>
          </div>
        </section>

        {/* The mission */}
        <section
          className="border-t px-4 py-16 sm:px-6 lg:px-8"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
            <h2
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
            >
              The mission
            </h2>
            <div
              className="mt-8 max-w-3xl space-y-6 leading-relaxed"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}
            >
              <p style={{ color: "var(--color-text)" }}>
                Cyprus has one of the highest stray animal populations in Europe. Dozens of rescue organisations operate across
                the island, most run entirely by volunteers with no sustainable funding. Meanwhile, pet owners need trusted care
                for their animals, and families across Europe want to adopt rescue animals but face a logistics nightmare.
              </p>
              <p className="font-medium" style={{ color: "var(--color-text)" }}>
                Tinies bridges all of these gaps in one platform:
              </p>
              <ul className="list-disc space-y-3 pl-6" style={{ color: "var(--color-text-secondary)" }}>
                <li>Pet owners find verified, reviewed providers for walking, sitting, and boarding</li>
                <li>Rescue organisations list animals for adoption and receive donations</li>
                <li>International adopters get end-to-end coordination from Cyprus to their doorstep</li>
                <li className="font-medium" style={{ color: "var(--color-text)" }}>
                  And 90% of every euro we earn goes back to the animals
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Live stats */}
        <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ paddingBottom: "var(--space-section)" }}>
          <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
            <h2
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
            >
              The numbers
            </h2>
            <p
              className="mt-3 max-w-2xl text-sm"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
            >
              Live totals from our giving ledger — the same figures you&apos;ll see on{" "}
              <Link href="/giving" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                Tinies Giving
              </Link>
              .
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
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
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  Total donated to date
                </p>
                <p
                  className="mt-2 text-3xl font-semibold tabular-nums sm:text-4xl"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
                >
                  {formatEurCents(stats.totalDonatedAllTimeCents)}
                </p>
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  All tracked giving: commission share, round-ups, Guardians, and one-time gifts.
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
                  style={{ backgroundColor: "rgba(244, 93, 72, 0.12)", color: "var(--color-secondary)" }}
                >
                  <Building2 className="h-6 w-6" aria-hidden />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  Charities supported
                </p>
                <p
                  className="mt-2 text-3xl font-semibold tabular-nums sm:text-4xl"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
                >
                  {stats.charitiesSupportedCount}
                </p>
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Partner organisations that have received attributed support through Tinies.
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
                  <PawPrint className="h-6 w-6" aria-hidden />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  Animals in care
                </p>
                <p
                  className="mt-2 text-3xl font-semibold tabular-nums sm:text-4xl"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
                >
                  {animalsListed}
                </p>
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Rescue animals currently listed for adoption on Tinies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gardens of St Gertrude */}
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div
            className="mx-auto overflow-hidden rounded-[var(--radius-xl)] border"
            style={{ maxWidth: "var(--max-width)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-lg)" }}
          >
            <div className="relative aspect-[21/9] min-h-[200px] w-full sm:aspect-[3/1] sm:min-h-[280px]">
              <Image
                src={GARDENS_HERO_IMAGE}
                alt="Rescue cats at Gardens of St Gertrude sanctuary"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                aria-hidden
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <div className="flex items-center gap-2 text-white/90">
                  <Heart className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="text-sm font-semibold uppercase tracking-wide" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    Where it began
                  </span>
                </div>
                <h2
                  className="mt-2 max-w-xl font-normal text-white sm:text-3xl"
                  style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)" }}
                >
                  Gardens of St Gertrude
                </h2>
                <p
                  className="mt-3 max-w-xl text-sm leading-relaxed text-white/95 sm:text-base"
                  style={{ fontFamily: "var(--font-body), sans-serif" }}
                >
                  Gardens of St Gertrude is where it all began. A sanctuary in Parekklisia caring for 92 rescue cats. Every
                  booking on Tinies helps keep them fed, healthy, and safe.
                </p>
                <Link
                  href="/rescue/gardens-of-st-gertrude"
                  className="mt-6 inline-flex items-center rounded-[var(--radius-lg)] bg-white px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
                >
                  Visit the rescue profile →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency + contact */}
        <section
          className="border-t px-4 py-16 sm:px-6 lg:px-8"
          style={{ borderColor: "var(--color-border)", paddingBottom: "var(--space-section)" }}
        >
          <div className="mx-auto grid max-w-3xl gap-12">
            <div>
              <h2
                className="font-normal"
                style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
              >
                Transparency
              </h2>
              <p
                className="mt-4 leading-relaxed"
                style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}
              >
                Every euro is tracked. Visit our{" "}
                <Link href="/giving" className="font-semibold underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                  Giving
                </Link>{" "}
                page to see exactly where the money goes.
              </p>
            </div>
            <div>
              <h2
                className="font-normal"
                style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
              >
                Contact
              </h2>
              <p
                className="mt-4 leading-relaxed"
                style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}
              >
                <a
                  href="mailto:hello@tinies.app"
                  className="font-semibold underline-offset-2 hover:underline"
                  style={{ color: "var(--color-primary)" }}
                >
                  hello@tinies.app
                </a>
                {" — "}
                We&apos;d love to hear from you.
              </p>
            </div>
            <p className="text-center">
              <Link
                href="/"
                className="text-sm hover:underline"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
              >
                Back to home
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
