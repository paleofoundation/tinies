"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  Wallet,
  MessageSquare,
  Camera,
  FileText,
  PawPrint,
  Shield,
  Settings,
  ChevronRight,
  Banknote,
  CheckCircle,
  Clock,
  Check,
  X,
  Star,
  Heart,
  CalendarClock,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import type { ProviderStripeStatus, ProviderBookingCard, ProviderReviewForDashboard, ProviderEarnings } from "@/lib/utils/provider-helpers";
import type { ProviderMeetAndGreetCard } from "@/lib/meet-and-greet/meet-and-greet-types";
import {
  getProviderMeetAndGreets,
  respondToMeetAndGreet,
} from "@/lib/meet-and-greet/actions";
import { ReportProblemModal } from "@/components/disputes/ReportProblemModal";
import { getDisputesForUser, getClaimsForUser, respondToDispute, respondToClaim } from "@/lib/disputes/actions";
import type { ClaimCard, DisputeCard } from "@/lib/disputes/dispute-action-types";
import {
  createStripeConnectOnboardingLink,
  acceptBooking,
  declineBooking,
  respondToReview,
  startNonWalkService,
  completeNonWalkBooking,
  cancelAcceptedBookingAsProvider,
} from "./actions";
import { ActiveWalkCard } from "./ActiveWalkCard";
import { SendBookingUpdateModal } from "./SendBookingUpdateModal";
import { ServiceReportForm } from "./ServiceReportForm";
import { walkActivitySummary } from "@/components/maps/WalkTracker";
import { badgeColorVar } from "@/lib/training/badge-styles";

export type ProviderDashboardTrainingCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  required: boolean;
  badgeLabel: string;
  badgeColor: string | null;
  estimatedMinutes: number;
  totalSlides: number;
  passingScore: number;
  certification: {
    passed: boolean;
    score: number;
    completedAt: string;
    certificateId: string | null;
  } | null;
};

type TabId = "profile" | "bookings" | "meetgreet" | "disputes" | "earnings" | "reviews" | "training" | "messages";

const SERVICE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

const PENDING_RESPONSE_MS = 4 * 60 * 60 * 1000;

function formatEur(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatDateTime(d: Date): string {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeRemaining(createdAt: Date): string {
  const deadline = new Date(createdAt).getTime() + PENDING_RESPONSE_MS;
  const now = Date.now();
  if (now >= deadline) return "Expired";
  const left = deadline - now;
  const h = Math.floor(left / (60 * 60 * 1000));
  const m = Math.floor((left % (60 * 60 * 1000)) / (60 * 1000));
  if (h > 0) return `${h}h ${m}m to respond`;
  return `${m}m to respond`;
}

const MOCK_PROFILE = {
  hasBio: false,
  hasAvatar: false,
  photoCount: 0,
  hasServices: false,
  hasAvailability: false,
  hasPetPrefs: false,
  isVerified: false,
  hasCancellationPolicy: false,
};

const COMPLETENESS_ITEMS = [
  { key: "hasBio", label: "Add a bio", weight: 10, done: MOCK_PROFILE.hasBio, href: "/dashboard/provider/edit-profile#bio" },
  { key: "hasAvatar", label: "Add profile photo", weight: 10, done: MOCK_PROFILE.hasAvatar, href: "/dashboard/provider/edit-profile#photo" },
  { key: "photoCount", label: "Add 3+ gallery photos", weight: 15, done: MOCK_PROFILE.photoCount >= 3, href: "/dashboard/provider/edit-profile#photos" },
  { key: "hasServices", label: "Set your services & pricing", weight: 15, done: MOCK_PROFILE.hasServices, href: "/dashboard/provider/edit-profile#services" },
  { key: "hasAvailability", label: "Set your availability", weight: 15, done: MOCK_PROFILE.hasAvailability, href: "/dashboard/provider/edit-profile#availability" },
  { key: "hasPetPrefs", label: "Set pet preferences", weight: 10, done: MOCK_PROFILE.hasPetPrefs, href: "/dashboard/provider/edit-profile#pets" },
  { key: "isVerified", label: "Get verified (ID upload)", weight: 15, done: MOCK_PROFILE.isVerified, href: "/dashboard/provider/edit-profile#verification" },
  { key: "hasCancellationPolicy", label: "Choose cancellation policy", weight: 10, done: MOCK_PROFILE.hasCancellationPolicy, href: "/dashboard/provider/edit-profile#cancellation" },
] as const;

function getCompletenessScore() {
  let score = 0;
  if (MOCK_PROFILE.hasBio) score += 10;
  if (MOCK_PROFILE.hasAvatar) score += 10;
  if (MOCK_PROFILE.photoCount >= 3) score += 15;
  if (MOCK_PROFILE.hasServices) score += 15;
  if (MOCK_PROFILE.hasAvailability) score += 15;
  if (MOCK_PROFILE.hasPetPrefs) score += 10;
  if (MOCK_PROFILE.isVerified) score += 15;
  if (MOCK_PROFILE.hasCancellationPolicy) score += 10;
  return score;
}

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "bookings", label: "My Bookings", icon: Calendar },
  { id: "meetgreet", label: "Meet & Greets", icon: Heart },
  { id: "disputes", label: "Disputes & Claims", icon: AlertCircle },
  { id: "earnings", label: "Earnings", icon: Wallet },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "training", label: "Training", icon: GraduationCap },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

export function ProviderDashboardClient({
  stripeStatus,
  initialBookings,
  initialReviews = [],
  initialEarnings = null,
  initialMeetAndGreets = { requested: [], confirmed: [], completed: [] },
  initialDisputes = [],
  initialClaims = [],
  profileCompletenessPercentage,
  trainingCourses = [],
  requiredTrainingComplete = true,
}: {
  stripeStatus: ProviderStripeStatus;
  initialBookings: ProviderBookingCard[];
  initialReviews?: ProviderReviewForDashboard[];
  initialEarnings?: ProviderEarnings | null;
  initialMeetAndGreets?: {
    requested: ProviderMeetAndGreetCard[];
    confirmed: ProviderMeetAndGreetCard[];
    completed: ProviderMeetAndGreetCard[];
  };
  initialDisputes?: DisputeCard[];
  initialClaims?: ClaimCard[];
  profileCompletenessPercentage?: number;
  trainingCourses?: ProviderDashboardTrainingCourse[];
  requiredTrainingComplete?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("profile");
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [bookings, setBookings] = useState<ProviderBookingCard[]>(initialBookings);
  const [reviews, setReviews] = useState<ProviderReviewForDashboard[]>(initialReviews);
  const [meetAndGreets, setMeetAndGreets] = useState(initialMeetAndGreets);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [respondingReviewId, setRespondingReviewId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [mngRespondingId, setMngRespondingId] = useState<string | null>(null);
  const [mngSuggestDatetime, setMngSuggestDatetime] = useState<Record<string, string>>({});
  const [mngMessage, setMngMessage] = useState<Record<string, string>>({});
  const [reportProblemBookingId, setReportProblemBookingId] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<DisputeCard[]>(initialDisputes);
  const [claims, setClaims] = useState<ClaimCard[]>(initialClaims);
  const [disputeResponseText, setDisputeResponseText] = useState<Record<string, string>>({});
  const [claimResponseText, setClaimResponseText] = useState<Record<string, string>>({});
  const [respondingDisputeId, setRespondingDisputeId] = useState<string | null>(null);
  const [respondingClaimId, setRespondingClaimId] = useState<string | null>(null);
  const [startingServiceId, setStartingServiceId] = useState<string | null>(null);
  const [completingBookingId, setCompletingBookingId] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [sendUpdateBooking, setSendUpdateBooking] = useState<{ id: string; headline: string } | null>(null);
  const score = profileCompletenessPercentage ?? getCompletenessScore();
  const firstRequiredCourse = trainingCourses.find((c) => c.required);
  const showRequiredTrainingBanner = !requiredTrainingComplete && firstRequiredCourse != null;

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);
  useEffect(() => {
    setMeetAndGreets(initialMeetAndGreets);
  }, [initialMeetAndGreets]);
  useEffect(() => {
    setDisputes(initialDisputes);
    setClaims(initialClaims);
  }, [initialDisputes, initialClaims]);

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter((b) =>
    ["accepted", "active"].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");

  async function handleAccept(bookingId: string) {
    if (acceptingId) return;
    setAcceptingId(bookingId);
    const result = await acceptBooking(bookingId);
    setAcceptingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "accepted" } : b))
    );
    router.refresh();
    toast.success("Booking accepted. Payment captured.");
  }

  async function handleDecline(bookingId: string) {
    if (decliningId) return;
    setDecliningId(bookingId);
    const result = await declineBooking(bookingId);
    setDecliningId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "declined" } : b))
    );
    router.refresh();
    toast.success("Booking declined.");
  }

  async function handleStartNonWalk(bookingId: string) {
    if (startingServiceId) return;
    setStartingServiceId(bookingId);
    const result = await startNonWalkService(bookingId);
    setStartingServiceId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "active" } : b))
    );
    router.refresh();
    toast.success("Service started — the owner has been notified.");
  }

  async function handleCompleteNonWalk(bookingId: string) {
    if (completingBookingId) return;
    setCompletingBookingId(bookingId);
    const result = await completeNonWalkBooking(bookingId);
    setCompletingBookingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b))
    );
    router.refresh();
    toast.success("Booking marked complete.");
  }

  async function handleProviderCancelBooking(bookingId: string) {
    if (cancellingBookingId) return;
    if (
      !confirm(
        "Cancel this booking? The pet owner receives a full refund and will be notified."
      )
    )
      return;
    setCancellingBookingId(bookingId);
    const result = await cancelAcceptedBookingAsProvider(bookingId);
    setCancellingBookingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
    router.refresh();
    toast.success("Booking cancelled. Refund initiated.");
  }

  async function handleRespondToReview(reviewId: string) {
    const text = responseText[reviewId]?.trim();
    if (!text) {
      toast.error("Please enter a response.");
      return;
    }
    setRespondingReviewId(reviewId);
    const result = await respondToReview({ reviewId, response: text });
    setRespondingReviewId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, providerResponse: text, responseAt: new Date() }
          : r
      )
    );
    setResponseText((prev) => ({ ...prev, [reviewId]: "" }));
    router.refresh();
    toast.success("Response published.");
  }

  async function handleMeetAndGreetRespond(
    id: string,
    action: "accept" | "suggest" | "decline"
  ) {
    if (mngRespondingId) return;
    setMngRespondingId(id);
    const suggestDt = mngSuggestDatetime[id];
    const msg = mngMessage[id]?.trim() ?? null;
    if (action === "suggest" && (!suggestDt || !new Date(suggestDt).getTime())) {
      toast.error("Please enter a date and time for your suggestion.");
      setMngRespondingId(null);
      return;
    }
    const result = await respondToMeetAndGreet(id, {
      action,
      suggestedDatetime: action === "suggest" ? suggestDt : null,
      message: msg,
    });
    setMngRespondingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const next = await getProviderMeetAndGreets();
    if (!next.error) setMeetAndGreets(next);
    setMngSuggestDatetime((prev) => ({ ...prev, [id]: "" }));
    setMngMessage((prev) => ({ ...prev, [id]: "" }));
    router.refresh();
    toast.success(
      action === "accept"
        ? "Meet & Greet confirmed."
        : action === "suggest"
          ? "Alternative time sent."
          : "Request declined."
    );
  }

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

  async function handleSetUpPayouts() {
    if (!stripeStatus.hasProfile) return;
    setPayoutsLoading(true);
    const result = await createStripeConnectOnboardingLink();
    setPayoutsLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 sm:py-20" style={{ maxWidth: "var(--max-width)" }}>
        <h1 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}>Provider dashboard</h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>Manage your profile, bookings, and earnings.</p>

        {showRequiredTrainingBanner && firstRequiredCourse ? (
          <div
            className="mt-6 flex flex-col gap-3 rounded-[var(--radius-lg)] border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "var(--color-primary-200)", backgroundColor: "rgba(10, 128, 128, 0.06)" }}
            role="status"
          >
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                <GraduationCap className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}>
                  Complete {firstRequiredCourse.title} to appear in search
                </p>
                <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
                  Finish required training so verified pet owners can find you.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/provider/courses/${firstRequiredCourse.slug}`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] px-5 text-sm font-semibold text-white sm:self-center"
              style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
            >
              {!firstRequiredCourse.certification ? "Start course" : "Retake course"}
            </Link>
          </div>
        ) : null}

        {/* Profile completeness */}
        <section className="mt-8 rounded-[var(--radius-lg)] border p-8 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Profile completeness</h2>
              <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {score === 100 ? "Complete! You're ready to receive bookings." : "Complete your profile to appear in search and get more bookings."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-32 overflow-hidden rounded-full bg-[var(--color-border)] sm:w-40">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--color-text)" }}>{score}%</span>
              {score === 100 && (
                <span className="rounded-full border px-2.5 py-0.5 text-xs font-semibold" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
                  Complete Profile
                </span>
              )}
            </div>
          </div>
          {score < 100 && (
            <ul className="mt-4 space-y-2">
              {COMPLETENESS_ITEMS.filter((i) => !i.done).map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-[var(--radius-lg)] border px-3 py-2 text-sm transition-colors hover:bg-[var(--color-primary-50)]"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-4 w-4" style={{ color: "var(--color-text-secondary)" }} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/provider/edit-profile"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            <Settings className="h-4 w-4" />
            Edit profile
          </Link>
        </section>

        {/* Tabs */}
        <div className="mt-8 border-b border-[var(--color-border)]">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Dashboard sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? "border-[var(--color-primary)]"
                    : "border-transparent"
                }`}
                style={{ fontFamily: "var(--font-body), sans-serif", color: tab === t.id ? "var(--color-primary)" : "var(--color-text-secondary)" }}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-6">
        {reportProblemBookingId && (
          <ReportProblemModal
            bookingId={reportProblemBookingId}
            onClose={() => setReportProblemBookingId(null)}
            onSuccess={() => setReportProblemBookingId(null)}
          />
        )}
        {sendUpdateBooking && (
          <SendBookingUpdateModal
            bookingId={sendUpdateBooking.id}
            open
            onClose={() => setSendUpdateBooking(null)}
            headline={`${sendUpdateBooking.headline} — share a moment with their family`}
          />
        )}

          {tab === "profile" && (
            <section className="rounded-[var(--radius-lg)] border p-8 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>My Profile</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Your public profile is what pet owners see. Keep it up to date.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)]">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>Photo & bio</p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Add a profile photo and write your bio.</p>
                  </div>
                  <Link href="/dashboard/provider/edit-profile#photo" className="ml-auto text-sm font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>Edit</Link>
                </div>
                <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>Services & pricing</p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Set which services you offer and your rates.</p>
                  </div>
                  <Link href="/dashboard/provider/edit-profile#services" className="ml-auto text-sm font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>Edit</Link>
                </div>
                <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)]">
                    <PawPrint className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>Pet preferences</p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Dogs, cats, size limits.</p>
                  </div>
                  <Link href="/dashboard/provider/edit-profile#pets" className="ml-auto text-sm font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>Edit</Link>
                </div>
                <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)]">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>Verification</p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Upload ID to get verified and appear in search.</p>
                  </div>
                  <Link href="/dashboard/provider/edit-profile#verification" className="ml-auto text-sm font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>Edit</Link>
                </div>
              </div>
            </section>
          )}

          {tab === "bookings" && (
            <section className="rounded-[var(--radius-lg)] border p-8 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>My Bookings</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Booking requests, active, and completed.</p>

              {/* Booking Requests (pending) */}
              <h3 className="mt-8 font-medium" style={{ color: "var(--color-text)" }}>Booking Requests</h3>
              <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>Respond within 4 hours.</p>
              {pendingBookings.length === 0 ? (
                <p className="mt-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>No pending requests.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {pendingBookings.map((b) => (
                    <li
                      key={b.id}
                      className="rounded-[var(--radius-lg)] border p-4"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: "var(--color-text)" }}>{b.ownerName}</p>
                          <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {b.petNames.join(", ")} · {SERVICE_LABELS[b.serviceType] ?? b.serviceType}
                          </p>
                          <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {formatDateTime(b.startDatetime)} – {formatDateTime(b.endDatetime)}
                          </p>
                          <p className="mt-1 font-medium" style={{ color: "var(--color-primary)" }}>{formatEur(b.totalPriceCents)}</p>
                          {b.specialInstructions && (
                            <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                              Instructions: {b.specialInstructions}
                            </p>
                          )}
                          <p className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            <Clock className="h-4 w-4" />
                            {formatTimeRemaining(b.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => handleAccept(b.id)}
                            disabled={acceptingId === b.id || decliningId !== null}
                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                          >
                            <Check className="h-4 w-4" />
                            {acceptingId === b.id ? "Accepting…" : "Accept"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecline(b.id)}
                            disabled={decliningId === b.id || acceptingId !== null}
                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-error)]/50 px-3 py-2 text-sm font-semibold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 disabled:opacity-70"
                          >
                            <X className="h-4 w-4" />
                            {decliningId === b.id ? "Declining…" : "Decline"}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Active bookings */}
              <h3 className="mt-8 font-medium" style={{ color: "var(--color-text)" }}>Active bookings</h3>
              {activeBookings.length === 0 ? (
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>None.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {activeBookings.map((b) =>
                    b.serviceType === "walking" && (b.status === "accepted" || b.status === "active") ? (
                      <ActiveWalkCard key={b.id} booking={b} />
                    ) : (
                      <li
                        key={b.id}
                        className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium" style={{ color: "var(--color-text)" }}>{b.ownerName} · {b.petNames.join(", ")} · {SERVICE_LABELS[b.serviceType] ?? b.serviceType}</p>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{formatDateTime(b.startDatetime)} – {formatDateTime(b.endDatetime)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--color-primary)]/15" style={{ color: "var(--color-primary)" }}>
                              {b.status}
                            </span>
                            <span className="font-semibold" style={{ color: "var(--color-text)" }}>{formatEur(b.totalPriceCents)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {b.status === "accepted" && (
                            <button
                              type="button"
                              onClick={() => handleStartNonWalk(b.id)}
                              disabled={
                                startingServiceId === b.id ||
                                completingBookingId === b.id ||
                                cancellingBookingId === b.id
                              }
                              className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                            >
                              {startingServiceId === b.id ? "Starting…" : "Start service"}
                            </button>
                          )}
                          {b.status === "active" && (
                            <button
                              type="button"
                              onClick={() =>
                                setSendUpdateBooking({
                                  id: b.id,
                                  headline: `${b.ownerName} · ${b.petNames.join(", ")} · ${SERVICE_LABELS[b.serviceType] ?? b.serviceType}`,
                                })
                              }
                              disabled={completingBookingId === b.id || cancellingBookingId === b.id}
                              className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-primary)] px-3 py-2 text-sm font-semibold hover:bg-[var(--color-primary-50)] disabled:opacity-70"
                              style={{ color: "var(--color-primary)" }}
                            >
                              Send update
                            </button>
                          )}
                          {(b.status === "active" || b.status === "accepted") && (
                            <button
                              type="button"
                              onClick={() => handleCompleteNonWalk(b.id)}
                              disabled={
                                completingBookingId === b.id ||
                                cancellingBookingId === b.id ||
                                (b.status === "accepted" && startingServiceId === b.id)
                              }
                              className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm font-semibold hover:bg-[var(--color-surface)] disabled:opacity-70"
                              style={{ color: "var(--color-text)" }}
                            >
                              {completingBookingId === b.id ? "Completing…" : "Mark complete"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleProviderCancelBooking(b.id)}
                            disabled={
                              cancellingBookingId === b.id ||
                              startingServiceId === b.id ||
                              completingBookingId === b.id
                            }
                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-error)]/50 px-3 py-2 text-sm font-semibold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 disabled:opacity-70"
                          >
                            {cancellingBookingId === b.id ? "Cancelling…" : "Cancel booking"}
                          </button>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              )}

              {/* Completed */}
              <h3 className="mt-8 font-medium" style={{ color: "var(--color-text)" }}>Completed</h3>
              {completedBookings.length === 0 ? (
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>No completed bookings yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {completedBookings.map((b) => (
                    <li
                      key={b.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border p-4"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div>
                        <p className="font-medium" style={{ color: "var(--color-text)" }}>{b.ownerName} · {b.petNames.join(", ")} · {SERVICE_LABELS[b.serviceType] ?? b.serviceType}</p>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{formatDateTime(b.startDatetime)}</p>
                      </div>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--color-neutral-200)]" style={{ color: "var(--color-text-secondary)" }}>
                        completed
                      </span>
                      <span className="font-semibold" style={{ color: "var(--color-text)" }}>{formatEur(b.totalPriceCents)}</span>
                      {!b.hasDispute && !b.hasGuaranteeClaim && (
                        <button
                          type="button"
                          onClick={() => setReportProblemBookingId(b.id)}
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-error)]/50 px-3 py-1.5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          Report a Problem
                        </button>
                      )}
                      {b.serviceType === "walking" && (b.walkSummaryMapUrl ?? b.walkDistanceKm != null) && (
                        <div className="mt-4 w-full rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Walk summary</p>
                          {b.walkActivities && b.walkActivities.length > 0 && (
                            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{walkActivitySummary(b.walkActivities)}</p>
                          )}
                          {b.walkSummaryMapUrl && (
                            <img src={b.walkSummaryMapUrl} alt="Walk route" className="mt-2 h-40 w-full rounded-[var(--radius-lg)] object-cover object-center" />
                          )}
                          <div className="mt-2 flex flex-wrap gap-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {b.walkDistanceKm != null && <span>{b.walkDistanceKm.toFixed(2)} km</span>}
                            {b.walkDurationMinutes != null && <span>{b.walkDurationMinutes} min</span>}
                            {b.walkStartedAt && <span>Started {formatDateTime(b.walkStartedAt)}</span>}
                            {b.walkEndedAt && <span>Ended {formatDateTime(b.walkEndedAt)}</span>}
                          </div>
                        </div>
                      )}
                      {!b.serviceReport ? (
                        <div className="mt-4 w-full">
                          <ServiceReportForm booking={b} />
                        </div>
                      ) : (
                        <div className="mt-4 w-full rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Service report</p>
                          {(b.serviceReport.arrivalTime || b.serviceReport.departureTime) && (
                            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                              {b.serviceReport.arrivalTime && `Arrived ${b.serviceReport.arrivalTime}`}
                              {b.serviceReport.arrivalTime && b.serviceReport.departureTime && " · "}
                              {b.serviceReport.departureTime && `Left ${b.serviceReport.departureTime}`}
                            </p>
                          )}
                          {b.serviceReport.notes && <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{b.serviceReport.notes}</p>}
                          {b.serviceReport.activities && b.serviceReport.activities.length > 0 && (
                            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Activities: {b.serviceReport.activities.join(", ")}</p>
                          )}
                          {b.serviceReport.photos && b.serviceReport.photos.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {b.serviceReport.photos.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                  <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                                </a>
                              ))}
                            </div>
                          )}
                          {b.serviceReport.submittedAt && (
                            <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>Submitted {formatDateTime(new Date(b.serviceReport.submittedAt))}</p>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

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

          {tab === "meetgreet" && (
            <section className="rounded-[var(--radius-lg)] border p-8 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Meet & Greet Requests</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Accept, suggest an alternative time, or decline requests from pet owners.</p>

              {(() => {
                const needsYourResponse = meetAndGreets.requested.filter((m) => !m.providerSuggestedDatetime);
                const awaitingOwner = meetAndGreets.requested.filter((m) => m.providerSuggestedDatetime);
                return (
                  <>
                    <h3 className="mt-8 font-medium" style={{ color: "var(--color-text)" }}>Needs your response</h3>
                    {needsYourResponse.length === 0 ? (
                      <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>Nothing waiting on you right now.</p>
                    ) : (
                      <ul className="mt-4 space-y-4">
                        {needsYourResponse.map((m) => (
                          <li key={m.id} className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                            <div>
                              <p className="font-semibold" style={{ color: "var(--color-text)" }}>{m.ownerName}</p>
                              <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>Pets: {m.petNames.join(", ")}</p>
                              <p className="mt-0.5 text-sm flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
                                <CalendarClock className="h-4 w-4" />
                                {formatDateTime(m.requestedDatetime)}
                              </p>
                              <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>Location: {m.locationType}</p>
                              {m.locationNotes && <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>Notes: {m.locationNotes}</p>}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleMeetAndGreetRespond(m.id, "accept")}
                                disabled={mngRespondingId === m.id}
                                className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                              >
                                <Check className="h-4 w-4" />
                                {mngRespondingId === m.id ? "Sending…" : "Accept"}
                              </button>
                              <div className="inline-flex flex-wrap items-center gap-2">
                                <input
                                  type="datetime-local"
                                  value={mngSuggestDatetime[m.id] ?? ""}
                                  onChange={(e) => setMngSuggestDatetime((prev) => ({ ...prev, [m.id]: e.target.value }))}
                                  className="rounded-[var(--radius-lg)] border px-2 py-1.5 text-sm"
                                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                                  placeholder="Suggest time"
                                />
                                <input
                                  type="text"
                                  value={mngMessage[m.id] ?? ""}
                                  onChange={(e) => setMngMessage((prev) => ({ ...prev, [m.id]: e.target.value }))}
                                  placeholder="Message (optional)"
                                  className="rounded-[var(--radius-lg)] border px-2 py-1.5 text-sm w-40"
                                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleMeetAndGreetRespond(m.id, "suggest")}
                                  disabled={mngRespondingId === m.id}
                                  className="rounded-[var(--radius-lg)] border border-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-70"
                                >
                                  Suggest alternative
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleMeetAndGreetRespond(m.id, "decline")}
                                disabled={mngRespondingId === m.id}
                                className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-error)]/50 px-3 py-2 text-sm font-semibold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 disabled:opacity-70"
                              >
                                <X className="h-4 w-4" />
                                Decline
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <h3 className="mt-10 font-medium" style={{ color: "var(--color-text)" }}>Awaiting pet owner confirmation</h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      You suggested a different time. The owner needs to accept it before the Meet & Greet is confirmed.
                    </p>
                    {awaitingOwner.length === 0 ? (
                      <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>None.</p>
                    ) : (
                      <ul className="mt-4 space-y-4">
                        {awaitingOwner.map((m) => (
                          <li key={m.id} className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                            <div>
                              <p className="font-semibold" style={{ color: "var(--color-text)" }}>{m.ownerName}</p>
                              <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>Pets: {m.petNames.join(", ")}</p>
                              <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                They asked for: {formatDateTime(m.requestedDatetime)}
                              </p>
                              <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                                You suggested: {m.providerSuggestedDatetime ? formatDateTime(m.providerSuggestedDatetime) : "—"}
                              </p>
                              {m.providerMessage && <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>Your message: {m.providerMessage}</p>}
                              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>Waiting for the owner to accept this time.</p>
                            </div>
                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() => handleMeetAndGreetRespond(m.id, "decline")}
                                disabled={mngRespondingId === m.id}
                                className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-error)]/50 px-3 py-2 text-sm font-semibold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 disabled:opacity-70"
                              >
                                <X className="h-4 w-4" />
                                Cancel request
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                );
              })()}

              <h3 className="mt-8 font-medium" style={{ color: "var(--color-text)" }}>Confirmed</h3>
              {meetAndGreets.confirmed.length === 0 ? (
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>None.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {meetAndGreets.confirmed.map((m) => {
                    const meetTime = m.confirmedDatetime ?? m.requestedDatetime;
                    const isPast = new Date(meetTime).getTime() < Date.now();
                    return (
                      <li key={m.id} className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)" }}>
                        <p className="font-medium" style={{ color: "var(--color-text)" }}>{m.ownerName} · {m.petNames.join(", ")}</p>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{formatDateTime(meetTime)} · {m.locationType}</p>
                        {isPast && (
                          <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                            How did it go?{" "}
                            <Link href={`/services/book/${m.providerSlug}`} className="underline hover:no-underline">
                              Ready to book?
                            </Link>
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              <h3 className="mt-8 font-medium" style={{ color: "var(--color-text)" }}>Completed / Declined</h3>
              {meetAndGreets.completed.length === 0 ? (
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>None.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {meetAndGreets.completed.map((m) => (
                    <li key={m.id} className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)" }}>
                      <p className="font-medium" style={{ color: "var(--color-text)" }}>{m.ownerName} · {m.petNames.join(", ")}</p>
                      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{formatDateTime(m.requestedDatetime)} · {m.status}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {tab === "earnings" && (
            <section className="rounded-[var(--radius-lg)] border p-8 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Earnings</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Your payouts and history.</p>

              {/* Set Up Payouts / Payouts connected */}
              <div className="mt-6 rounded-[var(--radius-lg)] border p-4" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                        {stripeStatus.hasStripeConnect ? "Payouts connected" : "Set up payouts"}
                      </p>
                      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {stripeStatus.hasStripeConnect
                          ? "You receive earnings via Stripe. Update your payout details anytime."
                          : stripeStatus.hasProfile
                            ? "Connect your bank account to receive earnings from completed bookings."
                            : "Complete your provider profile first, then connect your bank account."}
                      </p>
                    </div>
                  </div>
                  {stripeStatus.hasProfile && (
                    <button
                      type="button"
                      onClick={handleSetUpPayouts}
                      disabled={payoutsLoading}
                      className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                    >
                      {stripeStatus.hasStripeConnect ? (
                        <>
                          <Banknote className="h-4 w-4" />
                          {payoutsLoading ? "Loading…" : "Update payout details"}
                        </>
                      ) : (
                        <>
                          <Banknote className="h-4 w-4" />
                          {payoutsLoading ? "Loading…" : "Set Up Payouts"}
                        </>
                      )}
                    </button>
                  )}
                  {!stripeStatus.hasProfile && (
                    <Link
                      href="/dashboard/provider/edit-profile"
                      className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Complete profile
                    </Link>
                  )}
                </div>
                {stripeStatus.hasStripeConnect && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm" style={{ color: "var(--color-success)" }}>
                    <CheckCircle className="h-4 w-4" />
                    Payout account connected
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[var(--radius-lg)] border p-4" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Total earned</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--color-secondary)" }}>
                    {initialEarnings ? formatEur(initialEarnings.totalEarnedCents) : "€0.00"}
                  </p>
                  {initialEarnings && initialEarnings.tipsTotalCents > 0 && (
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Includes {formatEur(initialEarnings.tipsTotalCents)} in tips</p>
                  )}
                </div>
                <div className="rounded-[var(--radius-lg)] border p-4" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Pending payout</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--color-primary)" }}>€0.00</p>
                </div>
              </div>
              <h3 className="mt-6 font-medium" style={{ color: "var(--color-text)" }}>Payout history</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>No payouts yet. Complete a booking to start earning.</p>
            </section>
          )}

          {tab === "reviews" && (
            <section className="rounded-[var(--radius-lg)] border p-8 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Reviews</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Respond to reviews once. Your response is public on your profile.</p>
              {reviews.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed py-12 text-center" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <Star className="h-12 w-12" style={{ color: "var(--color-text-muted)" }} />
                  <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>No reviews yet.</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>After completed bookings, owners can leave reviews here.</p>
                </div>
              ) : (
                <ul className="mt-6 space-y-6">
                  {reviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-[var(--radius-lg)] border p-4"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium" style={{ color: "var(--color-text)" }}>{r.reviewerName}</span>
                        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {new Date(r.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : ""}`} style={i >= r.rating ? { color: "var(--color-text-muted)" } : undefined} />
                          ))}
                        </span>
                      </div>
                      <p className="mt-2 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{r.text}</p>
                      {r.providerResponse ? (
                        <div className="mt-4 rounded-[var(--radius-lg)] border-l-4 pl-4 py-2" style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--color-surface)" }}>
                          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Your response</p>
                          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{r.providerResponse}</p>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <label htmlFor={`response-${r.id}`} className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Your response (one-time)</label>
                          <textarea
                            id={`response-${r.id}`}
                            value={responseText[r.id] ?? ""}
                            onChange={(e) => setResponseText((prev) => ({ ...prev, [r.id]: e.target.value }))}
                            rows={3}
                            placeholder="Thank the reviewer..."
                            className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRespondToReview(r.id)}
                            disabled={respondingReviewId === r.id}
                            className="mt-2 inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                          >
                            {respondingReviewId === r.id ? "Publishing…" : "Publish response"}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {tab === "training" && (
            <section className="rounded-[var(--radius-lg)] border p-8 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Training & certifications</h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Earn badges on your public profile. Required courses keep the marketplace safe.
                  </p>
                </div>
                <Link
                  href="/dashboard/provider/courses"
                  className="inline-flex h-10 items-center justify-center rounded-[var(--radius-pill)] px-5 text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Open courses
                </Link>
              </div>
              {trainingCourses.length === 0 ? (
                <p className="mt-8 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  No courses are available yet.
                </p>
              ) : (
                <>
                  <p className="mt-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {trainingCourses.length} course{trainingCourses.length !== 1 ? "s" : ""} available ·{" "}
                    {trainingCourses.filter((c) => c.certification?.passed).length} completed ·{" "}
                    {trainingCourses.filter((c) => c.certification?.passed).length} badge
                    {trainingCourses.filter((c) => c.certification?.passed).length !== 1 ? "s" : ""} earned
                  </p>
                  <ul className="mt-6 space-y-3">
                    {trainingCourses.map((c) => {
                      const done = c.certification?.passed === true;
                      const failed = c.certification && !c.certification.passed;
                      const dot = badgeColorVar(c.badgeColor);
                      return (
                        <li
                          key={c.id}
                          className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4 sm:flex-row sm:items-center sm:justify-between"
                          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                        >
                          <div className="flex min-w-0 gap-3">
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} title={c.badgeLabel} aria-hidden />
                            <div className="min-w-0">
                              <p className="font-semibold" style={{ color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}>
                                {c.title}
                                {c.required ? (
                                  <span className="ml-2 text-xs font-normal" style={{ color: "var(--color-primary)" }}>
                                    (required for search)
                                  </span>
                                ) : null}
                              </p>
                              <p className="mt-0.5 line-clamp-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                {c.description}
                              </p>
                              <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                ~{c.estimatedMinutes} min · Badge: {c.badgeLabel}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                            {done ? (
                              <span className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>
                                Completed · {c.certification!.score}%
                              </span>
                            ) : failed ? (
                              <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Last score {c.certification!.score}% — try again
                              </span>
                            ) : (
                              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Not started</span>
                            )}
                            <Link
                              href={`/dashboard/provider/courses/${c.slug}`}
                              className="inline-flex h-9 items-center justify-center rounded-[var(--radius-lg)] px-4 text-sm font-semibold text-white"
                              style={{ backgroundColor: "var(--color-primary)" }}
                            >
                              {done ? "Review badge" : failed ? "Retake" : "Start"}
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>
          )}

          {tab === "messages" && (
            <section className="rounded-[var(--radius-lg)] border p-8 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Messages</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Conversations with pet owners.</p>
              <div className="mt-6 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed py-12 text-center" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                <MessageSquare className="h-12 w-12" style={{ color: "var(--color-text-muted)" }} />
                <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>No messages yet.</p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>When owners contact you, conversations will appear here.</p>
              </div>
            </section>
          )}
        </div>

        <p className="mt-8">
          <Link href="/" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
