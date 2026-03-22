"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdoptionListing } from "../../actions";
import type { CreateListingInput } from "../../adoption-listing-types";
import { LISTING_DESTINATION_COUNTRY_OPTIONS } from "@/lib/adoption/country-requirements";
import {
  ADOPTION_GOOD_WITH_TAGS,
  ADOPTION_NOT_GOOD_WITH_TAGS,
} from "@/lib/adoption/listing-compatibility-tags";
import { MAX_LISTING_PHOTOS } from "@/lib/adoption/listing-photos";

const SPECIES = ["Cat", "Dog", "Other"] as const;
const SEX = ["Male", "Female", "Unknown"] as const;
const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "application_pending", label: "Application Pending" },
  { value: "matched", label: "Matched" },
  { value: "in_transit", label: "In Transit" },
  { value: "adopted", label: "Adopted" },
] as const;

const emptyPhotoSlots = (): string[] => Array.from({ length: MAX_LISTING_PHOTOS }, () => "");

const emptyForm: CreateListingInput = {
  name: "",
  species: "Cat",
  breed: "",
  estimatedAge: "",
  sex: "Unknown",
  spayedNeutered: false,
  temperament: "",
  medicalHistory: "",
  specialNeeds: "",
  backstory: "",
  personality: "",
  idealHome: "",
  goodWith: [],
  notGoodWith: [],
  videoUrl: "",
  fosterLocation: "",
  localAdoptionFeeEur: undefined,
  internationalEligible: false,
  destinationCountries: [],
  photoUrls: emptyPhotoSlots(),
  status: "available",
};

type Props = {
  initial?: Partial<CreateListingInput>;
  listingId?: string;
  /** When provided, used instead of default admin create/update and redirect (e.g. rescue dashboard). */
  onCreate?: (input: CreateListingInput) => Promise<{ error?: string }>;
  onUpdate?: (id: string, input: CreateListingInput) => Promise<{ error?: string }>;
  successRedirect?: string;
};

export function AdoptionListingForm({ initial, listingId, onCreate, onUpdate, successRedirect }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateListingInput>({ ...emptyForm, ...initial });

  const update = <K extends keyof CreateListingInput>(key: K, value: CreateListingInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCountry = (country: string) => {
    setForm((prev) => {
      const next = prev.destinationCountries.includes(country)
        ? prev.destinationCountries.filter((c) => c !== country)
        : [...prev.destinationCountries, country];
      return { ...prev, destinationCountries: next };
    });
  };

  const toggleInList = (key: "goodWith" | "notGoodWith", tag: string) => {
    setForm((prev) => {
      const cur = prev[key];
      const next = cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag];
      return { ...prev, [key]: next };
    });
  };

  const setPhotoUrl = (index: number, value: string) => {
    const next = [...form.photoUrls];
    next[index] = value;
    update("photoUrls", next);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Animal name is required.");
      return;
    }
    setSubmitting(true);
    const isEdit = !!listingId;
    const result = isEdit
      ? (onUpdate ? await onUpdate(listingId, form) : await (await import("../../actions")).updateAdoptionListing(listingId, form))
      : (onCreate ? await onCreate(form) : await createAdoptionListing(form));
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Listing updated." : "Listing created.");
    router.push(successRedirect ?? "/dashboard/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <h2
          className="text-lg font-normal text-[#1B2432]"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          Basic info
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#1B2432]">
              Animal name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div>
            <label htmlFor="species" className="block text-sm font-medium text-[#1B2432]">
              Species
            </label>
            <select
              id="species"
              value={form.species}
              onChange={(e) => update("species", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            >
              {SPECIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-[#1B2432]">
              Breed (optional)
            </label>
            <input
              id="breed"
              type="text"
              value={form.breed ?? ""}
              onChange={(e) => update("breed", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div>
            <label htmlFor="estimatedAge" className="block text-sm font-medium text-[#1B2432]">
              Estimated age
            </label>
            <input
              id="estimatedAge"
              type="text"
              placeholder="e.g. 2 years, 6 months"
              value={form.estimatedAge ?? ""}
              onChange={(e) => update("estimatedAge", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-[#1B2432]">
              Sex
            </label>
            <select
              id="sex"
              value={form.sex ?? "Unknown"}
              onChange={(e) => update("sex", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            >
              {SEX.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-8">
            <input
              id="spayedNeutered"
              type="checkbox"
              checked={form.spayedNeutered}
              onChange={(e) => update("spayedNeutered", e.target.checked)}
              className="h-4 w-4 rounded border-[#0A6E5C]/30 text-[#0A6E5C] focus:ring-[#0A6E5C]"
            />
            <label htmlFor="spayedNeutered" className="text-sm font-medium text-[#1B2432]">
              Spayed / Neutered
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <h2
          className="text-lg font-normal text-[#1B2432]"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          Description & health
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="temperament" className="block text-sm font-medium text-[#1B2432]">
              Temperament
            </label>
            <textarea
              id="temperament"
              rows={3}
              placeholder="e.g. Friendly, loves cuddles, shy at first"
              value={form.temperament ?? ""}
              onChange={(e) => update("temperament", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div>
            <label htmlFor="medicalHistory" className="block text-sm font-medium text-[#1B2432]">
              Medical history
            </label>
            <textarea
              id="medicalHistory"
              rows={3}
              value={form.medicalHistory ?? ""}
              onChange={(e) => update("medicalHistory", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div>
            <label htmlFor="specialNeeds" className="block text-sm font-medium text-[#1B2432]">
              Special needs
            </label>
            <textarea
              id="specialNeeds"
              rows={2}
              value={form.specialNeeds ?? ""}
              onChange={(e) => update("specialNeeds", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <h2
          className="text-lg font-normal text-[#1B2432]"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          Story &amp; home fit
        </h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Richer profiles help adopters connect — these fields appear on the public animal page.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="backstory" className="block text-sm font-medium text-[#1B2432]">
              Backstory
            </label>
            <textarea
              id="backstory"
              rows={5}
              placeholder="How they came to the rescue, what we know about their past…"
              value={form.backstory ?? ""}
              onChange={(e) => update("backstory", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div>
            <label htmlFor="personality" className="block text-sm font-medium text-[#1B2432]">
              Personality &amp; quirks
            </label>
            <textarea
              id="personality"
              rows={4}
              placeholder="Day-to-day behaviour, habits, what makes them them"
              value={form.personality ?? ""}
              onChange={(e) => update("personality", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div>
            <label htmlFor="idealHome" className="block text-sm font-medium text-[#1B2432]">
              Ideal home
            </label>
            <textarea
              id="idealHome"
              rows={3}
              placeholder="What kind of household, routine, or adopter would suit them best"
              value={form.idealHome ?? ""}
              onChange={(e) => update("idealHome", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div>
            <label htmlFor="fosterLocation" className="block text-sm font-medium text-[#1B2432]">
              Foster location (optional)
            </label>
            <input
              id="fosterLocation"
              type="text"
              placeholder="e.g. Limassol foster home"
              value={form.fosterLocation ?? ""}
              onChange={(e) => update("fosterLocation", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-[#1B2432]">
              Video URL (optional)
            </label>
            <input
              id="videoUrl"
              type="url"
              placeholder="YouTube link or direct video URL"
              value={form.videoUrl ?? ""}
              onChange={(e) => update("videoUrl", e.target.value)}
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <h2
          className="text-lg font-normal text-[#1B2432]"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          Compatibility tags
        </h2>
        <div className="mt-4 space-y-6">
          <div>
            <span className="block text-sm font-medium text-[#1B2432]">Usually good with</span>
            <div className="mt-2 flex flex-wrap gap-3">
              {ADOPTION_GOOD_WITH_TAGS.map((tag) => (
                <label key={tag} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.goodWith.includes(tag)}
                    onChange={() => toggleInList("goodWith", tag)}
                    className="h-4 w-4 rounded border-[#0A6E5C]/30 text-[#0A6E5C] focus:ring-[#0A6E5C]"
                  />
                  <span className="text-sm text-[#1B2432]">{tag}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-[#1B2432]">May not suit</span>
            <div className="mt-2 flex flex-wrap gap-3">
              {ADOPTION_NOT_GOOD_WITH_TAGS.map((tag) => (
                <label key={tag} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.notGoodWith.includes(tag)}
                    onChange={() => toggleInList("notGoodWith", tag)}
                    className="h-4 w-4 rounded border-[#0A6E5C]/30 text-[#0A6E5C] focus:ring-[#0A6E5C]"
                  />
                  <span className="text-sm text-[#1B2432]">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <h2
          className="text-lg font-normal text-[#1B2432]"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          Adoption details
        </h2>
        <div className="mt-4 space-y-4">
          <div className="max-w-xs">
            <label htmlFor="localAdoptionFeeEur" className="block text-sm font-medium text-[#1B2432]">
              Local adoption fee (EUR)
            </label>
            <input
              id="localAdoptionFeeEur"
              type="number"
              min={0}
              step={0.01}
              value={form.localAdoptionFeeEur ?? ""}
              onChange={(e) =>
                update("localAdoptionFeeEur", e.target.value === "" ? undefined : Number(e.target.value))
              }
              className="mt-1.5 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="internationalEligible"
              type="checkbox"
              checked={form.internationalEligible}
              onChange={(e) => update("internationalEligible", e.target.checked)}
              className="h-4 w-4 rounded border-[#0A6E5C]/30 text-[#0A6E5C] focus:ring-[#0A6E5C]"
            />
            <label htmlFor="internationalEligible" className="text-sm font-medium text-[#1B2432]">
              International eligible
            </label>
          </div>
          {form.internationalEligible && (
            <div>
              <span className="block text-sm font-medium text-[#1B2432] mb-2">Destination countries</span>
              <div className="flex flex-wrap gap-3">
                {LISTING_DESTINATION_COUNTRY_OPTIONS.map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.destinationCountries.includes(c)}
                      onChange={() => toggleCountry(c)}
                      className="h-4 w-4 rounded border-[#0A6E5C]/30 text-[#0A6E5C] focus:ring-[#0A6E5C]"
                    />
                    <span className="text-sm text-[#1B2432]">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <h2
          className="text-lg font-normal text-[#1B2432]"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          Photos (URLs for now)
        </h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Up to {MAX_LISTING_PHOTOS} image URLs, shown as a gallery on the public profile. Real upload coming later.
        </p>
        <div className="mt-4 space-y-2">
          {Array.from({ length: MAX_LISTING_PHOTOS }, (_, i) => (
            <input
              key={i}
              type="url"
              placeholder={`Photo ${i + 1} URL`}
              value={form.photoUrls[i] ?? ""}
              onChange={(e) => setPhotoUrl(i, e.target.value)}
              className="w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
            />
          ))}
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-[#1B2432]">
            Status
          </label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="mt-1.5 w-full max-w-xs rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/dashboard/admin"
          className="text-sm font-semibold text-[#0A6E5C] hover:underline"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[999px] h-12 bg-[#0A6E5C] px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
        >
          {submitting ? "Saving…" : listingId ? "Update listing" : "Create listing"}
        </button>
      </div>
    </form>
  );
}
