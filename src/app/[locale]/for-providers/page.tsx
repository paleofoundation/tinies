import type { Metadata } from "next";
import { FAQStack } from "@/components/marketing";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "For Providers",
  description:
    "List your pet care services for free. We bring you customers, take only 12% when you earn, and help you build your reputation with reviews. Flexible schedule — sign up today.",
};

/** Editorial layout tokens (aligned with homepage). */
const HOME_Y = "py-[clamp(4rem,8vw,8rem)]";
const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";
const CARD_SHADOW = "0 2px 8px rgba(10, 128, 128, 0.06)";
const VALUE_CARDS = [
  {
    emoji: "✦",
    title: "Free to list",
    text: "Create your profile, set your services and prices, and go live. No monthly fees or upfront costs.",
  },
  {
    emoji: "📍",
    title: "We bring you customers",
    text: "Pet owners search by location and service type. You get booking requests that match your availability and preferences.",
  },
  {
    emoji: "💰",
    title: "12% only when you earn",
    text: "We take a 12% commission on completed bookings. No booking, no fee. You keep 88% of what you earn.",
  },
  {
    emoji: "⭐",
    title: "Build your reputation",
    text: "Reviews from verified owners appear on your profile. Stand out with great ratings and repeat clients.",
  },
  {
    emoji: "📅",
    title: "Flexible schedule",
    text: "Set your own availability by day and time. Accept or decline requests. You're in control.",
  },
  {
    emoji: "🐾",
    title: "90% funds rescue",
    text: "Ninety percent of our commission goes to rescue animal care. When you earn through Tinies, the tinies get fed, treated, and sheltered too.",
  },
] as const;

const FAQ = [
  {
    q: "How do I get verified?",
    a: "Upload a government-issued ID. Our team reviews it within 24–48 hours. Once verified, your profile appears in search and you can receive bookings.",
  },
  {
    q: "When do I get paid?",
    a: "Payouts run weekly (minimum €20). After a booking is completed, your earnings minus commission are included in the next payout to your bank account via Stripe.",
  },
  {
    q: "What if I need to cancel?",
    a: "If you cancel, the owner gets a full refund. We track cancellation rates; high rates can affect your profile. Choose a cancellation policy (Flexible, Moderate, or Strict) that works for you.",
  },
  {
    q: "Can I offer more than one service?",
    a: "Yes. You can offer walking, sitting, boarding, drop-in visits, and daycare. Set a base price and optional extra-pet price per service.",
  },
] as const;

const FAQ_ITEMS = FAQ.map((item, index) => ({
  id: `for-providers-faq-${index}`,
  question: item.q,
  answer: item.a,
}));

const EARNINGS_ROWS: { service: string; rate: string; freq: string }[] = [
  { service: "Dog Walking", rate: "€12–18", freq: "per walk" },
  { service: "Pet Sitting", rate: "€25–40", freq: "per day" },
  { service: "Overnight Boarding", rate: "€35–55", freq: "per night" },
  { service: "Drop-In Visits", rate: "€15–25", freq: "per visit" },
  { service: "Daycare", rate: "€28–45", freq: "per day" },
];

function ProviderHowStep({
  num,
  title,
  description,
}: {
  num: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-[22px] border bg-white p-6 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
      style={{ borderColor: BORDER_TEAL_15, boxShadow: CARD_SHADOW }}
    >
      <div
        className="text-[1.875rem] font-black uppercase leading-none"
        style={{ color: "var(--color-primary)", fontFamily: "var(--font-display), sans-serif" }}
      >
        {num}
      </div>
      <h3
        className="mt-3 text-lg font-bold leading-snug"
        style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
      >
        {title}
      </h3>
      <p
        className="mt-3 text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
      >
        {description}
      </p>
    </div>
  );
}

export default function ForProvidersPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF", color: "#1C1C1C" }}>
      {/* HERO */}
      <section
        className="border-b pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2.5rem,5vw,4rem)]"
        style={{ backgroundColor: "#FFFFFF", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <p
            className="uppercase"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 800,
              letterSpacing: "0.08em",
              fontSize: "0.75rem",
              color: "#F45D48",
            }}
          >
            Providers
          </p>
          <h1
            className="mt-4 max-w-[min(100%,52rem)] uppercase"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.94,
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
            }}
          >
            <span className="block" style={{ color: "#1C1C1C" }}>
              earn money
            </span>{" "}
            <span className="block" style={{ color: "#0A8080" }}>
              caring for pets.
            </span>
          </h1>
          <p
            className="mt-6 max-w-[580px] text-[1.125rem] leading-[1.7]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28,28,28,0.7)" }}
          >
            Offer pet care on your terms. Free to join, 12% only when you earn. And 90% of our commission goes to rescue
            animal care. When you earn through Tinies, the tinies get fed, treated, and sheltered too.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/provider"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                backgroundColor: "#F45D48",
                color: "#FFFFFF",
                boxShadow: CARD_SHADOW,
              }}
            >
              Sign up as a provider
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border bg-white px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-[var(--color-primary-50)]"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                borderColor: "#0A8080",
                color: "#0A8080",
              }}
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      <main>
        {/* VALUE PROPS */}
        <section
          className={`theme-soft-noise ${HOME_Y} border-b`}
          style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}
        >
          <div className={HOME_INNER}>
            <p
              className="uppercase"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 800,
                letterSpacing: "0.08em",
                fontSize: "0.75rem",
                color: "#0A8080",
              }}
            >
              Why join Tinies
            </p>
            <h2
              className="mt-3 max-w-xl uppercase"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.94,
                fontSize: "clamp(2rem, 6vw, 3.25rem)",
                color: "#F45D48",
              }}
            >
              <span className="block">everything you need</span>
              <span className="block">to get started</span>
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {VALUE_CARDS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(10,128,128,0.1)]"
                  style={{
                    borderColor: BORDER_TEAL_15,
                    padding: "28px",
                    boxShadow: CARD_SHADOW,
                  }}
                >
                  <span className="text-[28px] leading-none" aria-hidden>
                    {item.emoji}
                  </span>
                  <h3
                    className="mt-4 font-bold leading-snug"
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      fontSize: "1.0625rem",
                      fontWeight: 700,
                      color: "#1C1C1C",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 leading-relaxed"
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      fontSize: "0.8125rem",
                      color: "rgba(28,28,28,0.7)",
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className={`${HOME_Y} border-b`}
          style={{ backgroundColor: "#FFFFFF", borderColor: BORDER_TEAL_15 }}
        >
          <div className={HOME_INNER}>
            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-14">
              <div className="min-w-0">
                <p
                  className="uppercase"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    fontSize: "0.75rem",
                    color: "#0A8080",
                  }}
                >
                  Three steps
                </p>
                <h2
                  className="mt-3 max-w-lg uppercase"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.94,
                    fontSize: "clamp(2rem, 6vw, 3.25rem)",
                    color: "#F45D48",
                  }}
                >
                  <span className="block">start earning</span>
                  <span className="block">in minutes</span>
                </h2>
                <p
                  className="mt-5 max-w-md text-base leading-relaxed"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28,28,28,0.7)" }}
                >
                  Create your profile, pass a quick ID check, and start receiving booking requests from pet owners across
                  Cyprus.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <ProviderHowStep
                  num="01"
                  title="Create your profile"
                  description="Add your services, set your rates, and show pet owners who you are."
                />
                <ProviderHowStep
                  num="02"
                  title="Get verified"
                  description="Upload government ID. Our team usually approves within 24–48 hours."
                />
                <ProviderHowStep
                  num="03"
                  title="Start earning"
                  description="Accept bookings, deliver great care, and get paid weekly via Stripe."
                />
              </div>
            </div>
          </div>
        </section>

        {/* EARNINGS TABLE */}
        <section className={HOME_Y} style={{ backgroundColor: "#0A8080", color: "#FFFFFF" }}>
          <div className={HOME_INNER}>
            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-14">
              <div className="min-w-0">
                <p
                  className="uppercase"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Earning potential
                </p>
                <h2
                  className="mt-3 max-w-lg uppercase"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.94,
                    fontSize: "clamp(2rem, 6vw, 3.25rem)",
                  }}
                >
                  <span className="block text-white">set your own</span>
                  <span className="block" style={{ color: "rgba(255,255,255,0.8)" }}>
                    prices
                  </span>
                </h2>
                <p
                  className="mt-5 max-w-md text-base leading-relaxed"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.85)" }}
                >
                  You keep 88% of every completed booking. Tinies takes 12% — and 90% of that commission funds rescue
                  animals. No hidden fees.
                </p>
              </div>
              <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10">
                {EARNINGS_ROWS.map((row, i) => (
                  <div
                    key={row.service}
                    className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                      i < EARNINGS_ROWS.length - 1 ? "border-b border-white/10" : ""
                    }`}
                    style={{
                      backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <span className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                      {row.service}
                    </span>
                    <div className="text-right sm:text-right">
                      <span className="text-lg font-bold tabular-nums" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                        {row.rate}
                      </span>
                      <span
                        className="mt-0.5 block text-sm sm:inline sm:mt-0 sm:ml-2"
                        style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body), sans-serif" }}
                      >
                        {row.freq}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RESCUE MISSION */}
        <section className={HOME_Y} style={{ backgroundColor: "#F45D48", color: "#FFFFFF" }}>
          <div className={`${HOME_INNER} text-center`}>
            <p
              className="uppercase"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 800,
                letterSpacing: "0.08em",
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              More than a gig
            </p>
            <h2
              className="mx-auto mt-3 max-w-2xl uppercase"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.94,
                fontSize: "clamp(2rem, 6vw, 3.5rem)",
              }}
            >
              <span className="block text-white">when you earn,</span>
              <span className="block" style={{ color: "rgba(255,255,255,0.8)" }}>
                rescue animals eat.
              </span>
            </h2>
            <p
              className="mx-auto mt-5 max-w-2xl text-base leading-relaxed"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.9)" }}
            >
              Ninety percent of our commission goes straight to rescue animal care — food, vet bills, shelter. This
              isn&apos;t a side project. It&apos;s why Tinies exists.
            </p>
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "€0.00 donated so far", sub: "Growing every day" },
                { label: "92+ cats at sanctuary", sub: "Gardens of St Gertrude" },
                { label: "100% transparent tracking", sub: "See every euro on Giving" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border px-5 py-6 backdrop-blur-[4px]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <p className="text-lg font-bold leading-snug" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    {s.label}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body), sans-serif" }}>
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={`${HOME_Y} border-b`} style={{ backgroundColor: "#FFFFFF", borderColor: BORDER_TEAL_15 }}>
          <div className={HOME_INNER}>
            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-14">
              <div className="min-w-0">
                <p
                  className="uppercase"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    fontSize: "0.75rem",
                    color: "#0A8080",
                  }}
                >
                  Common questions
                </p>
                <h2
                  className="mt-3 max-w-md uppercase"
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.94,
                    fontSize: "clamp(2rem, 6vw, 3.25rem)",
                    color: "#F45D48",
                  }}
                >
                  <span className="block">before you</span>
                  <span className="block">sign up</span>
                </h2>
              </div>
              <FAQStack items={FAQ_ITEMS} variant="editorial" allowMultiple className="min-w-0" />
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className={HOME_Y} style={{ backgroundColor: "#0A8080", color: "#FFFFFF" }}>
          <div className={`${HOME_INNER} text-center`}>
            <p
              className="uppercase"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 800,
                letterSpacing: "0.08em",
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Ready?
            </p>
            <h2
              className="mx-auto mt-3 max-w-3xl uppercase"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.94,
                fontSize: "clamp(2rem, 7vw, 4.5rem)",
              }}
            >
              <span className="block text-white">start earning</span>
              <span className="block" style={{ color: "rgba(255,255,255,0.8)" }}>
                today.
              </span>
            </h2>
            <p
              className="mx-auto mt-5 max-w-lg text-base leading-relaxed"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.9)" }}
            >
              Create your provider profile in minutes. Set your schedule, your prices, and your cancellation policy.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard/provider"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-95"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "#0A8080" }}
              >
                Sign up as a provider
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border-2 border-white bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                style={{ fontFamily: "var(--font-body), sans-serif" }}
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
