"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createRescueCampaign } from "@/lib/campaign/rescue-campaign-actions";

export function NewCampaignForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const r = await createRescueCampaign(fd);
    setPending(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Campaign created.");
    router.push("/dashboard/rescue/campaigns");
    router.refresh();
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="mt-8 space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Title
        </label>
        <input id="title" name="title" required className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm" style={{ borderColor: "var(--color-border)" }} />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          URL slug (optional, auto from title)
        </label>
        <input id="slug" name="slug" className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm" style={{ borderColor: "var(--color-border)" }} placeholder="safe-land-for-cats" />
      </div>
      <div>
        <label htmlFor="subtitle" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Subtitle
        </label>
        <input id="subtitle" name="subtitle" className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm" style={{ borderColor: "var(--color-border)" }} />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Full story (markdown-friendly plain text)
        </label>
        <textarea id="description" name="description" required rows={10} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm" style={{ borderColor: "var(--color-border)" }} />
      </div>
      <div>
        <label htmlFor="coverPhotoUrl" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Cover image URL
        </label>
        <input id="coverPhotoUrl" name="coverPhotoUrl" type="url" className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm" style={{ borderColor: "var(--color-border)" }} />
      </div>
      <div>
        <label htmlFor="goalAmountEur" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Goal (EUR, leave empty for open-ended)
        </label>
        <input id="goalAmountEur" name="goalAmountEur" type="text" className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm" style={{ borderColor: "var(--color-border)" }} placeholder="50000" />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Status
        </label>
        <select id="status" name="status" className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm" style={{ borderColor: "var(--color-border)" }}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <input type="checkbox" name="featured" value="true" />
        Feature on homepage / giving (admin may also toggle)
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Create campaign"}
      </button>
      <p className="text-center text-sm">
        <Link href="/dashboard/rescue/campaigns" className="hover:underline" style={{ color: "var(--color-primary)" }}>
          Cancel
        </Link>
      </p>
    </form>
  );
}
