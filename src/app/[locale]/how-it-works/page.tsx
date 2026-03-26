import type { Metadata } from "next";
import {
  Search,
  CreditCard,
  Camera,
  Star,
  Heart,
  FileCheck,
  Plane,
  MapPin,
  Home,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EditorialButton, SectionHeader } from "@/components/marketing";
import { PageContainer, Section } from "@/components/theme";
import { Link } from "@/i18n/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const metadata: Metadata = {
  title: "How It Works | Tinies Pet Care & Adoption",
  description:
    "Tinies is a marketplace connecting pet owners with independent providers, and adopters with rescues and transport. We don't provide services ourselves — we give you the platform, payments, and tools.",
  openGraph: {
    title: "How It Works | Tinies Pet Care & Adoption",
    description: "Tinies connects pet owners with verified providers and adopters with rescues. Book care or adopt through one platform.",
    url: `${BASE_URL}/how-it-works`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "How It Works | Tinies Pet Care & Adoption", description: "Tinies connects pet owners with verified providers and adopters with rescues." },
};

const OWNER_ICONS = [Search, CreditCard, Camera, Star] as const;
const ADOPTER_ICONS = [Heart, FileCheck, Plane, MapPin, Home] as const;

type Step = { title: string; text: string };

export default async function HowItWorksPage() {
  const t = await getTranslations("howItWorks");
  const ownerSteps = t.raw("ownerSteps") as Step[];
  const adopterSteps = t.raw("adopterSteps") as Step[];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <Section
        className="theme-paper-grid border-b border-[var(--color-border)]"
        background="background"
        padded
      >
        <PageContainer>
          <SectionHeader
            title={t("title")}
            description={t("intro")}
            className="max-w-3xl"
          />
        </PageContainer>
      </Section>

      <main>
        <PageContainer className="py-16 sm:py-20">
        {/* For Pet Owners */}
        <section>
          <h2 className="theme-display text-[var(--display-md)]" style={{ color: "var(--color-text)" }}>
            {t("forOwnersTitle")}
          </h2>
          <p className="mt-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {t("forOwnersSubtitle")}
          </p>
          <ul className="mt-10 space-y-8">
            {ownerSteps.map((step, i) => {
              const Icon = OWNER_ICONS[i] ?? Search;
              return (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-[var(--radius-lg)] border p-8 sm:gap-6"
                  style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}>
                      {t("stepLabel", { n: i + 1 })}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)", fontSize: "var(--text-base)" }}>
                      {step.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-10">
            <EditorialButton href="/services/search" variant="primary">
              {t("findCareCta")}
            </EditorialButton>
          </div>
        </section>

        {/* For Adopters */}
        <section className="mt-20">
          <h2 className="theme-display text-[var(--display-md)]" style={{ color: "var(--color-text)" }}>
            {t("forAdoptersTitle")}
          </h2>
          <p className="mt-2 max-w-2xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {t("forAdoptersIntro")}
          </p>
          <ul className="mt-10 space-y-8">
            {adopterSteps.map((step, i) => {
              const Icon = ADOPTER_ICONS[i] ?? Heart;
              return (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-[var(--radius-lg)] border p-8 sm:gap-6"
                  style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14" style={{ backgroundColor: "var(--color-secondary-50)", color: "var(--color-secondary)" }}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}>
                      {t("stepLabel", { n: i + 1 })}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)", fontSize: "var(--text-base)" }}>
                      {step.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-10">
            <EditorialButton href="/adopt" variant="primary">
              {t("browseAnimalsCta")}
            </EditorialButton>
          </div>
        </section>

        <p className="mt-20 text-center">
          <Link
            href="/"
            className="hover:underline"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
          >
            {t("backHome")}
          </Link>
        </p>
        </PageContainer>
      </main>
    </div>
  );
}
