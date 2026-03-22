import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getRescueCampaignForEdit,
  getRescueCampaignSupporters,
} from "@/lib/campaign/rescue-campaign-actions";
import { parseCampaignMilestones } from "@/lib/campaign/campaign-types";
import { AppendUpdateForm, EditCampaignCoreForm, MilestoneActions, PublicCampaignLink } from "./EditCampaignForms";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const eur = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" });

export default async function EditRescueCampaignPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/rescue/campaigns/${id}/edit`);

  const { campaign, error, orgSlug } = await getRescueCampaignForEdit(id);
  if (error || !campaign || !orgSlug) notFound();

  const { rows: supporters } = await getRescueCampaignSupporters(id);
  const milestones = parseCampaignMilestones(campaign.milestones);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link href="/dashboard/rescue/campaigns" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
          ← All campaigns
        </Link>
        <h1 className="mt-6 font-normal text-2xl" style={{ fontFamily: "var(--font-heading), serif" }}>
          Edit campaign
        </h1>
        <PublicCampaignLink orgSlug={orgSlug} campaignSlug={campaign.slug} />

        <div className="mt-8 rounded-[var(--radius-xl)] border p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <EditCampaignCoreForm
            campaign={{
              id: campaign.id,
              slug: campaign.slug,
              title: campaign.title,
              subtitle: campaign.subtitle,
              description: campaign.description,
              coverPhotoUrl: campaign.coverPhotoUrl,
              goalAmountCents: campaign.goalAmountCents,
              status: campaign.status,
              featured: campaign.featured,
            }}
          />
          <MilestoneActions campaignId={campaign.id} milestones={milestones} />
          <AppendUpdateForm campaignId={campaign.id} />
        </div>

        <section className="mt-10">
          <h2 className="font-normal text-lg" style={{ fontFamily: "var(--font-heading), serif" }}>
            Recent supporters
          </h2>
          {supporters.length === 0 ? (
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              No donations yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              {supporters.map((s) => (
                <li key={s.id} className="flex justify-between gap-2 px-3 py-2 text-sm">
                  <span>{s.donorName ?? "Anonymous"}</span>
                  <span className="tabular-nums font-medium">{eur.format(s.amountCents / 100)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
