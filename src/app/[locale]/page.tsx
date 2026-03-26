import Image from "next/image";
import { BookOpen, Star, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeSearchBar } from "@/components/layout/HomeSearchBar";
import { BlogCard } from "@/components/blog/BlogCard";
import {
  AdoptablesGrid,
  EditorialButton,
  FAQStack,
  HeroEditorial,
  PressStrip,
  ProviderGrid,
  SectionHeader,
  StatsBand,
  TestimonialsGrid,
} from "@/components/marketing";
import { getHomepageData } from "@/lib/home/get-homepage-data";
import { getBlogPostSummaries } from "@/lib/blog/load-posts";
import { getSiteImageWithFallback } from "@/lib/images/get-site-image";
import { formatPrice } from "@/lib/utils";

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

const HERO_CATS_URL =
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg";
const SANCTUARY_STORY_URL =
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_garden_cat.jpg";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tinies",
  url: BASE_URL,
  description: "Trusted pet care and rescue adoption in Cyprus. No matter the size.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/services/search?type={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const HOMEPAGE_FAQ_ITEMS = [
  {
    question: "How much does it cost?",
    answer:
      "Providers set their own rates. Tinies adds a 12% service fee — and 90% of that fee goes directly to animal rescue. You're not just paying for pet care, you're funding the care of rescue animals across Cyprus.",
  },
  {
    question: "Is my pet safe?",
    answer:
      "Every provider is identity-verified and reviewed by real pet owners. Plus, every booking is covered by the Tinies Guarantee — up to EUR 2,000 for veterinary costs if anything goes wrong.",
  },
  {
    question: "How does international adoption work?",
    answer:
      "We coordinate everything: vet preparation, EU pet passport, transport, and customs documentation. You pay one transparent fee, and your new family member arrives at your door. Typically 4-8 weeks from approval to arrival.",
  },
  {
    question: "Where does the money go?",
    answer:
      "90% of our commission goes directly to rescue animal care — food, vet bills, shelter. Every euro is tracked on our giving page. This isn't charity on the side. The business exists to fund the rescue.",
  },
  {
    question: "Can I meet the provider before booking?",
    answer:
      "Yes. Request a free meet-and-greet from any provider's profile. Meet in person or by video call before you commit.",
  },
  {
    question: "What if I need to cancel?",
    answer:
      "Each provider sets their cancellation policy — Flexible, Moderate, or Strict. The policy is shown before you book so there are no surprises. Provider cancellations always mean a full refund.",
  },
] as const;

const homepageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOMEPAGE_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

/** Editorial homepage: section vertical rhythm + 1280px container (matches editorial-preview). */
const HOME_Y = "py-[clamp(4rem,8vw,8rem)]";
const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

const HOMEPAGE_FAQ_PREVIEW = HOMEPAGE_FAQ_ITEMS.slice(0, 4);
const FAQ_STACK_PREVIEW = HOMEPAGE_FAQ_PREVIEW.map((item, index) => ({
  id: `home-faq-preview-${index}`,
  question: item.question,
  answer: item.answer,
}));

function formatSpecies(species: string): string {
  if (!species) return "Pet";
  return species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();
}

function StarRow({ rating, onCoral }: { rating: number; onCoral?: boolean }) {
  const rounded = Math.min(5, Math.max(0, Math.round(rating)));
  const fillOn = onCoral ? "#ffffff" : "var(--color-secondary)";
  const strokeOn = onCoral ? "#ffffff" : "var(--color-secondary)";
  const strokeOff = onCoral ? "rgba(255,255,255,0.4)" : "var(--color-text-muted)";
  return (
    <div className="flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-4 w-4 shrink-0"
          strokeWidth={1.5}
          style={{
            fill: i < rounded ? fillOn : "transparent",
            color: i < rounded ? strokeOn : strokeOff,
          }}
        />
      ))}
    </div>
  );
}

function providerPhoto(p: {
  avatarUrl: string | null;
  photos: string[];
}): string | null {
  if (p.avatarUrl?.trim()) return p.avatarUrl.trim();
  const first = p.photos[0]?.trim();
  return first || null;
}

function EditorialHowStep({
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
      style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
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

export default async function Home() {
  const tHero = await getTranslations("home.hero");
  const tPreview = await getTranslations("home.howItWorksPreview");
  const tEd = await getTranslations("home.editorial");
  const homeData = await getHomepageData();
  const recentPostsRaw = getBlogPostSummaries().slice(0, 3);
  const recentPosts = await Promise.all(
    recentPostsRaw.map(async (p) => ({
      ...p,
      image: await getSiteImageWithFallback(`blog-${p.slug}`, p.image),
    }))
  );
  const heroImageUrl = await getSiteImageWithFallback("page-homepage-hero", HERO_CATS_URL);
  const sanctuaryImageUrl = await getSiteImageWithFallback("page-homepage-sanctuary", SANCTUARY_STORY_URL);

  const {
    completedBookingsCount,
    fiveStarReviewsCount,
    completedAdoptionsCount,
    donationsTotalCents,
    featuredProviders,
    featuredListings,
    recentReviews,
    featuredCampaign,
  } = homeData;

  const donationDisplay = formatPrice(donationsTotalCents, { useSymbol: false });

  const stats = [
    { value: completedBookingsCount.toLocaleString("en-CY"), label: "bookings completed" },
    { value: fiveStarReviewsCount.toLocaleString("en-CY"), label: "five-star reviews" },
    { value: completedAdoptionsCount.toLocaleString("en-CY"), label: "animals adopted" },
    { value: donationDisplay, label: "donated to rescue" },
  ] as const;

  const campaignSnippet = featuredCampaign
    ? (featuredCampaign.subtitle?.trim() || featuredCampaign.title).length > 120
      ? `${(featuredCampaign.subtitle?.trim() || featuredCampaign.title).slice(0, 117)}…`
      : featuredCampaign.subtitle?.trim() || featuredCampaign.title
    : null;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqJsonLd) }} />

      <HeroEditorial
        bleedClassName="theme-paper-grid bg-[var(--color-background)]"
        eyebrow={tHero("eyebrow")}
        title={
          <>
            <span className="block" style={{ color: "var(--color-text)" }}>
              {tHero("titleLine1")}
            </span>
            <span className="block" style={{ color: "var(--color-text)" }}>
              {tHero("titleLine2")}
            </span>
            <span className="block" style={{ color: "var(--color-primary)" }}>
              {tHero("titleLine3")}
            </span>
          </>
        }
        description={tHero("tagline")}
        image={{ src: heroImageUrl, alt: "Rescue cats at Gardens of St Gertrude sanctuary, Cyprus", priority: true }}
        overlappingCard={
          <div
            className="rounded-[24px] border bg-white p-6 text-left"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              borderColor: BORDER_TEAL_15,
              boxShadow: "0 8px 32px rgba(10, 128, 128, 0.1)",
            }}
          >
            <p
              className="theme-display text-[clamp(1.35rem,3vw,1.875rem)] leading-[1.05]"
              style={{ color: "var(--color-primary)" }}
            >
              {tHero("sanctuaryCardTitle")}
            </p>
            <div
              className="mt-3 h-1.5 w-28 rounded-full"
              style={{ backgroundColor: "var(--color-secondary)" }}
              aria-hidden
            />
            <p
              className="mt-4 text-sm leading-relaxed sm:text-[0.9375rem]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {featuredCampaign ? (
                <>
                  Right now:{" "}
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>
                    {campaignSnippet}
                  </span>
                </>
              ) : (
                tHero("sanctuaryCardBody")
              )}
            </p>
            {featuredCampaign ? (
              <EditorialButton
                href={`/rescue/${featuredCampaign.orgSlug}/campaign/${featuredCampaign.slug}`}
                variant="secondary"
                className="mt-5 min-h-9 !border-[1.5px] !border-[var(--color-secondary)] !bg-white !text-[var(--color-secondary)] !shadow-none hover:!bg-[var(--color-secondary-muted-08)] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em]"
              >
                {tHero("sanctuaryCardCta")}
              </EditorialButton>
            ) : (
              <EditorialButton
                href="/giving"
                variant="secondary"
                className="mt-5 min-h-9 !border-[1.5px] !border-[var(--color-secondary)] !bg-white !text-[var(--color-secondary)] !shadow-none hover:!bg-[var(--color-secondary-muted-08)] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em]"
              >
                {tHero("sanctuaryCardCta")}
              </EditorialButton>
            )}
          </div>
        }
        actions={
          <>
            <div className="w-full max-w-3xl">
              <HomeSearchBar variant="hero" compactTopMargin />
            </div>
            <div
              className="w-full max-w-3xl border-t pt-6"
              style={{ fontFamily: "var(--font-body), sans-serif", borderColor: BORDER_TEAL_15 }}
            >
              <div
                className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[0.875rem] font-medium"
                style={{ color: "rgba(28, 28, 28, 0.7)" }}
              >
                <span>92+ verified providers</span>
                <span>90% to animal rescue</span>
                <span>EUR 2,000 guarantee</span>
              </div>
            </div>
          </>
        }
      />

      <StatsBand stats={stats} />

      <section
        className={`${HOME_Y} border-b`}
        style={{ backgroundColor: "var(--color-background)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
            <div className="min-w-0">
              <p className="theme-eyebrow mb-4" style={{ color: "var(--color-primary)" }}>
                {tEd("howEyebrow")}
              </p>
              <h2
                className="theme-display max-w-xl text-[clamp(2rem,6vw,3.75rem)] leading-[0.95]"
                style={{ color: "var(--color-text)" }}
              >
                <span className="block">{tEd("howLine1")}</span>
                <span className="block">{tEd("howLine2")}</span>
                <span className="block" style={{ color: "var(--color-secondary)" }}>
                  {tEd("howLine3")}
                </span>
                <span className="block" style={{ color: "var(--color-secondary)" }}>
                  {tEd("howLine4")}
                </span>
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <EditorialHowStep
                num="01"
                title={tPreview("stepSearch")}
                description={tPreview("stepSearchDesc")}
              />
              <EditorialHowStep
                num="02"
                title={tPreview("stepBook")}
                description={tPreview("stepBookDesc")}
              />
              <EditorialHowStep
                num="03"
                title={tPreview("stepRelax")}
                description={tPreview("stepRelaxDesc")}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className={`theme-soft-noise ${HOME_Y} border-b`}
        style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
            <div className="min-w-0 max-w-lg">
              <p className="theme-eyebrow mb-4" style={{ color: "var(--color-secondary)" }}>
                {tEd("providersEyebrow")}
              </p>
              <h2
                className="theme-display text-[clamp(2rem,6vw,3.75rem)] leading-[0.95]"
                style={{ color: "var(--color-text)" }}
              >
                <span className="block">{tEd("provLine1")}</span>
                <span className="block">{tEd("provLine2")}</span>
                <span className="block" style={{ color: "var(--color-primary)" }}>
                  {tEd("provLine3")}
                </span>
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
              >
                {tEd("providersBody")}
              </p>
            </div>
            <div className="min-w-0">
              {featuredProviders.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
                >
                  Verified providers will appear here as they join.{" "}
                  <Link href="/services/search" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                    Browse search
                  </Link>
                </p>
              ) : (
                <ProviderGrid>
                  {featuredProviders.map((p) => {
                    const img = providerPhoto(p);
                    const rating = p.avgRating ?? 0;
                    return (
                      <Link
                        key={p.slug}
                        href={`/services/provider/${p.slug}`}
                        className="group block overflow-hidden border bg-white no-underline transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
                        style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
                      >
                        <div
                          className="relative h-[224px] w-full overflow-hidden"
                          style={{ backgroundColor: "var(--color-primary-muted-08)" }}
                        >
                          {img ? (
                            <Image
                              src={img}
                              alt={`${p.displayName}, verified pet care provider`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-4xl" aria-hidden>
                              🐾
                            </div>
                          )}
                        </div>
                        <div className="p-5 text-left">
                          <p
                            className="text-[1.375rem] font-black uppercase leading-tight tracking-tight"
                            style={{ color: "var(--color-primary)", fontFamily: "var(--font-display), sans-serif" }}
                          >
                            {p.displayName}
                          </p>
                          <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                            {rating.toFixed(1)} · {p.reviewCount} {p.reviewCount === 1 ? "review" : "reviews"}
                          </p>
                          {p.district ? (
                            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                              {p.district}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </ProviderGrid>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${HOME_Y} border-b`}
        style={{ backgroundColor: "var(--color-background)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="max-w-4xl">
            <p className="theme-eyebrow mb-4" style={{ color: "var(--color-primary)" }}>
              {tEd("adoptEyebrow")}
            </p>
            <h2
              className="theme-display text-[clamp(2rem,6vw,3.75rem)] leading-[0.95]"
              style={{ color: "var(--color-text)" }}
            >
              <span className="block">{tEd("adoptLine1")}</span>
              <span className="block" style={{ color: "var(--color-secondary)" }}>
                {tEd("adoptLine2")}
              </span>
            </h2>
          </div>
          {featuredListings.length === 0 ? (
            <p
              className="mt-12 text-center text-sm"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
            >
              New adoptable animals will appear here soon.{" "}
              <Link href="/adopt" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                Browse all adoptions
              </Link>
            </p>
          ) : (
            <AdoptablesGrid className="mt-12">
              {featuredListings.map((listing) => {
                const photo = listing.photos[0];
                return (
                  <article
                    key={listing.slug}
                    className="group flex flex-col overflow-hidden border bg-white transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
                    style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
                  >
                    <div
                      className="relative h-[224px] w-full overflow-hidden border-b"
                      style={{ borderColor: BORDER_TEAL_15, backgroundColor: "var(--color-background)" }}
                    >
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${listing.name}, ${formatSpecies(listing.species)} — adoptable`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl" aria-hidden>
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3
                        className="text-[1.375rem] font-black uppercase leading-tight tracking-tight"
                        style={{ color: "var(--color-text)", fontFamily: "var(--font-display), sans-serif" }}
                      >
                        {listing.name}
                      </h3>
                      <p
                        className="mt-2 text-sm font-medium"
                        style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}
                      >
                        {listing.breed ? `${listing.breed} · ` : ""}
                        {formatSpecies(listing.species)}
                        {listing.estimatedAge ? ` · ${listing.estimatedAge}` : ""}
                      </p>
                      {listing.personalitySnippet ? (
                        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                          {listing.personalitySnippet}
                        </p>
                      ) : null}
                      <Link
                        href={`/adopt/${listing.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                        style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}
                      >
                        Meet {listing.name}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </AdoptablesGrid>
          )}
          <div className="mt-10 text-center">
            <EditorialButton href="/adopt" variant="secondary">
              View all adoptable tinies →
            </EditorialButton>
          </div>
        </div>
      </section>

      <section
        className={`${HOME_Y} border-b`}
        style={{ backgroundColor: "#0A8080", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-16">
            <div className="min-w-0 max-w-md">
              <p className="theme-eyebrow mb-4 text-white/75">{tEd("whyEyebrow")}</p>
              <h2 className="theme-display text-[clamp(2rem,6vw,3.75rem)] leading-[0.95] text-white">
                <span className="block">{tEd("whyLine1")}</span>
                <span className="block">{tEd("whyLine2")}</span>
                <span className="block">{tEd("whyLine3")}</span>
                <span className="block">{tEd("whyLine4")}</span>
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  { title: tEd("whyCard1Title"), body: tEd("whyCard1Body") },
                  { title: tEd("whyCard2Title"), body: tEd("whyCard2Body") },
                  { title: tEd("whyCard3Title"), body: tEd("whyCard3Body") },
                ] as const
              ).map((card) => (
                <div
                  key={card.title}
                  className="rounded-[24px] border border-white/15 bg-white/[0.08] p-6 backdrop-blur-[4px]"
                >
                  <h3 className="theme-display text-[1.375rem] leading-tight text-white">{card.title}</h3>
                  <p
                    className="mt-4 text-sm leading-relaxed text-white/78"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${HOME_Y} border-b`}
        style={{ backgroundColor: "var(--color-background)", borderColor: BORDER_TEAL_15 }}
      >
        <div className={HOME_INNER}>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="relative min-h-[320px] w-full sm:min-h-[400px] lg:min-h-[480px]">
              <div
                className="pointer-events-none absolute right-4 top-0 hidden h-[88%] w-[74%] sm:block"
                style={{ backgroundColor: "var(--color-secondary-muted-12)" }}
                aria-hidden
              />
              <div
                className="absolute bottom-0 right-0 h-[min(84%,420px)] w-[min(92%,100%)] overflow-hidden rounded-[24px] sm:h-[84%] sm:w-[80%]"
                style={{ boxShadow: "0 8px 32px rgba(10, 128, 128, 0.1)" }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={sanctuaryImageUrl}
                    alt="Cat at sanctuary"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </div>
              </div>
              <div
                className="absolute bottom-10 left-0 z-[2] max-w-[340px] rounded-[24px] border bg-white p-6"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  borderColor: BORDER_TEAL_15,
                  boxShadow: "0 8px 32px rgba(10, 128, 128, 0.1)",
                }}
              >
                <p
                  className="theme-display text-[clamp(1.35rem,3vw,1.875rem)] leading-none"
                  style={{ color: "var(--color-primary)" }}
                >
                  {tEd("givingCardTitle")}
                </p>
                <div
                  className="mt-3 h-1.5 w-24 rounded-full"
                  style={{ backgroundColor: "var(--color-secondary)" }}
                  aria-hidden
                />
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">{tEd("givingCardBody")}</p>
              </div>
            </div>
            <div className="min-w-0">
              <p className="theme-eyebrow mb-4" style={{ color: "var(--color-primary)" }}>
                {tEd("givingEyebrow")}
              </p>
              <h2
                className="theme-display max-w-xl text-[clamp(2rem,6vw,3.75rem)] leading-[0.95]"
                style={{ color: "var(--color-text)" }}
              >
                <span className="block">{tEd("givingLine1")}</span>
                <span className="block">{tEd("givingLine2")}</span>
                <span className="block" style={{ color: "var(--color-secondary)" }}>
                  {tEd("givingLine3")}
                </span>
                <span className="block" style={{ color: "var(--color-secondary)" }}>
                  {tEd("givingLine4")}
                </span>
                <span className="block" style={{ color: "var(--color-secondary)" }}>
                  {tEd("givingLine5")}
                </span>
              </h2>
              <p
                className="mt-5 max-w-md text-base leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
              >
                {tEd("givingSub")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <EditorialButton href="/giving/become-a-guardian" variant="primary">
                  {tEd("givingCta1")}
                </EditorialButton>
                <EditorialButton href="/giving" variant="secondary">
                  {tEd("givingCta2")}
                </EditorialButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsGrid
        background="secondary"
        layout="editorialSide"
        intro={
          <div>
            <p className="theme-eyebrow mb-4 text-white/75">{tEd("testimonialsEyebrow")}</p>
            <h2 className="theme-display max-w-[14ch] text-[clamp(2rem,6vw,3.75rem)] leading-[0.95] text-white">
              {tEd("testimonialsTitle")}
            </h2>
          </div>
        }
      >
        {recentReviews.length === 0 ? (
          <p
            className="col-span-full text-sm text-white/80"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Reviews from completed bookings will show here.
          </p>
        ) : (
          recentReviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col border bg-white/[0.08] p-6 backdrop-blur-[4px]"
              style={{ borderColor: "rgba(255, 255, 255, 0.18)" }}
            >
              <StarRow rating={r.rating} onCoral />
              <p
                className="mt-3 flex-1 text-sm leading-relaxed text-white/92"
                style={{ fontFamily: "var(--font-body)" }}
              >
                &ldquo;{r.textExcerpt}&rdquo;
              </p>
              <p
                className="mt-4 theme-eyebrow text-[0.7rem] text-white/72"
                style={{ letterSpacing: "0.08em" }}
              >
                {r.reviewerFirstName.toUpperCase()} · {r.providerName.toUpperCase()}
              </p>
              <p className="mt-2 text-xs text-white/58" style={{ fontFamily: "var(--font-body)" }}>
                <time dateTime={r.createdAt.toISOString()}>
                  {r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </time>
              </p>
            </div>
          ))
        )}
      </TestimonialsGrid>

      {recentPosts.length > 0 ? (
        <section
          className={`${HOME_Y} border-b`}
          style={{ backgroundColor: "var(--color-background)", borderColor: BORDER_TEAL_15 }}
        >
          <div className={HOME_INNER}>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div className="flex items-start gap-3">
                <BookOpen
                  className="mt-1 h-8 w-8 shrink-0"
                  style={{ color: "var(--color-primary)" }}
                  aria-hidden
                />
                <SectionHeader
                  eyebrow="Resources"
                  title="From the blog"
                  description="Pet care tips, adoption guides, and rescue stories from Cyprus."
                  className="max-w-lg"
                />
              </div>
              <EditorialButton href="/blog" variant="secondary" className="shrink-0">
                View all posts
              </EditorialButton>
            </div>
            <ul className="mt-12 grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <PressStrip label={tEd("pressLabel")} description={tEd("pressDesc")}>
        <div
          className="flex min-h-[72px] items-center justify-center rounded-[18px] border bg-white px-3 py-4"
          style={{ borderColor: BORDER_TEAL_15 }}
        >
          <span
            className="text-[clamp(1rem,2vw,1.25rem)] font-bold uppercase tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {tEd("pressToday")}
          </span>
        </div>
        <div
          className="flex min-h-[72px] items-center justify-center rounded-[18px] border bg-white px-3 py-4"
          style={{ borderColor: BORDER_TEAL_15 }}
        >
          <span
            className="text-[clamp(1rem,2vw,1.25rem)] font-bold uppercase tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {tEd("pressForbes")}
          </span>
        </div>
        <div
          className="flex min-h-[72px] flex-col items-center justify-center gap-0 rounded-[18px] border bg-white px-2 py-3 text-center leading-none"
          style={{ borderColor: BORDER_TEAL_15 }}
        >
          <span
            className="text-[clamp(0.75rem,1.5vw,1rem)] font-bold uppercase tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {tEd("pressFastLine1")}
          </span>
          <span
            className="text-[clamp(0.75rem,1.5vw,1rem)] font-bold uppercase tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {tEd("pressFastLine2")}
          </span>
        </div>
        <div
          className="flex min-h-[72px] items-center justify-center rounded-[18px] border bg-white px-3 py-4"
          style={{ borderColor: BORDER_TEAL_15 }}
        >
          <span
            className="text-[clamp(1rem,2vw,1.25rem)] font-bold uppercase tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {tEd("pressSalon")}
          </span>
        </div>
        <div
          className="flex min-h-[72px] items-center justify-center rounded-[18px] border bg-white px-3 py-4 sm:col-span-2 lg:col-span-1"
          style={{ borderColor: BORDER_TEAL_15 }}
        >
          <span
            className="text-[clamp(0.85rem,1.8vw,1.15rem)] font-bold uppercase tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {tEd("pressTechCrunch")}
          </span>
        </div>
      </PressStrip>

      <section
        className={`${HOME_Y} border-b`}
        style={{ backgroundColor: "var(--color-background)", borderColor: BORDER_TEAL_15 }}
        aria-labelledby="homepage-faq-heading"
      >
        <div className={HOME_INNER}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start lg:gap-16">
            <div className="min-w-0">
              <p className="theme-eyebrow mb-4" style={{ color: "var(--color-primary)" }}>
                {tEd("faqEyebrow")}
              </p>
              <h2
                id="homepage-faq-heading"
                className="theme-display max-w-xl text-[clamp(2rem,6vw,3.75rem)] leading-[0.95]"
              >
                <span className="block text-[var(--color-text)]">{tEd("faqLine1")}</span>
                <span className="block text-[var(--color-text)]">{tEd("faqLine2")}</span>
                <span className="block text-[var(--color-secondary)]">{tEd("faqLine3")}</span>
                <span className="block text-[var(--color-secondary)]">{tEd("faqLine4")}</span>
              </h2>
              <EditorialButton href="/faq" variant="secondary" className="mt-8">
                {tEd("faqSeeAll")}
              </EditorialButton>
            </div>
            <FAQStack items={FAQ_STACK_PREVIEW} variant="editorial" />
          </div>
        </div>
      </section>
    </div>
  );
}
