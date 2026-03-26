import Link from "next/link";
import {
  adminListCampaigns,
  adminSetCampaignStatus,
  adminToggleCampaignFeatured,
} from "@/lib/campaign/admin-campaign-actions";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const campaigns = await adminListCampaigns();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-16 sm:px-6" style={{ maxWidth: "var(--max-width)" }}>
        <Link href="/dashboard/admin" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
          ← Admin dashboard
        </Link>
        <h1 className="mt-6 font-normal text-2xl" style={{ fontFamily: "var(--font-heading), serif" }}>
          Campaign oversight
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
          Pause, complete, or feature rescue fundraising campaigns. Edits to copy and milestones are done in the rescue dashboard.
        </p>

        <div className="mt-10 overflow-x-auto rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                <th className="px-4 py-3 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                  Campaign
                </th>
                <th className="px-4 py-3 font-semibold">Rescue</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Raised</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{c.slug}</p>
                    {c.featured ? (
                      <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "var(--color-secondary-muted-12)", color: "var(--color-secondary)" }}>
                        Featured
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/rescue/${c.rescueOrg.slug}`} className="hover:underline" style={{ color: "var(--color-primary)" }}>
                      {c.rescueOrg.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3 tabular-nums">
                    €{(c.raisedAmountCents / 100).toFixed(2)} · {c.donorCount} supporters
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <form
                        action={async (fd) => {
                          "use server";
                          const next = String(fd.get("status") ?? "");
                          await adminSetCampaignStatus(c.id, next);
                        }}
                        className="flex flex-wrap gap-1"
                      >
                        {(["active", "paused", "completed", "draft"] as const).map((s) => (
                          <button
                            key={s}
                            type="submit"
                            name="status"
                            value={s}
                            className="rounded border px-2 py-1 text-xs font-medium capitalize hover:opacity-90"
                            style={{ borderColor: "var(--color-border)", color: c.status === s ? "var(--color-primary)" : "var(--color-text-secondary)" }}
                          >
                            {s}
                          </button>
                        ))}
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await adminToggleCampaignFeatured(c.id, !c.featured);
                        }}
                      >
                        <button type="submit" className="text-xs font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                          {c.featured ? "Unfeature" : "Feature"}
                        </button>
                      </form>
                      <Link
                        href={`/rescue/${c.rescueOrg.slug}/campaign/${c.slug}`}
                        className="text-xs font-semibold hover:underline"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        View public page
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
