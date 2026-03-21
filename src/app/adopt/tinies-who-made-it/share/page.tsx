import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEligibleSuccessStoryPlacements } from "@/lib/adoption/success-stories-actions";
import { ShareSuccessStoryForm } from "./ShareSuccessStoryForm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const metadata: Metadata = {
  title: "Share your adoption story | Tinies",
  description: "Tell us how your tiny is doing in their forever home. Your story may appear on Tinies who made it after approval.",
  openGraph: {
    title: "Share your adoption story | Tinies",
    url: `${BASE_URL}/adopt/tinies-who-made-it/share`,
    siteName: "Tinies",
    type: "website",
  },
};

type Props = {
  searchParams: Promise<{ placement?: string }>;
};

export default async function ShareSuccessStoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const placementParam = params.placement;
  const placementQs =
    typeof placementParam === "string" && /^[0-9a-f-]{36}$/i.test(placementParam)
      ? `?placement=${encodeURIComponent(placementParam)}`
      : "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/adopt/tinies-who-made-it/share${placementQs}`)}`);
  }

  const initialPlacementId =
    typeof placementParam === "string" && /^[0-9a-f-]{36}$/i.test(placementParam) ? placementParam : null;

  const { placements, error } = await getEligibleSuccessStoryPlacements();

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <div className="mx-auto max-w-xl">
        <Link href="/adopt/tinies-who-made-it" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
          ← Tinies who made it
        </Link>
        <h1 className="mt-6 text-3xl font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          Share your story
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          We&apos;d love a short update and a photo of your tiny in their new home. After your rescue organisation or Tinies reviews it, it may appear on our public gallery.
        </p>

        {error ? (
          <p className="mt-6 text-sm" style={{ color: "#DC2626", fontFamily: "var(--font-body), sans-serif" }}>{error}</p>
        ) : placements.length === 0 ? (
          <div
            className="mt-8 rounded-[var(--radius-lg)] border px-6 py-8"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              When your adoption placement is marked delivered (or complete), you&apos;ll be able to share an update here. You can always track progress from your adopter dashboard.
            </p>
            <Link
              href="/dashboard/adopter"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-[var(--radius-pill)] px-6 font-semibold text-white"
              style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
            >
              Go to adopter dashboard
            </Link>
          </div>
        ) : (
          <div className="mt-8 rounded-[var(--radius-lg)] border p-6 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
            <ShareSuccessStoryForm placements={placements} initialPlacementId={initialPlacementId} />
          </div>
        )}
      </div>
    </div>
  );
}
