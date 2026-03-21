"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  PawPrint,
  Calendar,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  MapPin,
  Heart,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { deletePet, cancelBooking } from "./actions";
import type { OwnerBookingCard } from "@/lib/utils/owner-helpers";
import { ReviewForm } from "./ReviewForm";
import { TipForm } from "./TipForm";
import { getOwnerMeetAndGreets, acceptMeetAndGreetSuggestion } from "@/lib/meet-and-greet/actions";
import type { OwnerMeetAndGreetCard } from "@/lib/meet-and-greet/actions";
import { ReportProblemModal } from "@/components/disputes/ReportProblemModal";
import { getDisputesForUser, getClaimsForUser, respondToDispute, respondToClaim } from "@/lib/disputes/actions";
import type { DisputeCard, ClaimCard } from "@/lib/disputes/actions";

type PetCard = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  ageYears: number | null;
  photos: string[];
};

type TabId = "pets" | "bookings" | "meetgreet" | "disputes" | "messages";

const SERVICE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

function formatEur(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatDateTime(d: Date | string): string {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TABS: { id: TabId; label: string; icon: typeof PawPrint }[] = [
  { id: "pets", label: "My Pets", icon: PawPrint },
  { id: "bookings", label: "My Bookings", icon: Calendar },
  { id: "meetgreet", label: "Meet & Greets", icon: Heart },
  { id: "disputes", label: "Disputes & Claims", icon: AlertCircle },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

function formatAge(ageYears: number | null): string {
  if (ageYears == null) return "—";
  if (ageYears < 1) return "Under 1 year";
  if (ageYears === 1) return "1 year";
  return `${Math.round(ageYears)} years`;
}

function getStatusBadgeStyle(status: string): { bg: string; text: string } {
  switch (status) {
    case "pending":
      return { bg: "bg-amber-100", text: "text-amber-800" };
    case "accepted":
      return { bg: "bg-[var(--color-primary)]/15", text: "text-[var(--color-primary)]" };
    case "active":
      return { bg: "bg-[var(--color-secondary)]/20", text: "text-[var(--color-secondary)]" };
    case "completed":
      return { bg: "bg-[var(--color-neutral-200)]", text: "text-[var(--color-text-secondary)]" };
    case "cancelled":
    case "declined":
      return { bg: "bg-red-100", text: "text-red-800" };
    default:
      return { bg: "bg-[var(--color-neutral-200)]", text: "text-[var(--color-text-secondary)]" };
  }
}

function BookingCard({
  booking,
  onCancel,
  cancellingId,
  showLeaveReview,
  openReviewBookingId,
  onOpenReview,
  onReviewSuccess,
  onReportProblem,
  reportProblemBookingId,
  onOpenTip,
  openTipBookingId,
}: {
  booking: OwnerBookingCard;
  onCancel: (id: string) => void;
  cancellingId: string | null;
  showLeaveReview: boolean;
  openReviewBookingId: string | null;
  onOpenReview: (bookingId: string) => void;
  onReviewSuccess: (bookingId: string, newReviewId?: string) => void;
  onReportProblem: (bookingId: string) => void;
  reportProblemBookingId: string | null;
  onOpenTip: (bookingId: string) => void;
  openTipBookingId: string | null;
}) {
  const initials = booking.providerName
    .split(" ")
    .map((s) => s.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const badge = getStatusBadgeStyle(booking.status);
  const canCancel = booking.status === "pending" || booking.status === "accepted";

  return (
    <li
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            {booking.providerAvatarUrl ? (
              <Image
                src={booking.providerAvatarUrl}
                alt={booking.providerName}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized={booking.providerAvatarUrl.includes("supabase")}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--color-text)" }}>
              {booking.providerName}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {SERVICE_LABELS[booking.serviceType] ?? booking.serviceType} · {booking.petNames.join(", ")}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {formatDateTime(booking.startDatetime)} – {formatDateTime(booking.endDatetime)}
            </p>
            {booking.status === "pending" && (
              <p className="mt-1 text-sm italic" style={{ color: "var(--color-text-secondary)" }}>
                Waiting for {booking.providerName} to accept…
              </p>
            )}
            {booking.specialInstructions && (booking.status === "accepted" || booking.status === "active") && (
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Instructions: {booking.specialInstructions}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 sm:shrink-0">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
            {booking.status}
          </span>
          <p className="font-semibold" style={{ color: "var(--color-text)" }}>
            {formatEur(booking.totalPriceCents)}
          </p>
          {booking.serviceType === "walking" && booking.status === "active" && booking.walkStartedAt && (
            <Link
              href={`/dashboard/owner/walks/${booking.id}`}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-secondary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <MapPin className="h-3.5 w-3.5" />
              Watch Live Walk
            </Link>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel(booking.id)}
              disabled={cancellingId === booking.id}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-error)]/50 px-3 py-1.5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 disabled:opacity-70"
            >
              <X className="h-3.5 w-3.5" />
              {cancellingId === booking.id ? "Cancelling…" : "Cancel"}
            </button>
          )}
          {showLeaveReview && openReviewBookingId !== booking.id && (!booking.existingReview || booking.existingReview.canEdit) && (
            <button
              type="button"
              onClick={() => onOpenReview(booking.id)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <Star className="h-3.5 w-3.5" />
              {booking.existingReview ? "Edit review" : "Leave a Review"}
            </button>
          )}
          {booking.status === "completed" && !booking.hasDispute && !booking.hasGuaranteeClaim && (
            <button
              type="button"
              onClick={() => onReportProblem(booking.id)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-error)]/50 px-3 py-1.5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Report a Problem
            </button>
          )}
          {booking.status === "completed" && booking.tipAmount == null && (
            <button
              type="button"
              onClick={() => onOpenTip(booking.id)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-accent)]/90 px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Tip {booking.providerName}
            </button>
          )}
          {booking.status === "completed" && booking.tipAmount != null && (
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Tipped {formatEur(booking.tipAmount)}</span>
          )}
        </div>
      </div>
      {booking.serviceType === "walking" && (booking.walkSummaryMapUrl ?? booking.walkDistanceKm != null) && (
        <div className="mt-4 rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Walk summary</p>
          {booking.walkSummaryMapUrl && (
            <img src={booking.walkSummaryMapUrl} alt="Walk route" className="mt-2 h-40 w-full rounded-[var(--radius-lg)] object-cover object-center" />
          )}
          <div className="mt-2 flex flex-wrap gap-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {booking.walkDistanceKm != null && <span>{booking.walkDistanceKm.toFixed(2)} km</span>}
            {booking.walkDurationMinutes != null && <span>{booking.walkDurationMinutes} min</span>}
            {booking.walkStartedAt && <span>Started {formatDateTime(booking.walkStartedAt)}</span>}
            {booking.walkEndedAt && <span>Ended {formatDateTime(booking.walkEndedAt)}</span>}
          </div>
        </div>
      )}
      {booking.serviceReport && (
        <div className="mt-4 rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Service report from {booking.providerName}</p>
          {(booking.serviceReport.arrivalTime || booking.serviceReport.departureTime) && (
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {booking.serviceReport.arrivalTime && `Arrived ${booking.serviceReport.arrivalTime}`}
              {booking.serviceReport.arrivalTime && booking.serviceReport.departureTime && " · "}
              {booking.serviceReport.departureTime && `Left ${booking.serviceReport.departureTime}`}
            </p>
          )}
          {booking.serviceReport.notes && <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{booking.serviceReport.notes}</p>}
          {booking.serviceReport.activities && booking.serviceReport.activities.length > 0 && (
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Activities: {booking.serviceReport.activities.join(", ")}</p>
          )}
          {booking.serviceReport.photos && booking.serviceReport.photos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {booking.serviceReport.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      {showLeaveReview && openReviewBookingId === booking.id && (
        <ReviewForm
          bookingId={booking.id}
          providerId={booking.providerId}
          providerName={booking.providerName}
          existingReview={booking.existingReview ?? undefined}
          onClose={() => onOpenReview("")}
          onSuccess={(newReviewId) => onReviewSuccess(booking.id, newReviewId)}
        />
      )}
    </li>
  );
}

export function OwnerDashboardClient({
  initialPets,
  initialBookings = [],
  initialMeetAndGreets = [],
  initialDisputes = [],
  initialClaims = [],
}: {
  initialPets: PetCard[];
  initialBookings?: OwnerBookingCard[];
  initialMeetAndGreets?: OwnerMeetAndGreetCard[];
  initialDisputes?: DisputeCard[];
  initialClaims?: ClaimCard[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("pets");
  const [pets, setPets] = useState<PetCard[]>(initialPets);
  const [bookings, setBookings] = useState<OwnerBookingCard[]>(initialBookings);
  const [meetAndGreets, setMeetAndGreets] = useState<OwnerMeetAndGreetCard[]>(initialMeetAndGreets);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [openReviewBookingId, setOpenReviewBookingId] = useState<string | null>(null);
  const [acceptingSuggestionId, setAcceptingSuggestionId] = useState<string | null>(null);
  const [reportProblemBookingId, setReportProblemBookingId] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<DisputeCard[]>(initialDisputes);
  const [claims, setClaims] = useState<ClaimCard[]>(initialClaims);
  const [disputeResponseText, setDisputeResponseText] = useState<Record<string, string>>({});
  const [claimResponseText, setClaimResponseText] = useState<Record<string, string>>({});
  const [respondingDisputeId, setRespondingDisputeId] = useState<string | null>(null);
  const [respondingClaimId, setRespondingClaimId] = useState<string | null>(null);
  const [openTipBookingId, setOpenTipBookingId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tip") === "success") {
      toast.success("Tip sent! Thank you.");
      router.replace("/dashboard/owner");
      router.refresh();
      setOpenTipBookingId(null);
      return;
    }
    const roundUpRaw = searchParams.get("roundUp");
    if (roundUpRaw !== null && roundUpRaw !== "") {
      const cents = parseInt(roundUpRaw, 10);
      if (Number.isFinite(cents) && cents > 0) {
        toast.success(
          `Your booking also generated a EUR ${(cents / 100).toFixed(2)} donation to animal rescue through Tinies Giving. Thank you!`
        );
      }
      const next = new URLSearchParams(searchParams.toString());
      next.delete("roundUp");
      next.delete("booking");
      const q = next.toString();
      router.replace(`/dashboard/owner${q ? `?${q}` : ""}`, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    setBookings(initialBookings ?? []);
  }, [initialBookings]);
  useEffect(() => {
    setMeetAndGreets(initialMeetAndGreets ?? []);
  }, [initialMeetAndGreets]);
  useEffect(() => {
    setDisputes(initialDisputes ?? []);
    setClaims(initialClaims ?? []);
  }, [initialDisputes, initialClaims]);

  const upcomingBookings = bookings.filter((b) =>
    ["pending", "accepted"].includes(b.status)
  );
  const activeBookings = bookings.filter((b) => b.status === "active");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  async function handleRespondToDispute(disputeId: string, response: string, responsePhotoFiles: File[] = []) {
    if (respondingDisputeId) return;
    const trimmed = response?.trim();
    if (!trimmed || trimmed.length < 20) {
      toast.error("Please enter a response (at least 20 characters).");
      return;
    }
    setRespondingDisputeId(disputeId);
    const formData = new FormData();
    formData.set("response", trimmed);
    responsePhotoFiles.forEach((f, i) => formData.append(`responsePhotos[${i}]`, f));
    const result = await respondToDispute(disputeId, formData);
    setRespondingDisputeId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const next = await getDisputesForUser();
    if (!next.error) setDisputes(next.disputes);
    setDisputeResponseText((prev) => ({ ...prev, [disputeId]: "" }));
    router.refresh();
    toast.success("Response submitted.");
  }

  async function handleRespondToClaim(claimId: string, response: string, responsePhotoFiles: File[] = []) {
    if (respondingClaimId) return;
    const trimmed = response?.trim();
    if (!trimmed || trimmed.length < 20) {
      toast.error("Please enter a response (at least 20 characters).");
      return;
    }
    setRespondingClaimId(claimId);
    const formData = new FormData();
    formData.set("response", trimmed);
    responsePhotoFiles.forEach((f, i) => formData.append(`responsePhotos[${i}]`, f));
    const result = await respondToClaim(claimId, formData);
    setRespondingClaimId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const next = await getClaimsForUser();
    if (!next.error) setClaims(next.claims);
    setClaimResponseText((prev) => ({ ...prev, [claimId]: "" }));
    router.refresh();
    toast.success("Response submitted.");
  }

  async function handleAcceptMeetAndGreetSuggestion(meetAndGreetId: string) {
    if (acceptingSuggestionId) return;
    setAcceptingSuggestionId(meetAndGreetId);
    const result = await acceptMeetAndGreetSuggestion(meetAndGreetId);
    setAcceptingSuggestionId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const next = await getOwnerMeetAndGreets();
    if (!next.error) setMeetAndGreets(next.meetAndGreets);
    router.refresh();
    toast.success("Meet & Greet confirmed for the suggested time.");
  }

  async function handleCancelBooking(bookingId: string) {
    if (cancellingId) return;
    setCancellingId(bookingId);
    const result = await cancelBooking(bookingId);
    setCancellingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
    router.refresh();
    toast.success("Booking cancelled.");
  }

  async function handleDelete(petId: string) {
    if (deletingId) return;
    setDeletingId(petId);
    const result = await deletePet(petId);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setPets((prev) => prev.filter((p) => p.id !== petId));
    router.refresh();
    toast.success("Pet removed.");
  }

  return (
    <>
      <div className="mt-8 border-b border-[var(--color-border)]">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id ? "border-[var(--color-primary)]" : "border-transparent"
              }`}
              style={{
                fontFamily: "var(--font-body), sans-serif",
                color: tab === t.id ? "var(--color-primary)" : "var(--color-text-secondary)",
              }}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {tab === "pets" && (
          <section
            className="rounded-[var(--radius-lg)] border p-8 sm:p-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className="font-normal"
                  style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
                >
                  My Pets
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Add pets to book services. Providers will see these profiles.
                </p>
              </div>
              <Link
                href="/dashboard/owner/pets/new"
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Add Pet
              </Link>
            </div>

            {pets.length === 0 ? (
              <div
                className="mt-8 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed py-12 text-center"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-background)",
                }}
              >
                <PawPrint className="h-12 w-12" style={{ color: "var(--color-text-muted)" }} />
                <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  No pets yet.
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Add your first pet to get started with bookings.
                </p>
                <Link
                  href="/dashboard/owner/pets/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add Pet
                </Link>
              </div>
            ) : (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pets.map((pet) => (
                  <li
                    key={pet.id}
                    className="overflow-hidden rounded-[var(--radius-lg)] border bg-white shadow-sm transition-shadow hover:shadow-md"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="relative aspect-[4/3] bg-[var(--color-background)]">
                      {pet.photos[0] ? (
                        <Image
                          src={pet.photos[0]}
                          alt={pet.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized={pet.photos[0]?.includes("supabase")}
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          <PawPrint className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold" style={{ color: "var(--color-text)" }}>
                        {pet.name}
                      </h3>
                      <p className="mt-0.5 text-sm capitalize" style={{ color: "var(--color-text-secondary)" }}>
                        {pet.species}
                        {pet.breed ? ` · ${pet.breed}` : ""}
                      </p>
                      <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {formatAge(pet.ageYears)}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/dashboard/owner/pets/${pet.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-primary)]/10"
                          style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-primary)",
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(pet.id)}
                          disabled={deletingId === pet.id}
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-error)]/30 px-3 py-1.5 text-sm font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/10 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingId === pet.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "bookings" && (
          <section
            className="rounded-[var(--radius-lg)] border p-8 sm:p-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h2
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
            >
              My Bookings
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Upcoming, active, and past bookings.
            </p>

            {bookings.length === 0 ? (
              <div
                className="mt-6 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed py-12 text-center"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-background)",
                }}
              >
                <Calendar className="h-12 w-12" style={{ color: "var(--color-text-muted)" }} />
                <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  No bookings yet.
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Find a provider and book a service to see them here.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-8">
                {/* Upcoming: pending + accepted */}
                <div>
                  <h3 className="font-medium" style={{ color: "var(--color-text)" }}>Upcoming</h3>
                  {upcomingBookings.length === 0 ? (
                    <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>None.</p>
                  ) : (
                    <ul className="mt-4 space-y-4">
                      {upcomingBookings.map((b) => (
                        <BookingCard
                          key={b.id}
                          booking={b}
                          onCancel={handleCancelBooking}
                          cancellingId={cancellingId}
                          showLeaveReview={false}
                          openReviewBookingId={openReviewBookingId}
                          onOpenReview={setOpenReviewBookingId}
                          onReviewSuccess={() => {}}
                          onReportProblem={setReportProblemBookingId}
                          reportProblemBookingId={reportProblemBookingId}
                          onOpenTip={setOpenTipBookingId}
                          openTipBookingId={openTipBookingId}
                        />
                      ))}
                    </ul>
                  )}
                </div>

                {/* Active */}
                <div>
                  <h3 className="font-medium" style={{ color: "var(--color-text)" }}>Active</h3>
                  {activeBookings.length === 0 ? (
                    <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>None.</p>
                  ) : (
                    <ul className="mt-4 space-y-4">
                      {activeBookings.map((b) => (
                        <BookingCard
                          key={b.id}
                          booking={b}
                          onCancel={handleCancelBooking}
                          cancellingId={cancellingId}
                          showLeaveReview={false}
                          openReviewBookingId={openReviewBookingId}
                          onOpenReview={setOpenReviewBookingId}
                          onReviewSuccess={() => {}}
                          onReportProblem={setReportProblemBookingId}
                          reportProblemBookingId={reportProblemBookingId}
                          onOpenTip={setOpenTipBookingId}
                          openTipBookingId={openTipBookingId}
                        />
                      ))}
                    </ul>
                  )}
                </div>

                {/* Completed */}
                <div>
                  <h3 className="font-medium" style={{ color: "var(--color-text)" }}>Completed</h3>
                  {completedBookings.length === 0 ? (
                    <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>None.</p>
                  ) : (
                    <ul className="mt-4 space-y-4">
                      {completedBookings.map((b) => (
                        <BookingCard
                          key={b.id}
                          booking={b}
                          onCancel={handleCancelBooking}
                          cancellingId={cancellingId}
                          showLeaveReview
                          openReviewBookingId={openReviewBookingId}
                          onOpenReview={setOpenReviewBookingId}
                          onReviewSuccess={(bid, newReviewId) => {
                            if (bid && newReviewId)
                              setBookings((prev) =>
                                prev.map((x) =>
                                  x.id === bid ? { ...x, existingReview: { id: newReviewId, canEdit: true } } : x
                                )
                              );
                          }}
                          onReportProblem={setReportProblemBookingId}
                          reportProblemBookingId={reportProblemBookingId}
                          onOpenTip={setOpenTipBookingId}
                          openTipBookingId={openTipBookingId}
                        />
                      ))}
                    </ul>
                  )}
                </div>

                {/* Cancelled */}
                {cancelledBookings.length > 0 && (
                  <div>
                    <h3 className="font-medium" style={{ color: "var(--color-text-secondary)" }}>Cancelled</h3>
                    <ul className="mt-4 space-y-4">
                      {cancelledBookings.map((b) => (
                        <BookingCard
                          key={b.id}
                          booking={b}
                          onCancel={handleCancelBooking}
                          cancellingId={cancellingId}
                          showLeaveReview={false}
                          openReviewBookingId={openReviewBookingId}
                          onOpenReview={setOpenReviewBookingId}
                          onReviewSuccess={() => {}}
                          onReportProblem={setReportProblemBookingId}
                          reportProblemBookingId={reportProblemBookingId}
                          onOpenTip={setOpenTipBookingId}
                          openTipBookingId={openTipBookingId}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {tab === "meetgreet" && (
          <section
            className="rounded-[var(--radius-lg)] border p-8 sm:p-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h2
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
            >
              Meet & Greets
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Requests you sent to providers. After the meeting, book when you&apos;re ready.
            </p>
            {meetAndGreets.length === 0 ? (
              <div
                className="mt-6 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed py-12 text-center"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
              >
                <Heart className="h-12 w-12" style={{ color: "var(--color-text-muted)" }} />
                <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  No meet & greets yet.
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Use &quot;Request Meet & Greet&quot; on a provider&apos;s profile to get started.
                </p>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {meetAndGreets.map((m) => {
                  const meetTime = m.confirmedDatetime ?? m.requestedDatetime;
                  const isPast = new Date(meetTime).getTime() < Date.now();
                  const hasSuggestion = m.status === "requested" && m.providerSuggestedDatetime;
                  return (
                    <li
                      key={m.id}
                      className="rounded-[var(--radius-lg)] border p-4"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: "var(--color-text)" }}>{m.providerName}</p>
                          <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Pets: {m.petNames.join(", ")} · {m.locationType}
                          </p>
                          <p className="mt-0.5 text-sm flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
                            <CalendarClock className="h-4 w-4" />
                            {formatDateTime(meetTime)}
                          </p>
                          <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeStyle(m.status).bg} ${getStatusBadgeStyle(m.status).text}`}>
                            {m.status}
                          </span>
                          {hasSuggestion && (
                            <div className="mt-3 rounded-[var(--radius-lg)] border-l-4 pl-3 py-2" style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--color-surface)" }}>
                              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                                Provider suggested: {formatDateTime(m.providerSuggestedDatetime!)}
                              </p>
                              {m.providerMessage && <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{m.providerMessage}</p>}
                              <button
                                type="button"
                                onClick={() => handleAcceptMeetAndGreetSuggestion(m.id)}
                                disabled={acceptingSuggestionId === m.id}
                                className="mt-2 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                              >
                                {acceptingSuggestionId === m.id ? "Accepting…" : "Accept this time"}
                              </button>
                            </div>
                          )}
                          {(m.status === "confirmed" || m.status === "completed") && isPast && (
                            <p className="mt-3 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                              How did it go?{" "}
                              <Link href={m.providerSlug ? `/services/book/${m.providerSlug}` : "/services/search"} className="underline hover:no-underline">
                                Ready to book?
                              </Link>
                            </p>
                          )}
                          {m.ledToBooking && m.bookingId && (
                            <p className="mt-2 text-sm" style={{ color: "var(--color-success)" }}>
                              Led to a booking. <Link href="/dashboard/owner" className="underline">View bookings</Link>
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {reportProblemBookingId && (
          <ReportProblemModal
            bookingId={reportProblemBookingId}
            onClose={() => setReportProblemBookingId(null)}
            onSuccess={() => setReportProblemBookingId(null)}
          />
        )}

        {openTipBookingId && (() => {
          const booking = bookings.find((b) => b.id === openTipBookingId);
          if (!booking) return null;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-primary-900) 55%, transparent)" }}
              onClick={() => setOpenTipBookingId(null)}
            >
              <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-[var(--radius-lg)] border bg-[var(--color-surface)] shadow-lg" style={{ borderColor: "var(--color-border)" }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end border-b p-2" style={{ borderColor: "var(--color-border)" }}>
                  <button type="button" onClick={() => setOpenTipBookingId(null)} className="rounded p-1 hover:bg-[var(--color-neutral-200)]" aria-label="Close">
                    <X className="h-5 w-5" style={{ color: "var(--color-text-secondary)" }} />
                  </button>
                </div>
                <TipForm
                  bookingId={booking.id}
                  providerName={booking.providerName}
                  onSuccess={() => { router.refresh(); setOpenTipBookingId(null); }}
                  onClose={() => setOpenTipBookingId(null)}
                />
              </div>
            </div>
          );
        })()}

        {tab === "disputes" && (
          <section className="rounded-[var(--radius-lg)] border p-8 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
            <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Disputes & Claims</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Respond to reports or view your own.</p>

            {(() => {
              const disputesNeedingResponse = disputes.filter((d) => !d.isReporter && d.status === "awaiting_response");
              const claimsNeedingResponse = claims.filter((c) => !c.isReporter && c.status === "awaiting_response");
              const myDisputes = disputes.filter((d) => d.isReporter || d.status !== "awaiting_response");
              const myClaims = claims.filter((c) => c.isReporter || c.status !== "awaiting_response");
              return (
                <>
                  {(disputesNeedingResponse.length > 0 || claimsNeedingResponse.length > 0) && (
                    <div className="mt-8">
                      <h3 className="font-medium" style={{ color: "var(--color-text)" }}>Need your response (48-hour window)</h3>
                      {disputesNeedingResponse.map((d) => (
                        <div key={d.id} className="mt-4 rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                          <p className="font-medium" style={{ color: "var(--color-text)" }}>Dispute: {d.disputeType} · {d.bookingSummary}</p>
                          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{d.description.slice(0, 200)}{d.description.length > 200 ? "…" : ""}</p>
                          {d.evidencePhotos.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {d.evidencePhotos.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                  <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                                </a>
                              ))}
                            </div>
                          )}
                          <form
                            data-dispute-id={d.id}
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const id = form.getAttribute("data-dispute-id")!;
                              const text = (form.querySelector("textarea") as HTMLTextAreaElement)?.value ?? "";
                              const input = form.querySelector('input[type="file"]') as HTMLInputElement;
                              const files = input?.files ? Array.from(input.files) : [];
                              handleRespondToDispute(id, text, files);
                            }}
                            className="mt-4 space-y-2"
                          >
                            <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Your response (min 20 characters)</label>
                            <textarea
                              value={disputeResponseText[d.id] ?? ""}
                              onChange={(e) => setDisputeResponseText((prev) => ({ ...prev, [d.id]: e.target.value }))}
                              rows={3}
                              className="w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                            />
                            <input type="file" accept="image/*" multiple className="block text-sm" style={{ color: "var(--color-text)" }} />
                            <button type="submit" disabled={respondingDisputeId === d.id} className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70">
                              {respondingDisputeId === d.id ? "Submitting…" : "Submit response"}
                            </button>
                          </form>
                        </div>
                      ))}
                      {claimsNeedingResponse.map((c) => (
                        <div key={c.id} className="mt-4 rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                          <p className="font-medium" style={{ color: "var(--color-text)" }}>Claim: {c.claimType} · {c.bookingSummary}</p>
                          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{c.description.slice(0, 200)}{c.description.length > 200 ? "…" : ""}</p>
                          {c.photos.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {c.photos.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                  <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                                </a>
                              ))}
                            </div>
                          )}
                          <form
                            data-claim-id={c.id}
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const id = form.getAttribute("data-claim-id")!;
                              const text = (form.querySelector("textarea") as HTMLTextAreaElement)?.value ?? "";
                              const input = form.querySelector('input[type="file"]') as HTMLInputElement;
                              const files = input?.files ? Array.from(input.files) : [];
                              handleRespondToClaim(id, text, files);
                            }}
                            className="mt-4 space-y-2"
                          >
                            <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Your response (min 20 characters)</label>
                            <textarea
                              value={claimResponseText[c.id] ?? ""}
                              onChange={(e) => setClaimResponseText((prev) => ({ ...prev, [c.id]: e.target.value }))}
                              rows={3}
                              className="w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                            />
                            <input type="file" accept="image/*" multiple className="block text-sm" style={{ color: "var(--color-text)" }} />
                            <button type="submit" disabled={respondingClaimId === c.id} className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70">
                              {respondingClaimId === c.id ? "Submitting…" : "Submit response"}
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-8">
                    <h3 className="font-medium" style={{ color: "var(--color-text)" }}>Your reports</h3>
                    {myDisputes.length === 0 && myClaims.length === 0 && disputesNeedingResponse.length === 0 && claimsNeedingResponse.length === 0 ? (
                      <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>No disputes or claims.</p>
                    ) : (myDisputes.length > 0 || myClaims.length > 0) ? (
                      <ul className="mt-4 space-y-3">
                        {myDisputes.map((d) => (
                          <li key={d.id} className="rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)" }}>
                            <p className="font-medium" style={{ color: "var(--color-text)" }}>Dispute ({d.disputeType}) · {d.bookingSummary}</p>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Status: {d.status}</p>
                          </li>
                        ))}
                        {myClaims.map((c) => (
                          <li key={c.id} className="rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)" }}>
                            <p className="font-medium" style={{ color: "var(--color-text)" }}>Claim ({c.claimType}) · {c.bookingSummary}</p>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Status: {c.status}</p>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </>
              );
            })()}
          </section>
        )}

        {tab === "messages" && (
          <section
            className="rounded-[var(--radius-lg)] border p-8 sm:p-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h2
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
            >
              Messages
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Conversations with providers.
            </p>
            <div
              className="mt-6 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed py-12 text-center"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <MessageSquare className="h-12 w-12" style={{ color: "var(--color-text-muted)" }} />
              <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                No messages yet.
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                When you contact providers, conversations will appear here.
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
