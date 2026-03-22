"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Inbox,
  Truck,
  MessageSquare,
  User,
  Plus,
  Pencil,
  ExternalLink,
  Coins,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import type { OrgApplicationRow, OrgListingRow } from "@/lib/rescue/rescue-org-dashboard-types";
import {
  approveApplication,
  declineApplication,
  toggleListingStatus,
  updateOrgProfile,
} from "./actions";
import type { OrgDonationSummary } from "@/lib/giving/org-donation-types";
import { markRescueDonationsTabSeen } from "@/lib/giving/org-donation-actions";
import { approveAdoptionSuccessStory } from "@/lib/adoption/success-stories-actions";
import { RescueOrgShowcaseFields } from "@/components/rescue/RescueOrgShowcaseFields";
import { teamMembersFromPrismaJson } from "@/lib/validations/rescue-org-showcase";

type TabId = "listings" | "inquiries" | "pipeline" | "donations" | "messages" | "profile";

type Props = {
  org: {
    id: string;
    name: string;
    mission: string | null;
    location: string | null;
    website: string | null;
    socialLinks: unknown;
    logoUrl: string | null;
    slug: string;
    verified: boolean;
    donationsTabLastSeenAt: Date | null;
    description: string | null;
    foundedYear: number | null;
    teamMembers: unknown;
    facilityPhotos: string[];
    facilityVideoUrl: string | null;
    operatingHours: string | null;
    volunteerInfo: string | null;
    donationNeeds: string | null;
    totalAnimalsRescued: number | null;
    totalAnimalsAdopted: number | null;
    contactPhone: string | null;
    contactEmail: string | null;
    district: string | null;
    coverPhotoUrl: string | null;
  };
  listings: OrgListingRow[];
  applications: OrgApplicationRow[];
  placements: {
    id: string;
    status: string;
    destinationCountry: string;
    listingName: string;
    adopterName: string;
    createdAt: Date;
    awaitingGalleryApproval: boolean;
  }[];
  /** From ?welcome=1 after self-registration */
  welcomeJustRegistered?: boolean;
  donationSummary: OrgDonationSummary | null;
  recentDonations: {
    id: string;
    createdAt: string;
    amountCents: number;
    sourceLabel: string;
    donorDisplay: string;
  }[];
  payoutHistory: {
    id: string;
    monthLabel: string;
    amountCents: number;
    paymentMethod: string;
    status: string;
    paidAt: string | null;
  }[];
  charityLinked: boolean;
  hasNewDonations: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  application_pending: "Application Pending",
  matched: "Matched",
  in_transit: "In Transit",
  adopted: "Adopted",
};

const APP_STATUS_LABELS: Record<string, string> = {
  new: "New",
  under_review: "Under Review",
  approved: "Approved",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

const PLACEMENT_STATUS_LABELS: Record<string, string> = {
  preparing: "Preparing",
  vet_complete: "Vet complete",
  transport_booked: "Transport booked",
  in_transit: "In transit",
  delivered: "Delivered",
  follow_up: "Follow-up",
  completed: "Completed",
};

const PAYOUT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
};

function formatEurFromCents(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

const EMPTY_DONATION_SUMMARY: OrgDonationSummary = {
  totalReceivedDirectCents: 0,
  totalReceivedFundPayoutsCents: 0,
  totalReceivedAllTimeCents: 0,
  thisMonthDirectCents: 0,
  supporterCount: 0,
  pendingPayoutCents: 0,
  latestDonationAt: null,
  charityIds: [],
};

export function RescueDashboardClient({
  org,
  listings,
  applications,
  placements,
  welcomeJustRegistered = false,
  donationSummary,
  recentDonations,
  payoutHistory,
  charityLinked,
  hasNewDonations,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("listings");
  const [donationBadgeCleared, setDonationBadgeCleared] = useState(false);
  const sum = donationSummary ?? EMPTY_DONATION_SUMMARY;
  const showDonationsBadge = hasNewDonations && !donationBadgeCleared && tab !== "donations";
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [pendingApprove, setPendingApprove] = useState<string | null>(null);
  const [pendingDecline, setPendingDecline] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<string | null>(null);
  const [pendingStoryApprove, setPendingStoryApprove] = useState<string | null>(null);

  const byStatus = {
    new: applications.filter((a) => a.status === "new"),
    under_review: applications.filter((a) => a.status === "under_review"),
    approved: applications.filter((a) => a.status === "approved"),
    declined: applications.filter((a) => a.status === "declined"),
  };

  async function handleApprove(id: string) {
    setPendingApprove(id);
    const result = await approveApplication(id);
    setPendingApprove(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Application approved.");
      router.refresh();
    }
  }

  async function handleDecline(id: string) {
    setPendingDecline(id);
    const result = await declineApplication(id);
    setPendingDecline(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Application declined.");
      router.refresh();
    }
  }

  async function handleApproveGalleryStory(placementId: string) {
    setPendingStoryApprove(placementId);
    const result = await approveAdoptionSuccessStory(placementId);
    setPendingStoryApprove(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Story approved for Tinies who made it.");
      router.refresh();
    }
  }

  async function handleToggle(listingId: string) {
    setPendingToggle(listingId);
    const result = await toggleListingStatus(listingId);
    setPendingToggle(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Listing updated.");
      router.refresh();
    }
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await updateOrgProfile(formData);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Profile updated.");
      router.refresh();
    }
  }

  function selectTab(next: TabId) {
    setTab(next);
    if (next === "donations") {
      setDonationBadgeCleared(true);
      void markRescueDonationsTabSeen(org.id);
    }
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode; showBadge?: boolean }[] = [
    { id: "listings", label: "Active Listings", icon: <LayoutGrid className="h-4 w-4" /> },
    { id: "inquiries", label: "Adoption Inquiries", icon: <Inbox className="h-4 w-4" /> },
    { id: "pipeline", label: "Placement Pipeline", icon: <Truck className="h-4 w-4" /> },
    {
      id: "donations",
      label: "Donations & Payouts",
      icon: <Coins className="h-4 w-4" />,
      showBadge: showDonationsBadge,
    },
    { id: "messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "profile", label: "Org Profile", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <div className="mt-8">
      {!org.verified && (
        <div
          className="mb-6 rounded-[var(--radius-lg)] border px-4 py-3 text-sm leading-relaxed"
          role="status"
          style={{
            backgroundColor: "var(--color-warning-bg)",
            borderColor: "var(--color-warning-border)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body), sans-serif",
          }}
        >
          {welcomeJustRegistered ? (
            <p style={{ fontFamily: "var(--font-heading), serif" }}>
              Welcome! Your organisation is pending verification. Our team will review your profile within 5
              business days. You can start adding animal listings while you wait.
            </p>
          ) : (
            <p>
              Your organisation is pending verification. You can add listings and manage your profile while you
              wait. Our team will verify your organisation within 5 business days. Your listings won&apos;t appear
              in public search until your organisation is verified.
            </p>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <Link
          href="/dashboard/rescue/campaigns"
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] border px-4 text-sm font-semibold transition-colors hover:bg-[var(--color-primary-50)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
        >
          <Megaphone className="h-4 w-4" aria-hidden />
          Fundraising campaigns
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 border-b" style={{ borderColor: "var(--color-border)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className={`relative flex items-center gap-2 rounded-t-[var(--radius-lg)] border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent hover:bg-[var(--color-primary-50)]"
            }`}
            style={{ color: tab === t.id ? "var(--color-primary)" : "var(--color-text-secondary)" }}
          >
            {t.icon}
            <span className="flex items-center gap-1.5">
              {t.label}
              {t.showBadge && tab !== "donations" && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--color-secondary)" }}
                  aria-label="New donations"
                />
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "listings" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {listings.length} listing{listings.length !== 1 ? "s" : ""}
              </p>
              <Link
                href="/dashboard/rescue/listings/new"
                className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Add New Listing
              </Link>
            </div>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <li
                  key={listing.id}
                  className="rounded-[var(--radius-lg)] border p-4"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    boxShadow: "var(--shadow-sm)",
                    opacity: listing.active ? undefined : 0.85,
                  }}
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-background)]">
                    {listing.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.photos[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">🐾</div>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold" style={{ color: "var(--color-text)" }}>
                    {listing.name}
                  </h3>
                  <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {listing.species}
                    {listing.breed ? ` · ${listing.breed}` : ""}
                    {listing.estimatedAge ? ` · ${listing.estimatedAge}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--color-primary-50)",
                        color: "var(--color-primary)",
                        borderColor: "var(--color-primary-200)",
                      }}
                    >
                      {STATUS_LABELS[listing.status] ?? listing.status}
                    </span>
                    {!listing.active && (
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/rescue/listings/${listing.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-primary-50)]"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={!!pendingToggle}
                      onClick={() => handleToggle(listing.id)}
                      className="inline-flex items-center gap-1 rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-primary-50)] disabled:opacity-50"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    >
                      {pendingToggle === listing.id ? "…" : listing.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {listings.length === 0 && (
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                No listings yet. Add your first adoption listing to get started.
              </p>
            )}
          </div>
        )}

        {tab === "inquiries" && (
          <div>
            {(["new", "under_review", "approved", "declined"] as const).map((statusKey) => {
              const list = byStatus[statusKey];
              if (list.length === 0) return null;
              return (
                <div key={statusKey} className="mb-8">
                  <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                    {APP_STATUS_LABELS[statusKey]} ({list.length})
                  </h3>
                  <ul className="space-y-4">
                    {list.map((app) => (
                      <li
                        key={app.id}
                        className="rounded-[var(--radius-lg)] border p-4"
                        style={{
                          backgroundColor: statusKey === "new" ? "var(--color-primary-50)" : "var(--color-surface)",
                          borderColor: statusKey === "new" ? "var(--color-primary-200)" : "var(--color-border)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                              {app.applicantName}
                            </p>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                              {app.city}, {app.country} · For {app.listingName}
                            </p>
                            <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                              Submitted {formatDate(app.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {app.status === "new" && (
                              <>
                                <button
                                  type="button"
                                  disabled={!!pendingApprove}
                                  onClick={() => handleApprove(app.id)}
                                  className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                                >
                                  {pendingApprove === app.id ? "…" : "Approve"}
                                </button>
                                <button
                                  type="button"
                                  disabled={!!pendingDecline}
                                  onClick={() => handleDecline(app.id)}
                                  className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-lg)] border px-3 text-sm font-medium hover:bg-[var(--color-background)] disabled:opacity-50"
                                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                                >
                                  {pendingDecline === app.id ? "…" : "Decline"}
                                </button>
                              </>
                            )}
                            {app.status === "under_review" && (
                              <>
                                <button
                                  type="button"
                                  disabled={!!pendingApprove}
                                  onClick={() => handleApprove(app.id)}
                                  className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={!!pendingDecline}
                                  onClick={() => handleDecline(app.id)}
                                  className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-lg)] border px-3 text-sm font-medium disabled:opacity-50"
                                  style={{ borderColor: "var(--color-border)" }}
                                >
                                  Decline
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          Living: {app.livingSituation ?? "—"} · Garden: {app.hasGarden == null ? "—" : app.hasGarden ? "Yes" : "No"}
                          {app.experience && ` · Experience: ${app.experience.slice(0, 80)}${app.experience.length > 80 ? "…" : ""}`}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                          className="mt-2 text-sm font-medium hover:underline"
                          style={{ color: "var(--color-primary)" }}
                        >
                          {expandedAppId === app.id ? "Hide full application" : "View full application"}
                        </button>
                        {expandedAppId === app.id && (
                          <div className="mt-4 space-y-2 rounded-[var(--radius-lg)] border p-4 text-sm" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                            <p><strong>Country / City:</strong> {app.country}, {app.city}</p>
                            <p><strong>Living situation:</strong> {app.livingSituation ?? "—"}</p>
                            <p><strong>Garden:</strong> {app.hasGarden == null ? "—" : app.hasGarden ? "Yes" : "No"}</p>
                            {app.otherPets && <p><strong>Other pets:</strong> {app.otherPets}</p>}
                            {app.childrenAges && <p><strong>Children&apos;s ages:</strong> {app.childrenAges}</p>}
                            {app.experience && <p><strong>Experience:</strong> {app.experience}</p>}
                            {app.reason && <p><strong>Reason for adopting:</strong> {app.reason}</p>}
                            {app.vetReference && <p><strong>Vet reference:</strong> {app.vetReference}</p>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {applications.length === 0 && (
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                No adoption inquiries yet.
              </p>
            )}
          </div>
        )}

        {tab === "pipeline" && (
          <div>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Approved applications and their placement progress.
            </p>
            {placements.length > 0 ? (
              <ul className="mt-6 space-y-4">
                {placements.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-[var(--radius-lg)] border p-4"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                          {p.listingName} → {p.adopterName}
                        </p>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {p.destinationCountry} · {formatDate(p.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {p.awaitingGalleryApproval ? (
                          <button
                            type="button"
                            onClick={() => void handleApproveGalleryStory(p.id)}
                            disabled={pendingStoryApprove === p.id}
                            className="rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: "var(--color-secondary)" }}
                          >
                            {pendingStoryApprove === p.id ? "Approving…" : "Approve gallery story"}
                          </button>
                        ) : null}
                        <span
                          className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: "var(--color-primary-50)",
                            color: "var(--color-primary)",
                            borderColor: "var(--color-primary-200)",
                          }}
                        >
                          {PLACEMENT_STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                No active placements yet. Approved applications will appear here.
              </p>
            )}
            <p className="mt-6">
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Admin adoption pipeline <ExternalLink className="h-4 w-4" />
              </Link>
            </p>
          </div>
        )}

        {tab === "donations" && (
          <div>
            {!charityLinked && (
              <div
                className="mb-6 rounded-[var(--radius-lg)] border px-4 py-3 text-sm leading-relaxed"
                style={{
                  backgroundColor: "var(--color-primary-50)",
                  borderColor: "var(--color-primary-200)",
                  color: "var(--color-text)",
                }}
              >
                <strong style={{ fontFamily: "var(--font-heading), serif" }}>No charity profile linked yet.</strong>{" "}
                Donations and payouts appear when your Tinies charity profile matches this rescue — same account email,
                same public slug, or an explicit link set by Tinies. Contact{" "}
                <a href="mailto:hello@tinies.app" className="font-medium underline" style={{ color: "var(--color-primary)" }}>
                  hello@tinies.app
                </a>{" "}
                if you need help connecting your charity.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Total received (all time)",
                  value: formatEurFromCents(sum.totalReceivedAllTimeCents),
                  hint: "Direct gifts + completed fund payouts",
                },
                {
                  label: "This month (direct)",
                  value: formatEurFromCents(sum.thisMonthDirectCents),
                  hint: "Round-ups, Guardian, one-time to your charity",
                },
                {
                  label: "Supporters",
                  value: String(sum.supporterCount),
                  hint: "Unique donors + active Guardians",
                },
                {
                  label: "Pending fund payout",
                  value: formatEurFromCents(sum.pendingPayoutCents),
                  hint: "Allocated in a Tinies run, not yet completed",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-[var(--radius-lg)] border p-4"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums" style={{ color: "var(--color-primary)" }}>
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {card.hint}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
              Giving Fund shares from platform commission are included in totals once paid in a completed monthly
              distribution. They do not appear as rows in the table below (only direct gifts to your charity do).
            </p>

            <h3 className="mt-10 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Recent donations
            </h3>
            <div className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-primary-50)" }}>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>
                      Source
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>
                      Donor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center" style={{ color: "var(--color-text-secondary)" }}>
                        {charityLinked ? "No direct donations recorded yet." : "Link your charity to see donations."}
                      </td>
                    </tr>
                  ) : (
                    recentDonations.map((row) => (
                      <tr key={row.id} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                        <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                          {formatDate(new Date(row.createdAt))}
                        </td>
                        <td className="px-4 py-3 font-medium tabular-nums" style={{ color: "var(--color-primary)" }}>
                          {formatEurFromCents(row.amountCents)}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--color-text)" }}>
                          {row.sourceLabel}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                          {row.donorDisplay}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="mt-10 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Payout history
            </h3>
            {payoutHistory.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Payouts are processed monthly. Your first payout will be issued at the end of the month.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-primary-50)" }}>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>
                        Month
                      </th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>
                        Method
                      </th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>
                        Date paid
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutHistory.map((row) => (
                      <tr key={row.id} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                        <td className="px-4 py-3" style={{ color: "var(--color-text)" }}>
                          {row.monthLabel}
                        </td>
                        <td className="px-4 py-3 font-medium tabular-nums" style={{ color: "var(--color-primary)" }}>
                          {formatEurFromCents(row.amountCents)}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                          {row.paymentMethod}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: "var(--color-primary-50)",
                              color: "var(--color-primary)",
                              borderColor: "var(--color-primary-200)",
                            }}
                          >
                            {PAYOUT_STATUS_LABELS[row.status] ?? row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                          {row.paidAt ? formatDate(new Date(row.paidAt)) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "messages" && (
          <div>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Your conversations with adopters and the Tinies team.
            </p>
            <Link
              href="/dashboard/messages"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:opacity-90"
            >
              <MessageSquare className="h-4 w-4" />
              Open Messages
            </Link>
          </div>
        )}

        {tab === "profile" && (
          <div className="max-w-3xl">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="org-name" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Organization name
                </label>
                <input
                  id="org-name"
                  name="name"
                  type="text"
                  defaultValue={org.name}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                />
              </div>
              <div>
                <label htmlFor="org-mission" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Mission
                </label>
                <textarea
                  id="org-mission"
                  name="mission"
                  rows={3}
                  defaultValue={org.mission ?? ""}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                />
              </div>
              <div>
                <label htmlFor="org-location" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Location
                </label>
                <input
                  id="org-location"
                  name="location"
                  type="text"
                  defaultValue={org.location ?? ""}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                />
              </div>
              <div>
                <label htmlFor="org-website" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Website
                </label>
                <input
                  id="org-website"
                  name="website"
                  type="url"
                  defaultValue={org.website ?? ""}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                />
              </div>
              <div>
                <label htmlFor="org-socialLinks" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Social links (JSON, e.g. {`{"facebook": "url", "instagram": "url"}`})
                </label>
                <input
                  id="org-socialLinks"
                  name="socialLinks"
                  type="text"
                  defaultValue={typeof org.socialLinks === "string" ? org.socialLinks : JSON.stringify(org.socialLinks ?? {}, null, 2)}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                />
              </div>
              <div>
                <label htmlFor="org-logoUrl" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Logo URL
                </label>
                <input
                  id="org-logoUrl"
                  name="logoUrl"
                  type="url"
                  defaultValue={org.logoUrl ?? ""}
                  className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                />
              </div>

              <RescueOrgShowcaseFields
                orgId={org.id}
                allowPhotoUpload
                initial={{
                  description: org.description,
                  foundedYear: org.foundedYear,
                  teamMembers: teamMembersFromPrismaJson(org.teamMembers),
                  facilityPhotos: org.facilityPhotos,
                  facilityVideoUrl: org.facilityVideoUrl,
                  operatingHours: org.operatingHours,
                  volunteerInfo: org.volunteerInfo,
                  donationNeeds: org.donationNeeds,
                  totalAnimalsRescued: org.totalAnimalsRescued,
                  totalAnimalsAdopted: org.totalAnimalsAdopted,
                  contactPhone: org.contactPhone,
                  publicContactEmail: org.contactEmail,
                  district: org.district,
                  coverPhotoUrl: org.coverPhotoUrl,
                }}
              />

              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-6 text-sm font-semibold text-white hover:opacity-90"
              >
                Save profile
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
