"use client";

import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { ProviderRichProfileData, UpdateProviderRichProfileInput } from "@/lib/utils/provider-helpers";
import { uploadProviderHomePhoto } from "@/lib/providers/provider-home-photo-upload";
import {
  EMERGENCY_MAX,
  EXPERIENCE_TAG_OPTIONS,
  HEADLINE_MAX,
  HOME_DESC_MAX,
  INSURANCE_MAX,
  LANGUAGE_OPTIONS,
  MAX_HOME_PHOTOS,
  PREV_EXP_MAX,
  WHY_MAX,
} from "@/lib/validations/provider-rich-profile";

export type ProviderRichProfileFieldsHandle = {
  getPayload: () => UpdateProviderRichProfileInput | null;
};

type QualRow = { title: string; issuer: string; year: string; description: string };

const emptyQual: QualRow = { title: "", issuer: "", year: "", description: "" };

function toQualRows(q: ProviderRichProfileData["qualifications"]): QualRow[] {
  if (q.length === 0) return [{ ...emptyQual }];
  return q.map((x) => ({
    title: x.title,
    issuer: x.issuer ?? "",
    year: x.year != null ? String(x.year) : "",
    description: x.description ?? "",
  }));
}

type Props = {
  initial: ProviderRichProfileData;
};

export const ProviderRichProfileFields = forwardRef<ProviderRichProfileFieldsHandle, Props>(function ProviderRichProfileFields(
  { initial },
  ref
) {
  const [headline, setHeadline] = useState("");
  const [videoIntroUrl, setVideoIntroUrl] = useState("");
  const [experienceTags, setExperienceTags] = useState<Set<string>>(new Set());
  const [qualRows, setQualRows] = useState<QualRow[]>([{ ...emptyQual }]);
  const [languages, setLanguages] = useState<Set<string>>(new Set());
  const [homeDescription, setHomeDescription] = useState("");
  const [homePhotos, setHomePhotos] = useState<string[]>([]);
  const [whyIDoThis, setWhyIDoThis] = useState("");
  const [previousExperience, setPreviousExperience] = useState("");
  const [insuranceDetails, setInsuranceDetails] = useState("");
  const [emergencyProtocol, setEmergencyProtocol] = useState("");
  const [acceptedBreedsStr, setAcceptedBreedsStr] = useState("");
  const [notAcceptedStr, setNotAcceptedStr] = useState("");
  const [responseTimeMinutes, setResponseTimeMinutes] = useState("");
  const [backgroundCheckPassed, setBackgroundCheckPassed] = useState(false);
  const [uploadingHome, setUploadingHome] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setHeadline(initial.headline ?? "");
    setVideoIntroUrl(initial.videoIntroUrl ?? "");
    setExperienceTags(new Set(initial.experienceTags));
    setQualRows(toQualRows(initial.qualifications));
    setLanguages(new Set(initial.languages));
    setHomeDescription(initial.homeDescription ?? "");
    setHomePhotos([...initial.homePhotos].slice(0, MAX_HOME_PHOTOS));
    setWhyIDoThis(initial.whyIDoThis ?? "");
    setPreviousExperience(initial.previousExperience ?? "");
    setInsuranceDetails(initial.insuranceDetails ?? "");
    setEmergencyProtocol(initial.emergencyProtocol ?? "");
    setAcceptedBreedsStr(initial.acceptedBreeds.join(", "));
    setNotAcceptedStr(initial.notAccepted.join(", "));
    setResponseTimeMinutes(initial.responseTimeMinutes != null ? String(initial.responseTimeMinutes) : "");
    setBackgroundCheckPassed(initial.backgroundCheckPassed);
  }, [initial]);

  function toggleTag(tag: string) {
    setExperienceTags((prev) => {
      const n = new Set(prev);
      if (n.has(tag)) n.delete(tag);
      else n.add(tag);
      return n;
    });
  }

  function toggleLang(lang: string) {
    setLanguages((prev) => {
      const n = new Set(prev);
      if (n.has(lang)) n.delete(lang);
      else n.add(lang);
      return n;
    });
  }

  async function onHomePhoto(file: File | null) {
    if (!file) return;
    if (homePhotos.length >= MAX_HOME_PHOTOS) {
      toast.error(`Maximum ${MAX_HOME_PHOTOS} home photos.`);
      return;
    }
    setUploadingHome(true);
    const res = await uploadProviderHomePhoto(file);
    setUploadingHome(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.url) {
      setHomePhotos((p) => [...p, res.url!].slice(0, MAX_HOME_PHOTOS));
      toast.success("Photo added.");
    }
  }

  useImperativeHandle(ref, () => ({
    getPayload: (): UpdateProviderRichProfileInput | null => {
      if (headline.trim().length > HEADLINE_MAX) {
        toast.error(`Headline must be ${HEADLINE_MAX} characters or less.`);
        return null;
      }
      if (whyIDoThis.trim().length > WHY_MAX) {
        toast.error(`Why I do this must be ${WHY_MAX} characters or less.`);
        return null;
      }
      if (homeDescription.trim().length > HOME_DESC_MAX) {
        toast.error(`Home description must be ${HOME_DESC_MAX} characters or less.`);
        return null;
      }
      if (previousExperience.trim().length > PREV_EXP_MAX) {
        toast.error(`Previous experience must be ${PREV_EXP_MAX} characters or less.`);
        return null;
      }
      if (emergencyProtocol.trim().length > EMERGENCY_MAX) {
        toast.error(`Emergency protocol must be ${EMERGENCY_MAX} characters or less.`);
        return null;
      }
      if (insuranceDetails.trim().length > INSURANCE_MAX) {
        toast.error(`Insurance details must be ${INSURANCE_MAX} characters or less.`);
        return null;
      }

      const qualifications = qualRows
        .filter((r) => r.title.trim())
        .map((r) => {
          const y = r.year.trim() ? Number.parseInt(r.year, 10) : undefined;
          return {
            title: r.title.trim(),
            ...(r.issuer.trim() ? { issuer: r.issuer.trim() } : {}),
            ...(y != null && !Number.isNaN(y) ? { year: y } : {}),
            ...(r.description.trim() ? { description: r.description.trim() } : {}),
          };
        });

      const rt = responseTimeMinutes.trim() ? Number.parseInt(responseTimeMinutes, 10) : null;
      if (rt != null && (Number.isNaN(rt) || rt < 5 || rt > 10080)) {
        toast.error("Response time must be between 5 and 10080 minutes, or leave blank.");
        return null;
      }

      const acceptedBreeds = acceptedBreedsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 40);
      const notAccepted = notAcceptedStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 40);

      return {
        headline: headline.trim() || null,
        videoIntroUrl: videoIntroUrl.trim() || null,
        experienceTags: [...experienceTags],
        qualifications,
        languages: [...languages],
        homeDescription: homeDescription.trim() || null,
        homePhotos,
        whyIDoThis: whyIDoThis.trim() || null,
        previousExperience: previousExperience.trim() || null,
        insuranceDetails: insuranceDetails.trim() || null,
        emergencyProtocol: emergencyProtocol.trim() || null,
        acceptedBreeds,
        notAccepted,
        responseTimeMinutes: rt != null && !Number.isNaN(rt) ? rt : null,
        backgroundCheckPassed,
      };
    },
  }));

  return (
    <section
      id="trust-profile"
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8"
    >
      <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
        Trust &amp; professional profile
      </h2>
      <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Shown on your public Tinies profile. Completing this section helps owners choose you with confidence.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <li>Providers with photos of their home often get more booking interest.</li>
        <li>A short video introduction helps owners feel they know you before the first meet.</li>
        <li>Listing qualifications and experience helps you stand out in search.</li>
      </ul>

      <div className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Headline (max {HEADLINE_MAX} characters)
          </label>
          <input
            type="text"
            value={headline}
            maxLength={HEADLINE_MAX}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Experienced dog walker in Limassol"
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{ color: "var(--color-text)" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Video intro URL (YouTube or direct file)
          </label>
          <input
            type="url"
            value={videoIntroUrl}
            onChange={(e) => setVideoIntroUrl(e.target.value)}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{ color: "var(--color-text)" }}
          />
        </div>

        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Experience &amp; specialties
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXPERIENCE_TAG_OPTIONS.map((tag) => (
              <label
                key={tag}
                className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm"
                style={{
                  borderColor: experienceTags.has(tag) ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: experienceTags.has(tag) ? "var(--color-primary-muted-08)" : "transparent",
                  color: "var(--color-text)",
                }}
              >
                <input type="checkbox" className="sr-only" checked={experienceTags.has(tag)} onChange={() => toggleTag(tag)} />
                <span className="capitalize">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Qualifications
            </p>
            <button
              type="button"
              onClick={() => setQualRows((r) => [...r, { ...emptyQual }])}
              className="inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add
            </button>
          </div>
          <ul className="mt-3 space-y-4">
            {qualRows.map((row, idx) => (
              <li key={idx} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                      Title
                    </label>
                    <input
                      value={row.title}
                      onChange={(e) =>
                        setQualRows((rows) => rows.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                      }
                      className="mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                      Issuer
                    </label>
                    <input
                      value={row.issuer}
                      onChange={(e) =>
                        setQualRows((rows) => rows.map((x, i) => (i === idx ? { ...x, issuer: e.target.value } : x)))
                      }
                      className="mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                      Year
                    </label>
                    <input
                      type="number"
                      min={1950}
                      max={2100}
                      value={row.year}
                      onChange={(e) =>
                        setQualRows((rows) => rows.map((x, i) => (i === idx ? { ...x, year: e.target.value } : x)))
                      }
                      className="mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Description (optional)
                  </label>
                  <textarea
                    value={row.description}
                    rows={2}
                    onChange={(e) =>
                      setQualRows((rows) => rows.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))
                    }
                    className="mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
                  />
                </div>
                {qualRows.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setQualRows((rows) => rows.filter((_, i) => i !== idx))}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: "var(--color-error)" }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Languages spoken
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <label
                key={lang}
                className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm"
                style={{
                  borderColor: languages.has(lang) ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: languages.has(lang) ? "var(--color-primary-muted-08)" : "transparent",
                }}
              >
                <input type="checkbox" className="sr-only" checked={languages.has(lang)} onChange={() => toggleLang(lang)} />
                {lang}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Where pets stay — description (max {HOME_DESC_MAX} chars)
          </label>
          <textarea
            value={homeDescription}
            maxLength={HOME_DESC_MAX}
            rows={4}
            onChange={(e) => setHomeDescription(e.target.value)}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Home photos (max {MAX_HOME_PHOTOS})
          </p>
          {homePhotos.length > 0 ? (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {homePhotos.map((url, i) => (
                <li key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                  <Image src={url} alt="" fill className="object-cover" sizes="200px" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                    aria-label="Remove"
                    onClick={() => setHomePhotos((p) => p.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium">
            <Upload className="h-4 w-4" aria-hidden />
            {uploadingHome ? "Uploading…" : "Upload home photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploadingHome || homePhotos.length >= MAX_HOME_PHOTOS}
              onChange={(e) => void onHomePhoto(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Why I do this (max {WHY_MAX} chars)
          </label>
          <textarea
            value={whyIDoThis}
            maxLength={WHY_MAX}
            rows={3}
            onChange={(e) => setWhyIDoThis(e.target.value)}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Previous experience (max {PREV_EXP_MAX} chars)
          </label>
          <textarea
            value={previousExperience}
            maxLength={PREV_EXP_MAX}
            rows={4}
            onChange={(e) => setPreviousExperience(e.target.value)}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Insurance details (max {INSURANCE_MAX} chars)
          </label>
          <input
            type="text"
            value={insuranceDetails}
            maxLength={INSURANCE_MAX}
            onChange={(e) => setInsuranceDetails(e.target.value)}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Emergency protocol (max {EMERGENCY_MAX} chars)
          </label>
          <textarea
            value={emergencyProtocol}
            maxLength={EMERGENCY_MAX}
            rows={3}
            onChange={(e) => setEmergencyProtocol(e.target.value)}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Breeds you welcome (comma-separated)
            </label>
            <input
              type="text"
              value={acceptedBreedsStr}
              onChange={(e) => setAcceptedBreedsStr(e.target.value)}
              placeholder="Labrador, Golden Retriever, …"
              className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Not accepted (comma-separated)
            </label>
            <input
              type="text"
              value={notAcceptedStr}
              onChange={(e) => setNotAcceptedStr(e.target.value)}
              placeholder="e.g. Unneutered males, …"
              className="mt-2 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Usual response time (minutes, optional)
          </label>
          <input
            type="number"
            min={5}
            max={10080}
            value={responseTimeMinutes}
            onChange={(e) => setResponseTimeMinutes(e.target.value)}
            placeholder="e.g. 120 for 2 hours"
            className="mt-2 w-full max-w-xs rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-2.5 text-sm"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={backgroundCheckPassed}
            onChange={(e) => setBackgroundCheckPassed(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)]"
          />
          <span className="text-sm" style={{ color: "var(--color-text)" }}>
            I have passed an enhanced background check (show badge on profile)
          </span>
        </label>
      </div>
    </section>
  );
});
