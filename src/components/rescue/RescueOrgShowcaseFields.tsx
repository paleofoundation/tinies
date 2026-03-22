"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadRescueOrgPhoto } from "@/lib/rescue/rescue-org-photo-upload";
import {
  CYPRUS_DISTRICT_OPTIONS,
  DESCRIPTION_MAX,
  MAX_FACILITY_PHOTOS,
  type ParsedRescueTeamMember,
} from "@/lib/validations/rescue-org-showcase";

export type RescueOrgShowcaseInitial = {
  description: string | null;
  foundedYear: number | null;
  teamMembers: ParsedRescueTeamMember[];
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

type TeamRow = {
  name: string;
  role: string;
  photo: string;
  bio: string;
};

function toRows(members: ParsedRescueTeamMember[]): TeamRow[] {
  if (members.length === 0) return [{ name: "", role: "", photo: "", bio: "" }];
  return members.map((m) => ({
    name: m.name,
    role: m.role,
    photo: m.photo ?? "",
    bio: m.bio ?? "",
  }));
}

function rowsToPayload(rows: TeamRow[]): ParsedRescueTeamMember[] {
  return rows
    .filter((r) => r.name.trim() && r.role.trim())
    .map((r) => ({
      name: r.name.trim(),
      role: r.role.trim(),
      ...(r.photo.trim() ? { photo: r.photo.trim() } : {}),
      ...(r.bio.trim() ? { bio: r.bio.trim() } : {}),
    }));
}

type Props = {
  orgId: string | null;
  allowPhotoUpload: boolean;
  initial: RescueOrgShowcaseInitial;
};

const labelClass = "block text-sm font-medium";
const inputClass =
  "mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
const boxStyle = {
  backgroundColor: "var(--color-background)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
} as const;

export function RescueOrgShowcaseFields({ orgId, allowPhotoUpload, initial }: Props) {
  const [teamRows, setTeamRows] = useState<TeamRow[]>(() => toRows(initial.teamMembers));
  const [facilityUrls, setFacilityUrls] = useState<string[]>(() =>
    [...initial.facilityPhotos].slice(0, MAX_FACILITY_PHOTOS)
  );
  const [coverUrl, setCoverUrl] = useState(initial.coverPhotoUrl ?? "");
  const [uploadingFacility, setUploadingFacility] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const teamJson = JSON.stringify(rowsToPayload(teamRows));

  async function onFacilityFile(file: File | null) {
    if (!file || !orgId) return;
    if (facilityUrls.length >= MAX_FACILITY_PHOTOS) {
      toast.error(`Maximum ${MAX_FACILITY_PHOTOS} facility photos.`);
      return;
    }
    setUploadingFacility(true);
    const res = await uploadRescueOrgPhoto(orgId, file);
    setUploadingFacility(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.url) {
      setFacilityUrls((prev) => [...prev, res.url!].slice(0, MAX_FACILITY_PHOTOS));
      toast.success("Photo added.");
    }
  }

  async function onCoverFile(file: File | null) {
    if (!file || !orgId) return;
    setUploadingCover(true);
    const res = await uploadRescueOrgPhoto(orgId, file);
    setUploadingCover(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.url) {
      setCoverUrl(res.url);
      toast.success("Cover image updated.");
    }
  }

  return (
    <div className="space-y-8 border-t pt-8" style={{ borderColor: "var(--color-border)" }}>
      <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
        Public profile showcase
      </h2>
      <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
        These details appear on your public Tinies page at{" "}
        <span style={{ color: "var(--color-text-secondary)" }}>/rescue/your-slug</span> once verified.
      </p>

      <input type="hidden" name="teamMembersJson" value={teamJson} readOnly aria-hidden />
      {allowPhotoUpload && orgId ? (
        <input type="hidden" name="facilityPhotosJson" value={JSON.stringify(facilityUrls)} readOnly aria-hidden />
      ) : null}

      <div>
        <label htmlFor="description" className={labelClass} style={{ color: "var(--color-text)" }}>
          About (detailed) — max {DESCRIPTION_MAX} characters
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          maxLength={DESCRIPTION_MAX}
          defaultValue={initial.description ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="foundedYear" className={labelClass} style={{ color: "var(--color-text)" }}>
            Founded year
          </label>
          <input
            id="foundedYear"
            name="foundedYear"
            type="number"
            min={1800}
            max={2100}
            placeholder="e.g. 2023"
            defaultValue={initial.foundedYear ?? ""}
            className={inputClass}
            style={boxStyle}
          />
        </div>
        <div>
          <label htmlFor="district" className={labelClass} style={{ color: "var(--color-text)" }}>
            District (Cyprus)
          </label>
          <select
            id="district"
            name="district"
            defaultValue={initial.district ?? ""}
            className={inputClass}
            style={boxStyle}
          >
            <option value="">—</option>
            {CYPRUS_DISTRICT_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="coverPhotoUrl" className={labelClass} style={{ color: "var(--color-text)" }}>
          Cover / hero image URL
        </label>
        <input
          id="coverPhotoUrl"
          name="coverPhotoUrl"
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
          style={boxStyle}
        />
        {allowPhotoUpload && orgId ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
              <Upload className="h-4 w-4" aria-hidden />
              {uploadingCover ? "Uploading…" : "Upload cover"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploadingCover}
                onChange={(e) => void onCoverFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        ) : null}
      </div>

      <div>
        <p className={labelClass} style={{ color: "var(--color-text)" }}>
          Facility photos (max {MAX_FACILITY_PHOTOS})
        </p>
        {allowPhotoUpload && orgId ? (
          <>
            {facilityUrls.length > 0 ? (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {facilityUrls.map((url, i) => (
                  <li
                    key={`${url}-${i}`}
                    className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="200px" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      aria-label="Remove photo"
                      onClick={() => setFacilityUrls((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                <Upload className="h-4 w-4" aria-hidden />
                {uploadingFacility ? "Uploading…" : "Upload photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploadingFacility || facilityUrls.length >= MAX_FACILITY_PHOTOS}
                  onChange={(e) => void onFacilityFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </>
        ) : (
          <textarea
            id="facilityPhotosLines"
            name="facilityPhotosLines"
            rows={4}
            placeholder={"One image URL per line\nhttps://…"}
            defaultValue={initial.facilityPhotos.join("\n")}
            className={inputClass}
            style={boxStyle}
          />
        )}
      </div>

      <div>
        <label htmlFor="facilityVideoUrl" className={labelClass} style={{ color: "var(--color-text)" }}>
          Facility video URL (YouTube or direct file)
        </label>
        <input
          id="facilityVideoUrl"
          name="facilityVideoUrl"
          type="url"
          defaultValue={initial.facilityVideoUrl ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div>
        <label htmlFor="operatingHours" className={labelClass} style={{ color: "var(--color-text)" }}>
          Operating hours (visitors)
        </label>
        <input
          id="operatingHours"
          name="operatingHours"
          type="text"
          defaultValue={initial.operatingHours ?? ""}
          placeholder='e.g. Open Mon–Sat 9am–1pm'
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div>
        <label htmlFor="volunteerInfo" className={labelClass} style={{ color: "var(--color-text)" }}>
          Volunteer information
        </label>
        <textarea
          id="volunteerInfo"
          name="volunteerInfo"
          rows={4}
          defaultValue={initial.volunteerInfo ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div>
        <label htmlFor="donationNeeds" className={labelClass} style={{ color: "var(--color-text)" }}>
          What we need (supplies &amp; support)
        </label>
        <textarea
          id="donationNeeds"
          name="donationNeeds"
          rows={3}
          defaultValue={initial.donationNeeds ?? ""}
          className={inputClass}
          style={boxStyle}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="totalAnimalsRescued" className={labelClass} style={{ color: "var(--color-text)" }}>
            Total animals rescued (lifetime)
          </label>
          <input
            id="totalAnimalsRescued"
            name="totalAnimalsRescued"
            type="number"
            min={0}
            defaultValue={initial.totalAnimalsRescued ?? ""}
            className={inputClass}
            style={boxStyle}
          />
        </div>
        <div>
          <label htmlFor="totalAnimalsAdopted" className={labelClass} style={{ color: "var(--color-text)" }}>
            Total animals adopted (lifetime)
          </label>
          <input
            id="totalAnimalsAdopted"
            name="totalAnimalsAdopted"
            type="number"
            min={0}
            defaultValue={initial.totalAnimalsAdopted ?? ""}
            className={inputClass}
            style={boxStyle}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="publicContactEmail" className={labelClass} style={{ color: "var(--color-text)" }}>
            Public contact email
          </label>
          <input
            id="publicContactEmail"
            name="publicContactEmail"
            type="email"
            defaultValue={initial.publicContactEmail ?? ""}
            placeholder="hello@yourrescue.org"
            className={inputClass}
            style={boxStyle}
          />
        </div>
        <div>
          <label htmlFor="contactPhone" className={labelClass} style={{ color: "var(--color-text)" }}>
            Public contact phone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={initial.contactPhone ?? ""}
            className={inputClass}
            style={boxStyle}
          />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={labelClass} style={{ color: "var(--color-text)" }}>
            Team members
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
            onClick={() => setTeamRows((r) => [...r, { name: "", role: "", photo: "", bio: "" }])}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add member
          </button>
        </div>
        <ul className="mt-4 space-y-4">
          {teamRows.map((row, idx) => (
            <li
              key={idx}
              className="rounded-[var(--radius-lg)] border p-4"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      setTeamRows((rows) =>
                        rows.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x))
                      )
                    }
                    className={inputClass}
                    style={boxStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Role
                  </label>
                  <input
                    type="text"
                    value={row.role}
                    onChange={(e) =>
                      setTeamRows((rows) =>
                        rows.map((x, i) => (i === idx ? { ...x, role: e.target.value } : x))
                      )
                    }
                    className={inputClass}
                    style={boxStyle}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  Photo URL (optional)
                </label>
                <input
                  type="url"
                  value={row.photo}
                  onChange={(e) =>
                    setTeamRows((rows) =>
                      rows.map((x, i) => (i === idx ? { ...x, photo: e.target.value } : x))
                    )
                  }
                  className={inputClass}
                  style={boxStyle}
                />
              </div>
              <div className="mt-3">
                <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  Bio (optional)
                </label>
                <textarea
                  value={row.bio}
                  onChange={(e) =>
                    setTeamRows((rows) =>
                      rows.map((x, i) => (i === idx ? { ...x, bio: e.target.value } : x))
                    )
                  }
                  rows={2}
                  className={inputClass}
                  style={boxStyle}
                />
              </div>
              {teamRows.length > 1 ? (
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium"
                  style={{ color: "var(--color-error, #DC2626)" }}
                  onClick={() => setTeamRows((rows) => rows.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
