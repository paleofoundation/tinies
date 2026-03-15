"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

type TabId = "profile" | "bookings" | "earnings" | "messages";

// Mock profile state for completeness (incomplete for demo)
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
  { id: "earnings", label: "Earnings", icon: Wallet },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

const MOCK_BOOKINGS = [
  { id: "1", petName: "Bella", service: "Dog walking", date: "Tomorrow, 10:00", status: "pending" as const },
  { id: "2", petName: "Max", service: "Pet sitting", date: "Mar 20–22", status: "active" as const },
  { id: "3", petName: "Luna", service: "Drop-in visit", date: "Mar 15", status: "completed" as const },
];

export default function ProviderDashboardPage() {
  const [tab, setTab] = useState<TabId>("profile");
  const score = getCompletenessScore();

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 sm:py-20">
        <h1 className="text-2xl font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Provider dashboard</h1>
        <p className="mt-1 text-[#6B7280]">Manage your profile, bookings, and earnings.</p>

        {/* Profile completeness */}
        <section className="mt-8 rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Profile completeness</h2>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                {score === 100 ? "Complete! You're ready to receive bookings." : "Complete your profile to appear in search and get more bookings."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-32 overflow-hidden rounded-full bg-[#E5E7EB] sm:w-40">
                <div
                  className="h-full rounded-full bg-[#0A6E5C] transition-all"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-sm font-semibold tabular-nums text-[#1B2432]">{score}%</span>
            </div>
          </div>
          {score < 100 && (
            <ul className="mt-4 space-y-2">
              {COMPLETENESS_ITEMS.filter((i) => !i.done).map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-3 py-2 text-sm text-[#1B2432] transition-colors hover:bg-[#0A6E5C]/5"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/provider/edit-profile"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0A6E5C] hover:underline"
          >
            <Settings className="h-4 w-4" />
            Edit profile
          </Link>
        </section>

        {/* Tabs */}
        <div className="mt-8 border-b border-[#E5E7EB]">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Dashboard sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? "border-[#0A6E5C] text-[#0A6E5C]"
                    : "border-transparent text-[#6B7280] hover:text-[#1B2432]"
                }`}
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {tab === "profile" && (
            <section className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
              <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>My Profile</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Your public profile is what pet owners see. Keep it up to date.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6E5C]/10 text-[#0A6E5C]">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Photo & bio</p>
                    <p className="text-sm text-[#6B7280]">Add a profile photo and write your bio.</p>
                  </div>
                  <Link href="/dashboard/provider/edit-profile#photo" className="ml-auto text-sm font-semibold text-[#0A6E5C] hover:underline">Edit</Link>
                </div>
                <div className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6E5C]/10 text-[#0A6E5C]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Services & pricing</p>
                    <p className="text-sm text-[#6B7280]">Set which services you offer and your rates.</p>
                  </div>
                  <Link href="/dashboard/provider/edit-profile#services" className="ml-auto text-sm font-semibold text-[#0A6E5C] hover:underline">Edit</Link>
                </div>
                <div className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6E5C]/10 text-[#0A6E5C]">
                    <PawPrint className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Pet preferences</p>
                    <p className="text-sm text-[#6B7280]">Dogs, cats, size limits.</p>
                  </div>
                  <Link href="/dashboard/provider/edit-profile#pets" className="ml-auto text-sm font-semibold text-[#0A6E5C] hover:underline">Edit</Link>
                </div>
                <div className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6E5C]/10 text-[#0A6E5C]">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Verification</p>
                    <p className="text-sm text-[#6B7280]">Upload ID to get verified and appear in search.</p>
                  </div>
                  <Link href="/dashboard/provider/edit-profile#verification" className="ml-auto text-sm font-semibold text-[#0A6E5C] hover:underline">Edit</Link>
                </div>
              </div>
            </section>
          )}

          {tab === "bookings" && (
            <section className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
              <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>My Bookings</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Pending, active, and past bookings.</p>
              <ul className="mt-6 space-y-3">
                {MOCK_BOOKINGS.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] p-4"
                  >
                    <div>
                      <p className="font-medium text-[#1B2432]">{b.petName} · {b.service}</p>
                      <p className="text-sm text-[#6B7280]">{b.date}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        b.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : b.status === "active"
                            ? "bg-[#0A6E5C]/15 text-[#0A6E5C]"
                            : "bg-[#6B7280]/15 text-[#6B7280]"
                      }`}
                    >
                      {b.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tab === "earnings" && (
            <section className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
              <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Earnings</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Your payouts and history.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] p-4">
                  <p className="text-sm text-[#6B7280]">Total earned</p>
                  <p className="mt-1 text-2xl font-bold text-[#F45D48]">€0.00</p>
                </div>
                <div className="rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] p-4">
                  <p className="text-sm text-[#6B7280]">Pending payout</p>
                  <p className="mt-1 text-2xl font-bold text-[#0A6E5C]">€0.00</p>
                </div>
              </div>
              <h3 className="mt-6 font-medium text-[#1B2432]">Payout history</h3>
              <p className="mt-2 text-sm text-[#6B7280]">No payouts yet. Complete a booking to start earning.</p>
            </section>
          )}

          {tab === "messages" && (
            <section className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
              <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Messages</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Conversations with pet owners.</p>
              <div className="mt-6 flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E5E7EB] bg-[#F7F7F8] py-12 text-center">
                <MessageSquare className="h-12 w-12 text-[#6B7280]/50" />
                <p className="mt-3 text-sm text-[#6B7280]">No messages yet.</p>
                <p className="mt-1 text-sm text-[#6B7280]">When owners contact you, conversations will appear here.</p>
              </div>
            </section>
          )}
        </div>

        <p className="mt-8">
          <Link href="/" className="text-sm text-[#6B7280] hover:text-[#1B2432] hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
