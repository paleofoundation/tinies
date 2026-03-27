import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTiniesCardPublicById } from "@/lib/tinies-card/load-card";
import { TiniesCardView } from "@/components/tinies-card/TiniesCardView";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").replace(/\/$/, "");

type Props = { params: Promise<{ cardId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardId } = await params;
  const card = await getTiniesCardPublicById(cardId);
  if (!card) return { title: "Tinies Card" };
  const pet = card.petNames.join(", ");
  const title = `${pet}'s day with ${card.providerName}`;
  const ogTitle = `${title} · Tinies Card`;
  const description = `See ${pet}'s Tinies Card — trusted pet care in Cyprus.`;
  const ogImage = card.photos[0];
  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: `${APP_URL}/card/${card.id}`,
      siteName: "Tinies",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, alt: pet }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function PublicTiniesCardPage({ params }: Props) {
  const { cardId } = await params;
  const card = await getTiniesCardPublicById(cardId);
  if (!card) notFound();

  const shareUrl = `${APP_URL}/card/${card.id}`;

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-14" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
          ← Tinies
        </Link>
        <div className="mt-8">
          <TiniesCardView card={card} shareUrl={shareUrl} showBrandingCta />
        </div>
      </div>
    </div>
  );
}
