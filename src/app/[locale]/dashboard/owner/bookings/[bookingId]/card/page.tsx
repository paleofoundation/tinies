import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getTiniesCardForOwnerBooking } from "@/lib/tinies-card/load-card";
import { TiniesCardView } from "@/components/tinies-card/TiniesCardView";
import { TipSuccessHandler } from "@/components/tipping/TipSuccessHandler";
import { OwnerBookingTipPrompt } from "../../../OwnerBookingTipPrompt";

type Props = { params: Promise<{ bookingId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { title: "Tinies Card" };
  const card = await getTiniesCardForOwnerBooking(bookingId, user.id);
  if (!card) return { title: "Tinies Card" };
  const pet = card.petNames.join(", ");
  return {
    title: `${pet}'s Tinies Card`,
    description: `Activity report from ${card.providerName} on Tinies.`,
  };
}

export default async function OwnerBookingTiniesCardPage({ params }: Props) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const card = await getTiniesCardForOwnerBooking(bookingId, user.id);
  if (!card) notFound();

  const bookingTipMeta = await prisma.booking.findFirst({
    where: { id: bookingId, ownerId: user.id },
    select: { status: true, tipAmountCents: true, tipStripePaymentIntentId: true },
  });
  const showTipping =
    bookingTipMeta?.status === "completed" &&
    bookingTipMeta.tipAmountCents == null &&
    !bookingTipMeta.tipStripePaymentIntentId;

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").replace(/\/$/, "");
  const shareUrl = `${appUrl}/card/${card.id}`;
  const tipReturnPath = `/dashboard/owner/bookings/${bookingId}/card`;

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-14" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <Suspense fallback={null}>
        <TipSuccessHandler />
      </Suspense>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/owner?tab=bookings"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          ← Back to bookings
        </Link>
        <div className="mt-8">
          <TiniesCardView card={card} shareUrl={shareUrl} />
        </div>
        {showTipping && (
          <OwnerBookingTipPrompt bookingId={bookingId} providerName={card.providerName} returnPath={tipReturnPath} />
        )}
      </div>
    </div>
  );
}
