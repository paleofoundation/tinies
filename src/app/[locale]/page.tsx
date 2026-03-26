import Image from "next/image";
import type { ReactNode } from "react";
import {
  Search,
  Calendar,
  Heart,
  BookOpen,
  Star,
  ArrowRight,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeSearchBar } from "@/components/layout/HomeSearchBar";
import { BlogCard } from "@/components/blog/BlogCard";
import {
  AdoptablesGrid,
  EditorialButton,
  FAQStack,
  HeroEditorial,
  ProviderGrid,
  SectionHeader,
  StatsBand,
  TestimonialsGrid,
} from "@/components/marketing";
import { PageContainer, Section } from "@/components/theme";
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

const FAQ_STACK_ITEMS = HOMEPAGE_FAQ_ITEMS.map((item, index) => ({
  id: `home-faq-${index}`,
  question: item.question,
  answer: item.answer,
}));

function formatSpecies(species: string): string {
  if (!species) return "Pet";
  return species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();
}

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <div className="flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-4 w-4 shrink-0"
          strokeWidth={1.5}
          style={{
            fill: i < rounded ? "var(--color-secondary)" : "transparent",
            color: i < rounded ? "var(--color-secondary)" : "var(--color-text-muted)",
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

function HowItWorksCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="theme-card flex flex-col rounded-[22px] p-8 text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--color-primary-muted-12)", color: "var(--color-primary)" }}
      >
        {icon}
      </div>
      <h3
        className="mt-4 text-lg font-extrabold leading-snug"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
      >
        {title}
      </h3>
      <p
        className="mt-2 text-sm leading-relaxed"
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
    activeGuardiansCount,
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
        eyebrow={tHero("subtagline")}
        title={tHero("title")}
        description={tHero("tagline")}
        image={{ src: heroImageUrl, alt: "Rescue cats at Gardens of St Gertrude sanctuary, Cyprus", priority: true }}
        overlappingCard={
          featuredCampaign ? (
            <div
              className="theme-card rounded-[var(--radius-xl)] px-4 py-3 text-center text-sm shadow-[var(--shadow-md)] sm:text-base"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                Right now: <span className="font-normal">{campaignSnippet}</span>
              </span>{" "}
              <Link
                href={`/rescue/${featuredCampaign.orgSlug}/campaign/${featuredCampaign.slug}`}
                className="inline-block font-semibold underline-offset-2 hover:underline"
                style={{ color: "var(--color-secondary)" }}
              >
                Learn more
              </Link>
            </div>
          ) : undefined
        }
        actions={
          <>
            <div className="w-full max-w-3xl">
              <HomeSearchBar variant="hero" />
            </div>
            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:text-base"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
            >
              <span>92+ verified providers</span>
              <span className="hidden sm:inline" style={{ color: "var(--color-text-muted)" }} aria-hidden>
                •
              </span>
              <span>90% to animal rescue</span>
              <span className="hidden sm:inline" style={{ color: "var(--color-text-muted)" }} aria-hidden>
                •
              </span>
              <span>EUR 2,000 guarantee</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <EditorialButton href="/services/search" variant="primary">
                Book now
              </EditorialButton>
              <EditorialButton href="/how-it-works" variant="secondary">
                Meet & greet
              </EditorialButton>
            </div>
          </>
        }
      />

      <StatsBand stats={stats} />

      <Section background="background" padded className="border-b border-[var(--color-border)]">
        <PageContainer>
          <SectionHeader
            align="center"
            title={tPreview("title")}
            description={tPreview("subtitle")}
            className="mx-auto"
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
            <HowItWorksCard
              icon={<Search className="h-7 w-7" strokeWidth={1.75} />}
              title={tPreview("stepSearch")}
              description={tPreview("stepSearchDesc")}
            />
            <HowItWorksCard
              icon={<Calendar className="h-7 w-7" strokeWidth={1.75} />}
              title={tPreview("stepBook")}
              description={tPreview("stepBookDesc")}
            />
            <HowItWorksCard
              icon={<Heart className="h-7 w-7" strokeWidth={1.75} />}
              title={tPreview("stepRelax")}
              description={tPreview("stepRelaxDesc")}
            />
          </div>
        </PageContainer>
      </Section>

      <Section background="surface" padded className="border-b border-[var(--color-border)]">
        <PageContainer>
          <SectionHeader
            align="center"
            eyebrow="Verified carers"
            title="Trusted by pet owners across Cyprus"
            description="Verified carers with real reviews. Tap a profile to book or request a meet-and-greet."
          />
          {featuredProviders.length === 0 ? (
            <p
              className="mt-10 text-center text-sm"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
            >
              Verified providers will appear here as they join.{" "}
              <Link href="/services/search" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                Browse search
              </Link>
            </p>
          ) : (
            <ProviderGrid className="mt-10">
              {featuredProviders.map((p) => {
                const img = providerPhoto(p);
                const rating = p.avgRating ?? 0;
                return (
                  <Link
                    key={p.slug}
                    href={`/services/provider/${p.slug}`}
                    className="theme-card block overflow-hidden rounded-[22px] no-underline"
                  >
                    <div
                      className="relative aspect-[4/3] w-full"
                      style={{ backgroundColor: "var(--color-primary-muted-08)" }}
                    >
                      {img ? (
                        <Image
                          src={img}
                          alt={`${p.displayName}, verified pet care provider`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl" aria-hidden>
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="p-5 text-left">
                      <p className="font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                        {p.displayName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StarRow rating={rating} />
                        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {rating.toFixed(1)} · {p.reviewCount} reviews
                        </span>
                      </div>
                      {p.headline ? (
                        <p className="mt-2 line-clamp-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {p.headline}
                        </p>
                      ) : null}
                      {p.district ? (
                        <p
                          className="mt-2 text-xs font-medium uppercase tracking-wide"
                          style={{ color: "var(--color-primary)" }}
                        >
                          {p.district}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </ProviderGrid>
          )}
        </PageContainer>
      </Section>

      <Section background="background" padded className="border-b border-[var(--color-border)]">
        <PageContainer>
          <SectionHeader
            align="center"
            eyebrow="Adoption"
            title="Tinies looking for homes"
            description="Adopt a rescue animal and give them a forever home."
          />
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
                    className="theme-card flex flex-col overflow-hidden rounded-[22px]"
                  >
                    <div
                      className="relative aspect-[4/3] w-full border-b"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                    >
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${listing.name}, ${formatSpecies(listing.species)} — adoptable`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl" aria-hidden>
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                        {listing.name}
                      </h3>
                      <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
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
        </PageContainer>
      </Section>

      <Section background="background" padded className="border-b border-[var(--color-border)]">
        <PageContainer>
          <SectionHeader
            align="center"
            eyebrow="Our model"
            title="Why Tinies is different"
            className="mx-auto max-w-2xl"
          />
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            <div className="text-center md:text-left">
              <h3
                className="text-lg font-extrabold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}
              >
                90% to rescue
              </h3>
              <p
                className="mt-3 text-sm leading-relaxed sm:text-base"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
              >
                We&apos;re not a business that donates. We&apos;re a rescue operation that runs a marketplace. 90% of every
                commission feeds, shelters, and provides vet care for rescue animals.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3
                className="text-lg font-extrabold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}
              >
                Real verification
              </h3>
              <p
                className="mt-3 text-sm leading-relaxed sm:text-base"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
              >
                Every provider is identity-verified. Every rescue org is registered. Every euro is tracked.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3
                className="text-lg font-extrabold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}
              >
                The Tinies Guarantee
              </h3>
              <p
                className="mt-3 text-sm leading-relaxed sm:text-base"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
              >
                Up to EUR 2,000 vet coverage. Full refund for no-shows. Your pet is protected.
              </p>
            </div>
          </div>
        </PageContainer>
      </Section>

      <TestimonialsGrid
        background="primary-50"
        intro={
          <SectionHeader
            align="center"
            eyebrow="Community"
            title="What pet owners are saying"
            className="mx-auto"
          />
        }
      >
        {recentReviews.length === 0 ? (
          <p
            className="col-span-full text-center text-sm"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
          >
            Reviews from completed bookings will show here.
          </p>
        ) : (
          recentReviews.map((r) => (
            <div
              key={r.id}
              className="theme-card flex flex-col rounded-[var(--radius-xl)] p-6"
            >
              <StarRow rating={r.rating} />
              <p
                className="mt-3 flex-1 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
              >
                &ldquo;{r.textExcerpt}&rdquo;
              </p>
              <p className="mt-4 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {r.reviewerFirstName} ·{" "}
                <Link href={`/services/provider/${r.providerSlug}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                  {r.providerName}
                </Link>
                <br />
                <time dateTime={r.createdAt.toISOString()}>
                  {r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </time>
              </p>
            </div>
          ))
        )}
      </TestimonialsGrid>

      {recentPosts.length > 0 ? (
        <Section background="background" padded className="border-b border-[var(--color-border)]">
          <PageContainer>
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
          </PageContainer>
        </Section>
      ) : null}

      <section
        className="theme-section border-b border-[var(--color-border)]"
        style={{ backgroundColor: "var(--color-background)" }}
        aria-labelledby="homepage-faq-heading"
      >
        <PageContainer>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <h2
              id="homepage-faq-heading"
              className="theme-display text-[var(--display-md)]"
              style={{ color: "var(--color-text)" }}
            >
              Common questions
            </h2>
            <EditorialButton href="/faq" variant="secondary" className="shrink-0">
              See all FAQs
            </EditorialButton>
          </div>
          <FAQStack items={FAQ_STACK_ITEMS} className="mt-10 sm:mt-12" />
        </PageContainer>
      </section>

      <section className="relative min-h-[420px] overflow-hidden sm:min-h-[480px]">
        <Image
          src={sanctuaryImageUrl}
          alt="Cat in the garden at Gardens of St Gertrude sanctuary"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/40" aria-hidden />
        <div className="relative z-10 flex min-h-[420px] flex-col justify-center px-4 py-16 sm:min-h-[480px] sm:px-10 lg:px-16">
          <PageContainer>
            <p className="theme-eyebrow mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
              Gardens of St Gertrude
            </p>
            <h2
              className="theme-display max-w-xl text-[clamp(1.75rem,4vw,2.75rem)] text-white"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
            >
              This is where it started. 92 cats. One sanctuary. Every booking helps.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <EditorialButton
                href="/about"
                variant="secondary"
                className="!border-white !bg-white !text-[var(--color-primary)] shadow-[var(--shadow-md)] hover:!bg-white/95"
              >
                Learn our story
              </EditorialButton>
              <Link
                href="/giving"
                className="theme-btn-secondary inline-flex min-h-11 items-center justify-center border-white bg-transparent px-6 py-2.5 text-sm font-bold text-white shadow-none hover:bg-white/10"
              >
                Support the sanctuary
              </Link>
            </div>
          </PageContainer>
        </div>
      </section>

      <Section background="primary" padded className="!py-14 sm:!py-16">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="theme-display text-[var(--display-md)] text-white"
              style={{ lineHeight: 1.05 }}
            >
              {activeGuardiansCount > 0
                ? `Join ${activeGuardiansCount.toLocaleString("en-CY")} Tinies Guardians supporting rescue animals every month`
                : "Join Tinies Guardians supporting rescue animals every month"}
            </h2>
            <p
              className="mt-4 text-base leading-relaxed text-white/90 sm:text-lg"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Starting from EUR 3/month — 100% goes to the sanctuary you choose.
            </p>
            <div className="mt-8 flex justify-center">
              <EditorialButton
                href="/giving/become-a-guardian"
                variant="secondary"
                className="!border-transparent !bg-white !text-[var(--color-primary)] shadow-[var(--shadow-md)] hover:!bg-white/95"
              >
                Become a Guardian
              </EditorialButton>
            </div>
          </div>
        </PageContainer>
      </Section>
    </div>
  );
}
