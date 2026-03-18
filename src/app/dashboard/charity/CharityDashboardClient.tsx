"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  BarChart3,
  Gift,
  Users,
  Banknote,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  getCharityOverviewStats,
  getCharityDonations,
  getCharitySupportersCounts,
  getCharityPayouts,
  updateCharityProfile,
} from "@/lib/charity/actions";
import type { DonationRow, PayoutRow } from "@/lib/charity/actions";
import { toast } from "sonner";

type TabId = "overview" | "donations" | "supporters" | "payouts" | "profile";

const TABS: { id: TabId; label: string; icon: typeof Heart }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "donations", label: "Donation Activity", icon: Gift },
  { id: "supporters", label: "Supporters", icon: Users },
  { id: "payouts", label: "Payouts", icon: Banknote },
  { id: "profile", label: "Profile", icon: FileText },
];

function formatEur(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[parseInt(m ?? "1", 10) - 1] ?? m;
  return `${month} ${(y ?? "").slice(-2)}`;
}

type Charity = {
  id: string;
  name: string;
  slug: string;
  mission: string | null;
  logoUrl: string | null;
  photos: string[];
  howFundsUsed: string | null;
  annualUpdateText: string | null;
  website: string | null;
};

type OverviewStats = {
  totalReceivedCents: number;
  totalThisMonthCents: number;
  activeSupportersCount: number;
  nextPayoutCents: number | null;
  nextPayoutMonth: string | null;
  monthlyTrend: { month: string; cents: number }[];
};

export function CharityDashboardClient({
  charity: initialCharity,
  initialOverview,
  initialDonations,
  initialSupporters,
  initialPayouts,
}: {
  charity: Charity;
  initialOverview: OverviewStats;
  initialDonations: DonationRow[];
  initialSupporters: { roundUpDonors: number; oneTimeDonors: number; guardianSubscribers: number };
  initialPayouts: PayoutRow[];
}) {
  const [tab, setTab] = useState<TabId>("overview");
  const [charity, setCharity] = useState(initialCharity);
  const [overview, setOverview] = useState(initialOverview);
  const [donations, setDonations] = useState(initialDonations);
  const [supporters, setSupporters] = useState(initialSupporters);
  const [payouts, setPayouts] = useState(initialPayouts);
  const [donationSourceFilter, setDonationSourceFilter] = useState<string>("");
  const [donationFromDate, setDonationFromDate] = useState("");
  const [donationToDate, setDonationToDate] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: initialCharity.name,
    mission: initialCharity.mission ?? "",
    logoUrl: initialCharity.logoUrl ?? "",
    photos: (initialCharity.photos ?? []).join("\n"),
    howFundsUsed: initialCharity.howFundsUsed ?? "",
    annualUpdateText: initialCharity.annualUpdateText ?? "",
    website: initialCharity.website ?? "",
  });

  const filteredDonations = useMemo(() => {
    let list = donations;
    if (donationSourceFilter) {
      list = list.filter((d) => d.source === donationSourceFilter);
    }
    if (donationFromDate) {
      const from = new Date(donationFromDate).getTime();
      list = list.filter((d) => new Date(d.date).getTime() >= from);
    }
    if (donationToDate) {
      const to = new Date(donationToDate).getTime();
      list = list.filter((d) => new Date(d.date).getTime() <= to);
    }
    return list;
  }, [donations, donationSourceFilter, donationFromDate, donationToDate]);

  function handleExportCsv() {
    const headers = ["Date", "Amount (EUR)", "Source", "Donor"];
    const rows = filteredDonations.map((d) => [
      formatDate(d.date),
      (d.amountCents / 100).toFixed(2),
      d.source,
      d.donorFirstName ?? "Anonymous",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${charity.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    const photos = profileForm.photos
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const result = await updateCharityProfile({
      name: profileForm.name.trim(),
      mission: profileForm.mission.trim() || null,
      logoUrl: profileForm.logoUrl.trim() || null,
      photos,
      howFundsUsed: profileForm.howFundsUsed.trim() || null,
      annualUpdateText: profileForm.annualUpdateText.trim() || null,
      website: profileForm.website.trim() || null,
    });
    setProfileSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setCharity((prev) => ({
      ...prev,
      name: profileForm.name.trim(),
      mission: profileForm.mission.trim() || null,
      logoUrl: profileForm.logoUrl.trim() || null,
      photos,
      howFundsUsed: profileForm.howFundsUsed.trim() || null,
      annualUpdateText: profileForm.annualUpdateText.trim() || null,
      website: profileForm.website.trim() || null,
    }));
    toast.success("Profile updated.");
  }

  const maxTrendCents = Math.max(...overview.monthlyTrend.map((t) => t.cents), 1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-12 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}>
              {charity.name}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Thank you for the important work you do. Here’s your impact in real time.
            </p>
          </div>
          <Link
            href={`/giving/${charity.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            <ExternalLink className="h-4 w-4" />
            View public page
          </Link>
        </div>

        <div className="mt-8 border-b" style={{ borderColor: "var(--color-border)" }}>
          <nav className="flex gap-1 overflow-x-auto" aria-label="Dashboard sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === t.id ? "border-[var(--color-primary)]" : "border-transparent"
                }`}
                style={{ color: tab === t.id ? "var(--color-primary)" : "var(--color-text-secondary)" }}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          {tab === "overview" && (
            <section className="rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                Overview
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Total received (all time)</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{formatEur(overview.totalReceivedCents)}</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>This month</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--color-secondary)" }}>{formatEur(overview.totalThisMonthCents)}</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Active supporters</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--color-text)" }}>{overview.activeSupportersCount}</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Next expected payout</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                    {overview.nextPayoutCents != null ? formatEur(overview.nextPayoutCents) : "—"}
                  </p>
                  {overview.nextPayoutMonth && <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>{overview.nextPayoutMonth}</p>}
                </div>
              </div>
              <div className="mt-8">
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Monthly donations (last 12 months)</p>
                <div className="mt-4 flex items-end gap-1" style={{ minHeight: "120px" }}>
                  {overview.monthlyTrend.map((t) => (
                    <div key={t.month} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t transition-opacity hover:opacity-90"
                        style={{
                          height: `${Math.max(4, (t.cents / maxTrendCents) * 100)}px`,
                          backgroundColor: "var(--color-primary)",
                        }}
                        title={`${t.month}: ${formatEur(t.cents)}`}
                      />
                      <span className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>{formatMonthLabel(t.month)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "donations" && (
            <section className="rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                Donation Activity
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>All donations received. Export for your records.</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <select
                  value={donationSourceFilter}
                  onChange={(e) => setDonationSourceFilter(e.target.value)}
                  className="rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                >
                  <option value="">All sources</option>
                  <option value="Round-up">Round-up</option>
                  <option value="One-time">One-time</option>
                  <option value="Guardian subscription">Guardian subscription</option>
                  <option value="Giving Fund distribution">Giving Fund distribution</option>
                </select>
                <input
                  type="date"
                  value={donationFromDate}
                  onChange={(e) => setDonationFromDate(e.target.value)}
                  className="rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                />
                <input
                  type="date"
                  value={donationToDate}
                  onChange={(e) => setDonationToDate(e.target.value)}
                  className="rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                />
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                      <th className="pb-3 pr-4 text-left font-semibold" style={{ color: "var(--color-text)" }}>Date</th>
                      <th className="pb-3 pr-4 text-left font-semibold" style={{ color: "var(--color-text)" }}>Amount</th>
                      <th className="pb-3 pr-4 text-left font-semibold" style={{ color: "var(--color-text)" }}>Source</th>
                      <th className="pb-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>Donor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center" style={{ color: "var(--color-text-secondary)" }}>No donations in this period.</td>
                      </tr>
                    ) : (
                      filteredDonations.map((d) => (
                        <tr key={d.id} className="border-b" style={{ borderColor: "var(--color-border)" }}>
                          <td className="py-3 pr-4" style={{ color: "var(--color-text)" }}>{formatDate(d.date)}</td>
                          <td className="py-3 pr-4 font-medium" style={{ color: "var(--color-text)" }}>{formatEur(d.amountCents)}</td>
                          <td className="py-3 pr-4" style={{ color: "var(--color-text-secondary)" }}>{d.source}</td>
                          <td className="py-3" style={{ color: "var(--color-text-secondary)" }}>{d.donorFirstName ?? "Anonymous"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "supporters" && (
            <section className="rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                Supporters
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Aggregate counts. No personal data — we respect donor privacy.</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-[var(--radius-lg)] border p-6 text-center" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <Heart className="mx-auto h-10 w-10" style={{ color: "var(--color-primary)" }} />
                  <p className="mt-3 text-2xl font-bold" style={{ color: "var(--color-text)" }}>{supporters.roundUpDonors}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Round-up donors</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border p-6 text-center" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <Gift className="mx-auto h-10 w-10" style={{ color: "var(--color-secondary)" }} />
                  <p className="mt-3 text-2xl font-bold" style={{ color: "var(--color-text)" }}>{supporters.oneTimeDonors}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>One-time donors</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border p-6 text-center" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <Users className="mx-auto h-10 w-10" style={{ color: "var(--color-primary)" }} />
                  <p className="mt-3 text-2xl font-bold" style={{ color: "var(--color-text)" }}>{supporters.guardianSubscribers}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Guardian subscribers</p>
                </div>
              </div>
            </section>
          )}

          {tab === "payouts" && (
            <section className="rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                Payouts
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Monthly payouts from Tinies.</p>
              {payouts.length === 0 ? (
                <p className="mt-6" style={{ color: "var(--color-text-secondary)" }}>No payouts yet.</p>
              ) : (
                <ul className="mt-6 space-y-4">
                  {payouts.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                      <div>
                        <p className="font-medium" style={{ color: "var(--color-text)" }}>{p.month}</p>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{formatEur(p.amountCents)} · {p.status}</p>
                        {p.expectedBy && (p.status === "pending" || p.status === "processing") && (
                          <p className="mt-1 text-xs" style={{ color: "var(--color-primary)" }}>Expected by {p.expectedBy}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {tab === "profile" && (
            <section className="rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                Profile
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Edit your public charity page. Supporters see this on /giving/{charity.slug}.</p>
              <form onSubmit={handleSaveProfile} className="mt-6 max-w-xl space-y-4">
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Mission</label>
                  <textarea
                    value={profileForm.mission}
                    onChange={(e) => setProfileForm((p) => ({ ...p, mission: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Logo URL</label>
                  <input
                    type="url"
                    value={profileForm.logoUrl}
                    onChange={(e) => setProfileForm((p) => ({ ...p, logoUrl: e.target.value }))}
                    className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Photos (one URL per line)</label>
                  <textarea
                    value={profileForm.photos}
                    onChange={(e) => setProfileForm((p) => ({ ...p, photos: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>How funds are used</label>
                  <textarea
                    value={profileForm.howFundsUsed}
                    onChange={(e) => setProfileForm((p) => ({ ...p, howFundsUsed: e.target.value }))}
                    rows={4}
                    className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Annual update</label>
                  <textarea
                    value={profileForm.annualUpdateText}
                    onChange={(e) => setProfileForm((p) => ({ ...p, annualUpdateText: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Website</label>
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))}
                    className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                >
                  {profileSaving ? "Saving…" : "Save profile"}
                </button>
              </form>
              <div className="mt-8 rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Preview</p>
                <Link href={`/giving/${charity.slug}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                  View /giving/{charity.slug} <ExternalLink className="h-3 w-3" />
                </Link>
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
