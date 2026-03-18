import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCharityBySlug } from "@/lib/giving/actions";
import { QuickDonateClient } from "../QuickDonateClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const charity = await getCharityBySlug(slug);
  if (!charity) return { title: "Give | Tinies" };
  return {
    title: `Give to ${charity.name} | Tinies`,
    description: charity.mission ?? `Donate to ${charity.name}. One-time or monthly.`,
  };
}

export default async function GiveCharityPage({ params }: Props) {
  const { slug } = await params;
  const charity = await getCharityBySlug(slug);
  if (!charity) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
        <h1
          className="text-center font-normal tracking-tight"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "clamp(1.5rem, 5vw, 1.75rem)", color: "var(--color-text)" }}
        >
          Help rescue animals in Cyprus
        </h1>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Give to <strong>{charity.name}</strong>. One-time or monthly.
        </p>
        <div className="mt-8 rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <QuickDonateClient
            initialCharities={[]}
            preselectedCharity={{ id: charity.id, name: charity.name, slug: charity.slug }}
          />
        </div>
        <p className="mt-6 text-center">
          <a href="/giving" className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            Learn more about Tinies Giving
          </a>
        </p>
      </main>
    </div>
  );
}
