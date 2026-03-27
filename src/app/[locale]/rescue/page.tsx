import type { Metadata } from "next";
import Image from "next/image";
import { Building2, MapPin } from "lucide-react";
import { EditorialButton, SectionHeader } from "@/components/marketing";
import { PageContainer, Section } from "@/components/theme";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { withQueryTimeout } from "@/lib/utils/with-query-timeout";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const metadata: Metadata = {
  title: "Rescue partners",
  description: "Verified rescue organisations on Tinies in Cyprus — adoption listings, campaigns, and ways to help.",
  openGraph: {
    title: "Rescue partners | Tinies",
    description: "Verified rescue organisations on Tinies in Cyprus — adoption listings, campaigns, and ways to help.",
    url: `${BASE_URL}/rescue`,
    siteName: "Tinies",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function excerptMission(text: string | null, maxLen: number): string {
  const t = text?.trim() ?? "";
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

function locationLine(district: string | null, location: string | null): string | null {
  const parts = [district, location].filter((p): p is string => Boolean(p?.trim()));
  if (parts.length === 0) return null;
  return [...new Set(parts)].join(" · ");
}

type RescuePartnerRow = {
  slug: string;
  name: string;
  mission: string | null;
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  district: string | null;
  location: string | null;
};

export default async function RescuePartnersPage() {
  let orgs: RescuePartnerRow[] = [];
  try {
    orgs = await withQueryTimeout(
      prisma.rescueOrg.findMany({
        where: { verified: true },
        orderBy: { name: "asc" },
        select: {
          slug: true,
          name: true,
          mission: true,
          logoUrl: true,
          coverPhotoUrl: true,
          district: true,
          location: true,
        },
      }),
      [],
      "rescue-partners:list",
      5000
    );
  } catch (e) {
    console.error("RescuePartnersPage findMany", e);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <Section
        background="transparent"
        padded
        className="theme-paper-grid border-b border-[var(--color-border)] !bg-[var(--color-primary-muted-05)]"
      >
        <PageContainer className="max-w-5xl">
          <SectionHeader
            align="center"
            eyebrow="Directory"
            title="Our rescue partners"
            description="Verified organisations on Tinies. Open a profile to read their story, support a campaign, or browse animals ready for adoption."
            className="mx-auto max-w-2xl"
          />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <EditorialButton href="/adopt" variant="primary">
              Browse adoptable animals
            </EditorialButton>
            <EditorialButton href="/giving" variant="secondary">
              Tinies Giving
            </EditorialButton>
          </div>
        </PageContainer>
      </Section>

      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <PageContainer className="max-w-5xl">
        {orgs.length === 0 ? (
          <p className="mt-16 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            Verified rescue partners will appear here as they join the platform.
          </p>
        ) : (
          <ul className="mt-14 grid gap-8 sm:grid-cols-2">
            {orgs.map((org) => {
              const loc = locationLine(org.district, org.location);
              const thumb = org.coverPhotoUrl ?? org.logoUrl;
              return (
                <li key={org.slug}>
                  <Link
                    href={`/rescue/${org.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-primary-50)]">
                      {thumb ? (
                        <Image src={thumb} alt="" fill className="object-cover transition-transform group-hover:scale-[1.02]" sizes="(max-width: 640px) 100vw, 50vw" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" aria-hidden>
                          <Building2 className="h-16 w-16" style={{ color: "var(--color-primary-300)" }} strokeWidth={1.25} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border"
                          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                        >
                          {org.logoUrl ? (
                            <Image src={org.logoUrl} alt="" fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center" aria-hidden>
                              <Building2 className="h-7 w-7" style={{ color: "var(--color-primary-300)" }} strokeWidth={1.25} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2
                            className="text-lg font-semibold group-hover:underline"
                            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
                          >
                            {org.name}
                          </h2>
                          {loc ? (
                            <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              {loc}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {org.mission ? (
                        <p className="mt-4 flex-1 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                          {excerptMission(org.mission, 200)}
                        </p>
                      ) : null}
                      <span className="mt-4 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                        View profile →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        </PageContainer>
      </div>
    </div>
  );
}
