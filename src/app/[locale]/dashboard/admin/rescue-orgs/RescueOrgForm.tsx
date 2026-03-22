"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRescueOrg, updateRescueOrg } from "../rescue-org-actions";
import {
  RescueOrgShowcaseFields,
  type RescueOrgShowcaseInitial,
} from "@/components/rescue/RescueOrgShowcaseFields";

const inputClass =
  "mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
const labelClass = "block text-sm font-medium";
const boxStyle = {
  backgroundColor: "var(--color-background)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
} as const;

type SocialShape = { instagram?: string; facebook?: string };

type Props = {
  mode: "create" | "edit";
  orgId?: string;
  initial?: {
    name: string;
    mission: string | null;
    location: string | null;
    charityRegistration: string | null;
    website: string | null;
    logoUrl: string | null;
    bankIban: string | null;
    socialLinks: unknown;
    verified: boolean;
    accountEmail: string;
    description: string | null;
    foundedYear: number | null;
    teamMembers: RescueOrgShowcaseInitial["teamMembers"];
    facilityPhotos: string[];
    facilityVideoUrl: string | null;
    operatingHours: string | null;
    volunteerInfo: string | null;
    donationNeeds: string | null;
    totalAnimalsRescued: number | null;
    totalAnimalsAdopted: number | null;
    contactPhone: string | null;
    publicContactEmail: string | null;
    district: string | null;
    coverPhotoUrl: string | null;
  };
};

export function RescueOrgForm({ mode, orgId, initial }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const emptyShowcase: RescueOrgShowcaseInitial = {
    description: null,
    foundedYear: null,
    teamMembers: [],
    facilityPhotos: [],
    facilityVideoUrl: null,
    operatingHours: null,
    volunteerInfo: null,
    donationNeeds: null,
    totalAnimalsRescued: null,
    totalAnimalsAdopted: null,
    contactPhone: null,
    publicContactEmail: null,
    district: null,
    coverPhotoUrl: null,
  };

  const showcaseInitial: RescueOrgShowcaseInitial = initial
    ? {
        description: initial.description,
        foundedYear: initial.foundedYear,
        teamMembers: initial.teamMembers,
        facilityPhotos: initial.facilityPhotos,
        facilityVideoUrl: initial.facilityVideoUrl,
        operatingHours: initial.operatingHours,
        volunteerInfo: initial.volunteerInfo,
        donationNeeds: initial.donationNeeds,
        totalAnimalsRescued: initial.totalAnimalsRescued,
        totalAnimalsAdopted: initial.totalAnimalsAdopted,
        contactPhone: initial.contactPhone,
        publicContactEmail: initial.publicContactEmail,
        district: initial.district,
        coverPhotoUrl: initial.coverPhotoUrl,
      }
    : emptyShowcase;

  const social = (initial?.socialLinks && typeof initial.socialLinks === "object"
    ? (initial.socialLinks as SocialShape)
    : {}) as SocialShape;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (mode === "create") {
        const result = await createRescueOrg(formData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Rescue organisation created.");
          router.push("/dashboard/admin");
          router.refresh();
        }
      } else if (orgId) {
        const result = await updateRescueOrg(orgId, formData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Rescue organisation updated.");
          router.push("/dashboard/admin");
          router.refresh();
        }
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 max-w-2xl space-y-6 rounded-[var(--radius-lg)] border p-8"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div>
        <label htmlFor="name" className={labelClass} style={{ color: "var(--color-text)" }}>
          Organisation name <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initial?.name}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div>
        <label htmlFor="mission" className={labelClass} style={{ color: "var(--color-text)" }}>
          Mission statement (max 500 characters)
        </label>
        <textarea
          id="mission"
          name="mission"
          rows={4}
          maxLength={500}
          defaultValue={initial?.mission ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div>
        <label htmlFor="location" className={labelClass} style={{ color: "var(--color-text)" }}>
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="e.g. Limassol, Cyprus"
          defaultValue={initial?.location ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div>
        <label htmlFor="charityRegistration" className={labelClass} style={{ color: "var(--color-text)" }}>
          Charity registration number
        </label>
        <input
          id="charityRegistration"
          name="charityRegistration"
          type="text"
          defaultValue={initial?.charityRegistration ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div>
        <label htmlFor="website" className={labelClass} style={{ color: "var(--color-text)" }}>
          Website URL
        </label>
        <input
          id="website"
          name="website"
          type="url"
          defaultValue={initial?.website ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="instagram" className={labelClass} style={{ color: "var(--color-text)" }}>
            Instagram
          </label>
          <input
            id="instagram"
            name="instagram"
            type="text"
            placeholder="Profile URL or handle"
            defaultValue={social.instagram ?? ""}
            className={inputClass}
            style={boxStyle}
          />
        </div>
        <div>
          <label htmlFor="facebook" className={labelClass} style={{ color: "var(--color-text)" }}>
            Facebook
          </label>
          <input
            id="facebook"
            name="facebook"
            type="text"
            placeholder="Page URL"
            defaultValue={social.facebook ?? ""}
            className={inputClass}
            style={boxStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="logoUrl" className={labelClass} style={{ color: "var(--color-text)" }}>
          Logo URL
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          defaultValue={initial?.logoUrl ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div>
        <label htmlFor="loginEmail" className={labelClass} style={{ color: "var(--color-text)" }}>
          Account (login) email <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <input
          id="loginEmail"
          name="loginEmail"
          type="email"
          required={mode === "create"}
          readOnly={mode === "edit"}
          defaultValue={initial?.accountEmail}
          className={inputClass}
          style={{
            ...boxStyle,
            ...(mode === "edit" ? { opacity: 0.85 } : {}),
          }}
        />
        {mode === "edit" && (
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Login identity. To change it, contact engineering.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bankIban" className={labelClass} style={{ color: "var(--color-text)" }}>
          Bank IBAN (for future payouts)
        </label>
        <input
          id="bankIban"
          name="bankIban"
          type="text"
          autoComplete="off"
          defaultValue={initial?.bankIban ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <RescueOrgShowcaseFields
        orgId={mode === "edit" && orgId ? orgId : null}
        allowPhotoUpload={mode === "edit"}
        initial={showcaseInitial}
      />

      {mode === "edit" && (
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)" }}>
          <input
            id="verified"
            name="verified"
            type="checkbox"
            value="true"
            defaultChecked={initial?.verified}
            className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
          />
          <label htmlFor="verified" className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Verified organisation (visible as verified on the platform when implemented)
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-[var(--radius-pill)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          {pending ? "Saving…" : mode === "create" ? "Create rescue organisation" : "Save changes"}
        </button>
        <Link
          href="/dashboard/admin"
          className="inline-flex h-11 items-center rounded-[var(--radius-pill)] border px-6 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body), sans-serif",
          }}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
