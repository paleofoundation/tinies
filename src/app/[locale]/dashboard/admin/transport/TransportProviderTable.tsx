"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteTransportProvider } from "../adoptions/actions";
import type { TransportProviderRow } from "../adoptions/placement-action-types";
import { TransportProviderForm } from "./TransportProviderForm";

type Props = {
  providers: TransportProviderRow[];
};

export function TransportProviderTable({ providers }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this transport provider?")) return;
    setDeletingId(id);
    const result = await deleteTransportProvider(id);
    setDeletingId(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Provider deleted.");
      router.refresh();
    }
  }

  const editing = editingId ? providers.find((p) => p.id === editingId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          Transport providers
        </h2>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {showForm ? "Cancel" : "Add provider"}
        </button>
      </div>

      {(showForm && !editingId) && (
        <TransportProviderForm
          onCancel={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {editing && (
        <TransportProviderForm
          provider={editing}
          onCancel={() => setEditingId(null)}
          onSuccess={() => setEditingId(null)}
        />
      )}

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>Name</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>Type</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>Countries</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>Contact</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>Rating</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>Active</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--color-text)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr
                key={p.id}
                className="border-b last:border-b-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                <td className="px-4 py-3" style={{ color: "var(--color-text)" }}>{p.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--color-text)" }}>{p.type}</td>
                <td className="px-4 py-3" style={{ color: "var(--color-text)" }}>
                  {p.countriesServed.length ? p.countriesServed.join(", ") : "—"}
                </td>
                <td className="max-w-[160px] truncate px-4 py-3" style={{ color: "var(--color-text)" }} title={p.contactInfo ?? ""}>
                  {p.contactInfo || "—"}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--color-text)" }}>
                  {p.rating != null ? p.rating : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: p.active ? "var(--color-success)" : "var(--color-border)",
                      color: p.active ? "white" : "var(--color-text-secondary)",
                    }}
                  >
                    {p.active ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(p.id);
                      }}
                      className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="text-sm font-medium text-[var(--color-error)] hover:underline disabled:opacity-50"
                    >
                      {deletingId === p.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {providers.length === 0 && (
          <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            No transport providers yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}
