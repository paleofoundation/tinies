"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createTransportProvider,
  updateTransportProvider,
  type TransportProviderRow,
  type TransportProviderInput,
} from "../adoptions/actions";

const TYPES = [
  { value: "courier", label: "Courier" },
  { value: "cargo", label: "Cargo" },
  { value: "volunteer", label: "Volunteer" },
];

type Props = {
  provider?: TransportProviderRow | null;
  onCancel: () => void;
  onSuccess: () => void;
};

export function TransportProviderForm({ provider, onCancel, onSuccess }: Props) {
  const router = useRouter();
  const isEdit = !!provider;
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(provider?.name ?? "");
  const [type, setType] = useState(provider?.type ?? "courier");
  const [countriesServedStr, setCountriesServedStr] = useState(
    (provider?.countriesServed ?? []).join(", ")
  );
  const [contactInfo, setContactInfo] = useState(provider?.contactInfo ?? "");
  const [pricingNotes, setPricingNotes] = useState(provider?.pricingNotes ?? "");
  const [rating, setRating] = useState(provider?.rating != null ? String(provider.rating) : "");
  const [active, setActive] = useState(provider?.active ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const countriesServed = countriesServedStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const data: TransportProviderInput = {
      name: name.trim(),
      type,
      countriesServed,
      contactInfo: contactInfo.trim() || null,
      pricingNotes: pricingNotes.trim() || null,
      rating: rating === "" ? null : parseFloat(rating),
      active,
    };
    if (!data.name) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateTransportProvider(provider!.id, data)
      : await createTransportProvider(data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(isEdit ? "Provider updated." : "Provider created.");
      router.refresh();
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
        {isEdit ? "Edit transport provider" : "Add transport provider"}
      </h3>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Countries served (comma-separated)</label>
        <input
          type="text"
          value={countriesServedStr}
          onChange={(e) => setCountriesServedStr(e.target.value)}
          placeholder="e.g. UK, Germany, Netherlands"
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Contact info</label>
        <input
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Pricing notes</label>
        <textarea
          value={pricingNotes}
          onChange={(e) => setPricingNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Rating</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="0–5"
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)]"
        />
        <span className="text-sm" style={{ color: "var(--color-text)" }}>Active</span>
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[var(--radius-lg)] border px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
