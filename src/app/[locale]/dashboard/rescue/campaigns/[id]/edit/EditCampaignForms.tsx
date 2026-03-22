"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  appendRescueCampaignUpdate,
  markRescueCampaignMilestone,
  updateRescueCampaign,
} from "@/lib/campaign/rescue-campaign-actions";
import type { CampaignMilestone } from "@/lib/campaign/campaign-types";

type CampaignRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  coverPhotoUrl: string | null;
  goalAmountCents: number | null;
  status: string;
  featured: boolean;
};

export function EditCampaignCoreForm({ campaign }: { campaign: CampaignRow }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const r = await updateRescueCampaign(campaign.id, fd);
    setPending(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Campaign updated.");
    router.refresh();
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input name="title" required defaultValue={campaign.title} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }} />
      </div>
      <div>
        <label className="block text-sm font-medium">Subtitle</label>
        <input name="subtitle" defaultValue={campaign.subtitle ?? ""} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }} />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea name="description" required rows={12} defaultValue={campaign.description} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }} />
      </div>
      <div>
        <label className="block text-sm font-medium">Cover image URL</label>
        <input name="coverPhotoUrl" type="url" defaultValue={campaign.coverPhotoUrl ?? ""} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }} />
      </div>
      <div>
        <label className="block text-sm font-medium">Goal (EUR, empty = open-ended)</label>
        <input
          name="goalAmountEur"
          defaultValue={campaign.goalAmountCents != null ? String(campaign.goalAmountCents / 100) : ""}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Status</label>
        <select name="status" defaultValue={campaign.status} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" value="true" defaultChecked={campaign.featured} />
        Featured on homepage / giving
      </label>
      <button type="submit" disabled={pending} className="h-10 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-6 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function AppendUpdateForm({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const r = await appendRescueCampaignUpdate(campaignId, fd);
    setPending(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Update posted.");
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-3 border-t pt-6" style={{ borderColor: "var(--color-border)" }}>
      <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading), serif" }}>
        Post an update
      </h3>
      <input type="date" name="updateDate" className="w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }} />
      <input name="updateTitle" placeholder="Title" required className="w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }} />
      <textarea name="updateText" placeholder="What happened?" required rows={4} className="w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }} />
      <input name="updatePhotoUrl" type="url" placeholder="Photo URL (optional)" className="w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }} />
      <button type="submit" disabled={pending} className="h-9 rounded-[var(--radius-lg)] border px-4 text-sm font-semibold" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
        {pending ? "Posting…" : "Publish update"}
      </button>
    </form>
  );
}

export function MilestoneActions({
  campaignId,
  milestones,
}: {
  campaignId: string;
  milestones: CampaignMilestone[];
}) {
  const router = useRouter();

  async function mark(i: number) {
    const r = await markRescueCampaignMilestone(campaignId, i);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Milestone marked reached.");
    router.refresh();
  }

  if (milestones.length === 0) return null;
  return (
    <div className="border-t pt-6" style={{ borderColor: "var(--color-border)" }}>
      <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading), serif" }}>
        Milestones
      </h3>
      <ul className="mt-3 space-y-2 text-sm">
        {milestones.map((m, i) => (
          <li key={`${m.title}-${i}`} className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-lg)] border px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
            <span style={{ color: m.reached ? "var(--color-text-muted)" : "var(--color-text)" }}>
              {m.reached ? "✓ " : ""}
              {m.title}
            </span>
            {!m.reached ? (
              <button type="button" onClick={() => void mark(i)} className="text-xs font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                Mark reached
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublicCampaignLink({ orgSlug, campaignSlug }: { orgSlug: string; campaignSlug: string }) {
  const href = `/rescue/${orgSlug}/campaign/${campaignSlug}`;
  return (
    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
      Public URL:{" "}
      <Link href={href} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
        {href}
      </Link>
    </p>
  );
}
