"use client";

import { useActionState } from "react";
import { useState } from "react";
import { submitAdoptionApplication } from "../actions";
import { COUNTRY_VALUES, LIVING_SITUATION_VALUES } from "@/lib/validations/adoption-application";

const COUNTRY_BANNERS: Record<string, string> = {
  UK: "Note: Adopting to the UK requires a rabies titer test (blood drawn 30+ days after vaccination). This adds 2–3 weeks to the timeline.",
  Germany:
    "Note: Some German states restrict certain breeds (Pitbull, Staffordshire Terrier, Bull Terrier). Please check your local regulations.",
  Netherlands:
    "Note: High-risk dog breeds may require a behavior test in the Netherlands.",
  Sweden:
    "Note: Dogs and cats entering Sweden must be treated for Echinococcus tapeworm 24–120 hours before entry.",
};

type Props = {
  listingSlug: string;
};

export function AdoptionApplicationForm({ listingSlug }: Props) {
  const [country, setCountry] = useState("");
  const [state, formAction, isPending] = useActionState(submitAdoptionApplication, null);

  const banner = country ? COUNTRY_BANNERS[country] : null;
  const error = state?.error ?? null;

  return (
    <form
      action={formAction}
      className="mt-10 space-y-6"
      style={{ maxWidth: "36rem" }}
    >
      <input type="hidden" name="listingSlug" value={listingSlug} readOnly />

      <div>
        <label htmlFor="country" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Country you&apos;re adopting to <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <select
          id="country"
          name="country"
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          <option value="">Select country</option>
          {COUNTRY_VALUES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {banner && (
        <div
          className="rounded-[var(--radius-lg)] border px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--color-primary-50)", borderColor: "var(--color-primary-200)", color: "var(--color-text)" }}
          role="status"
        >
          {banner}
        </div>
      )}

      <div>
        <label htmlFor="city" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          City <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <input
          id="city"
          name="city"
          type="text"
          required
          maxLength={120}
          placeholder="e.g. London"
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>

      <div>
        <label htmlFor="livingSituation" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Living situation <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <select
          id="livingSituation"
          name="livingSituation"
          required
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          <option value="">Select</option>
          {LIVING_SITUATION_VALUES.map((v) => (
            <option key={v} value={v}>
              {v === "house" ? "House" : v === "apartment" ? "Apartment" : "Other"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Do you have a garden or outdoor space?
        </label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <input type="radio" name="hasGarden" value="yes" className="rounded-full" />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <input type="radio" name="hasGarden" value="no" className="rounded-full" />
            No
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="otherPets" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Other pets in the home
        </label>
        <textarea
          id="otherPets"
          name="otherPets"
          rows={3}
          maxLength={2000}
          placeholder="e.g. One dog, two cats"
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>

      <div>
        <label htmlFor="childrenAges" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Children&apos;s ages (if any)
        </label>
        <input
          id="childrenAges"
          name="childrenAges"
          type="text"
          maxLength={200}
          placeholder="e.g. 5 and 8"
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>

      <div>
        <label htmlFor="experience" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Experience with animals
        </label>
        <textarea
          id="experience"
          name="experience"
          rows={3}
          maxLength={2000}
          placeholder="Tell the rescue a bit about your experience with pets"
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Why do you want to adopt this animal?
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={2000}
          placeholder="A few words about why you&apos;re applying"
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>

      <div>
        <label htmlFor="vetReference" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Vet reference (optional)
        </label>
        <input
          id="vetReference"
          name="vetReference"
          type="text"
          maxLength={200}
          placeholder="Vet name or practice"
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity disabled:opacity-70 hover:opacity-90"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {isPending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
