"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminInviteCharity } from "@/lib/charity/actions";
import { toast } from "sonner";

export function InviteCharityForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mission: "",
    contactName: "",
    contactEmail: "",
    logoUrl: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await adminInviteCharity({
      name: form.name.trim(),
      mission: form.mission.trim() || null,
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      logoUrl: form.logoUrl.trim() || null,
    });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Invite sent. The contact will receive an email with a link to set up their account.");
    router.push("/dashboard/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-4 rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Charity name *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Mission</label>
        <textarea
          value={form.mission}
          onChange={(e) => setForm((p) => ({ ...p, mission: e.target.value }))}
          rows={3}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Contact person name</label>
        <input
          type="text"
          value={form.contactName}
          onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Contact email *</label>
        <input
          type="email"
          required
          value={form.contactEmail}
          onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>Logo URL</label>
        <input
          type="url"
          value={form.logoUrl}
          onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
      >
        {saving ? "Sending…" : "Send invite"}
      </button>
    </form>
  );
}
