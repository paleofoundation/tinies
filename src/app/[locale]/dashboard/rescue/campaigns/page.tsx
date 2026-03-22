import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMyCampaigns } from "@/lib/campaign/rescue-campaign-actions";

export const dynamic = "force-dynamic";

export default async function RescueCampaignsListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/rescue/campaigns");

  const { campaigns, error } = await listMyCampaigns();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-12 sm:px-6" style={{ maxWidth: "var(--max-width)" }}>
        <Link href="/dashboard/rescue" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
          ← Rescue dashboard
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-normal text-2xl" style={{ fontFamily: "var(--font-heading), serif" }}>
              Fundraising campaigns
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
              Create campaigns, post updates, and track supporters.
            </p>
          </div>
          <Link
            href="/dashboard/rescue/campaigns/new"
            className="inline-flex h-10 items-center rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            New campaign
          </Link>
        </div>

        {error ? (
          <p className="mt-8 text-sm" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        ) : campaigns.length === 0 ? (
          <p className="mt-8 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            No campaigns yet. Create one to raise funds for a specific goal.
          </p>
        ) : (
          <ul className="mt-10 space-y-4">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-3 rounded-[var(--radius-xl)] border p-5 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <div>
                  <p className="font-semibold" style={{ fontFamily: "var(--font-heading), serif" }}>
                    {c.title}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                    {c.status}
                    {c.featured ? " · Featured" : ""} · €{(c.raisedAmountCents / 100).toFixed(2)} raised · {c.donorCount} supporters
                  </p>
                </div>
                <Link
                  href={`/dashboard/rescue/campaigns/${c.id}/edit`}
                  className="inline-flex h-9 items-center justify-center rounded-[var(--radius-lg)] border px-4 text-sm font-semibold hover:bg-[var(--color-primary-50)]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
                >
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
