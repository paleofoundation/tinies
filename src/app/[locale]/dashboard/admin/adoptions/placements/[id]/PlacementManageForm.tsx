"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { advancePlacementStatus, updatePlacement } from "../../actions";
import type { PlacementDetail, TransportProviderRow } from "../../placement-action-types";
import { PlacementStatus } from "@prisma/client";
import { approveAdoptionSuccessStory } from "@/lib/adoption/success-stories-actions";

const PLACEMENT_STATUS_ORDER: PlacementStatus[] = [
  "preparing",
  "vet_complete",
  "transport_booked",
  "in_transit",
  "delivered",
  "follow_up",
  "completed",
];

const STATUS_LABELS: Record<string, string> = {
  preparing: "Preparing",
  vet_complete: "Vet complete",
  transport_booked: "Transport booked",
  in_transit: "In transit",
  delivered: "Delivered",
  follow_up: "Follow-up",
  completed: "Completed",
};

const TRANSPORT_METHODS = [
  { value: "", label: "—" },
  { value: "courier", label: "Courier" },
  { value: "cargo", label: "Cargo" },
  { value: "volunteer", label: "Volunteer" },
];

type VetPrepStatus = {
  healthCheck?: boolean;
  vaccinations?: boolean;
  microchip?: boolean;
  spayNeuter?: boolean;
  rabiesTiter?: boolean;
  documentPetPassport?: string;
  documentTiter?: string;
};

function toVetPrepStatus(raw: unknown): VetPrepStatus {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    return {
      healthCheck: !!o.healthCheck,
      vaccinations: !!o.vaccinations,
      microchip: !!o.microchip,
      spayNeuter: !!o.spayNeuter,
      rabiesTiter: !!o.rabiesTiter,
      documentPetPassport: typeof o.documentPetPassport === "string" ? o.documentPetPassport : "",
      documentTiter: typeof o.documentTiter === "string" ? o.documentTiter : "",
    };
  }
  return {};
}

type Props = {
  placement: PlacementDetail;
  transportProviders: TransportProviderRow[];
};

export function PlacementManageForm({ placement, transportProviders }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [vetPrep, setVetPrep] = useState<VetPrepStatus>(toVetPrepStatus(placement.vetPrepStatus));
  const [transportMethod, setTransportMethod] = useState(placement.transportMethod ?? "");
  const [transportProviderId, setTransportProviderId] = useState(placement.transportProviderId ?? "");
  const [transportBookedDate, setTransportBookedDate] = useState(
    placement.transportBookedDate ? new Date(placement.transportBookedDate).toISOString().slice(0, 10) : ""
  );
  const [departureDate, setDepartureDate] = useState(
    placement.departureDate ? new Date(placement.departureDate).toISOString().slice(0, 10) : ""
  );
  const [arrivalDate, setArrivalDate] = useState(
    placement.arrivalDate ? new Date(placement.arrivalDate).toISOString().slice(0, 10) : ""
  );
  const [vetCostEur, setVetCostEur] = useState(
    placement.vetCost != null ? (placement.vetCost / 100).toFixed(2) : ""
  );
  const [transportCostEur, setTransportCostEur] = useState(
    placement.transportCost != null ? (placement.transportCost / 100).toFixed(2) : ""
  );
  const [coordinationFeeEur, setCoordinationFeeEur] = useState(
    placement.coordinationFee != null ? (placement.coordinationFee / 100).toFixed(2) : ""
  );

  const currentStatusIndex = PLACEMENT_STATUS_ORDER.indexOf(placement.status as PlacementStatus);
  const totalCents =
    (vetCostEur ? Math.round(parseFloat(vetCostEur) * 100) : 0) +
    (transportCostEur ? Math.round(parseFloat(transportCostEur) * 100) : 0) +
    (coordinationFeeEur ? Math.round(parseFloat(coordinationFeeEur) * 100) : 0);

  async function handleSaveSection(section: "vetPrep" | "transport" | "fees") {
    setSaving(true);
    const payload: Parameters<typeof updatePlacement>[1] = {};
    if (section === "vetPrep") {
      payload.vetPrepStatus = vetPrep;
    }
    if (section === "transport") {
      payload.transportMethod = transportMethod || null;
      payload.transportProviderId = transportProviderId || null;
      payload.transportBookedDate = transportBookedDate || null;
      payload.departureDate = departureDate || null;
      payload.arrivalDate = arrivalDate || null;
    }
    if (section === "fees") {
      payload.vetCost = vetCostEur ? parseFloat(vetCostEur) : null;
      payload.transportCost = transportCostEur ? parseFloat(transportCostEur) : null;
      payload.coordinationFee = coordinationFeeEur ? parseFloat(coordinationFeeEur) : null;
    }
    const result = await updatePlacement(placement.id, payload);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Saved.");
      router.refresh();
    }
  }

  async function handleAdvanceStatus(nextStatus: PlacementStatus) {
    setSaving(true);
    const result = await advancePlacementStatus(placement.id, nextStatus);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`Status updated to ${STATUS_LABELS[nextStatus]}.`);
      router.refresh();
    }
  }

  async function handleApproveStory() {
    setSaving(true);
    const result = await approveAdoptionSuccessStory(placement.id);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Story approved for the public gallery.");
      router.refresh();
    }
  }

  const nextStatusButton =
    currentStatusIndex >= 0 && currentStatusIndex < PLACEMENT_STATUS_ORDER.length - 1
      ? PLACEMENT_STATUS_ORDER[currentStatusIndex + 1]
      : null;

  return (
    <div className="mt-8 space-y-8">
      {/* Vet prep checklist */}
      <section className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Vet preparation</h3>
        <div className="mt-4 space-y-3">
          {(["healthCheck", "vaccinations", "microchip", "spayNeuter", "rabiesTiter"] as const).map((key) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!vetPrep[key]}
                onChange={(e) => setVetPrep((p) => ({ ...p, [key]: e.target.checked }))}
                className="h-4 w-4 rounded border-[var(--color-border)]"
              />
              <span style={{ color: "var(--color-text)" }}>
                {key === "healthCheck" ? "Health check" : key === "spayNeuter" ? "Spay/neuter" : key === "rabiesTiter" ? "Rabies titer test" : key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Document: Pet passport URL</label>
            <input
              type="text"
              value={vetPrep.documentPetPassport ?? ""}
              onChange={(e) => setVetPrep((p) => ({ ...p, documentPetPassport: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Document: Titer test URL</label>
            <input
              type="text"
              value={vetPrep.documentTiter ?? ""}
              onChange={(e) => setVetPrep((p) => ({ ...p, documentTiter: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleSaveSection("vetPrep")}
          disabled={saving}
          className="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Save vet prep
        </button>
      </section>

      {/* Transport */}
      <section className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Transport</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Method</label>
            <select
              value={transportMethod}
              onChange={(e) => setTransportMethod(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              {TRANSPORT_METHODS.map((o) => (
                <option key={o.value || "none"} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Provider</label>
            <select
              value={transportProviderId}
              onChange={(e) => setTransportProviderId(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              <option value="">—</option>
              {transportProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type}){!p.active ? " — inactive" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Transport booked date</label>
              <input
                type="date"
                value={transportBookedDate}
                onChange={(e) => setTransportBookedDate(e.target.value)}
                className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Departure date</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Arrival date</label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleSaveSection("transport")}
          disabled={saving}
          className="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Save transport
        </button>
      </section>

      {/* Fee breakdown */}
      <section className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Fee breakdown (EUR)</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Vet cost</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={vetCostEur}
              onChange={(e) => setVetCostEur(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Transport cost</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={transportCostEur}
              onChange={(e) => setTransportCostEur(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Coordination fee</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={coordinationFeeEur}
              onChange={(e) => setCoordinationFeeEur(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            />
          </div>
        </div>
        <p className="mt-3 font-semibold" style={{ color: "var(--color-text)" }}>
          Total: €{(totalCents / 100).toFixed(2)}
        </p>
        <button
          type="button"
          onClick={() => handleSaveSection("fees")}
          disabled={saving}
          className="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Save fees
        </button>
      </section>

      {/* Status progression */}
      <section className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Status</h3>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Current: {STATUS_LABELS[placement.status] ?? placement.status}
        </p>
        {nextStatusButton && (
          <div className="mt-4 flex flex-wrap gap-2">
            {nextStatusButton === "vet_complete" && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus("vet_complete")}
                disabled={saving}
                className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Mark Vet Complete
              </button>
            )}
            {nextStatusButton === "transport_booked" && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus("transport_booked")}
                disabled={saving}
                className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Mark Transport Booked
              </button>
            )}
            {nextStatusButton === "in_transit" && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus("in_transit")}
                disabled={saving}
                className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Mark Departed
              </button>
            )}
            {nextStatusButton === "delivered" && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus("delivered")}
                disabled={saving}
                className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Mark Delivered
              </button>
            )}
            {nextStatusButton === "follow_up" && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus("follow_up")}
                disabled={saving}
                className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Start Follow-Up
              </button>
            )}
            {nextStatusButton === "completed" && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus("completed")}
                disabled={saving}
                className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Mark placement complete
              </button>
            )}
          </div>
        )}
      </section>

      {/* Tinies Who Made It */}
      <section className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Tinies Who Made It</h3>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Adopter-submitted success stories appear on <span className="font-medium">/adopt/tinies-who-made-it</span> after approval.
        </p>
        {(() => {
          const hasContent =
            (placement.successStoryText?.trim().length ?? 0) > 0 || placement.successStoryPhotos.length > 0;
          if (!hasContent) {
            return (
              <p className="mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                No story submitted yet. Adopters receive check-in emails with a link to share an update.
              </p>
            );
          }
          return (
            <div className="mt-4 space-y-4">
              {placement.successStoryText ? (
                <blockquote className="border-l-2 pl-3 text-sm italic leading-relaxed" style={{ borderColor: "var(--color-primary)", color: "var(--color-text)" }}>
                  &ldquo;{placement.successStoryText.trim()}&rdquo;
                </blockquote>
              ) : null}
              {placement.successStoryPhotos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {placement.successStoryPhotos.map((url) => (
                    <div key={url} className="relative h-24 w-24 overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
                      <Image src={url} alt="Success story" fill className="object-cover" sizes="96px" />
                    </div>
                  ))}
                </div>
              ) : null}
              {placement.successStoryApprovedAt ? (
                <p className="text-sm font-medium" style={{ color: "#16A34A" }}>
                  Approved for gallery · {new Date(placement.successStoryApprovedAt).toLocaleString("en-GB")}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleApproveStory()}
                  disabled={saving}
                  className="rounded-[var(--radius-lg)] bg-[var(--color-secondary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  Approve for public gallery
                </button>
              )}
            </div>
          );
        })()}
      </section>
    </div>
  );
}
