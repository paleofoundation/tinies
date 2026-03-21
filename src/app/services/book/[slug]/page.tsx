import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getProviderBySlug, getBookingRoundupDefaults } from "../actions";
import { getOwnerPets } from "@/app/dashboard/owner/actions";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "./BookingFlow";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  const name = provider?.providerName ?? "Provider";
  return {
    title: `Book with ${name} | Tinies`,
    description: `Book pet care with ${name}. Choose service, dates, and pets.`,
  };
}

export default async function BookServicePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/services/book/${slug}`)}`);
  }

  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const [petsResult, roundupDefaults] = await Promise.all([getOwnerPets(), getBookingRoundupDefaults()]);
  const { pets } = petsResult;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main
        className="mx-auto px-4 py-12 sm:px-6 sm:py-16"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <h1
          className="font-normal"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)" }}
        >
          Book with {provider.providerName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Choose your service, dates, pets, and complete payment.
        </p>
        <BookingFlow provider={provider} pets={pets} roundupDefaults={roundupDefaults} />
      </main>
    </div>
  );
}
