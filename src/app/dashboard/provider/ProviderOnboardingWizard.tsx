"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Camera, Upload } from "lucide-react";
import { ServiceType, CancellationPolicy } from "@/lib/constants";
import type { ProviderWizardProfile } from "./actions";
import {
  uploadProviderWizardFile,
  updateProviderWizardPhoto,
  updateProviderWizardBio,
  updateProviderWizardServices,
  updateProviderWizardPhotos,
  updateProviderWizardAvailability,
  updateProviderWizardPetPrefs,
  updateProviderWizardIdDocument,
  updateProviderWizardCancellationPolicy,
  getProviderAreaPriceGuidance,
} from "./actions";
import { VerifyIdentityButton } from "./VerifyIdentityButton";
import type { ServiceOfferInput } from "./actions";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const SLOTS = ["Morning", "Afternoon", "Evening"] as const;
const SERVICE_LABELS: Record<string, string> = {
  [ServiceType.walking]: "Dog walking",
  [ServiceType.sitting]: "Pet sitting",
  [ServiceType.boarding]: "Overnight boarding",
  [ServiceType.drop_in]: "Drop-in visits",
  [ServiceType.daycare]: "Daycare",
};
const PRICE_UNITS = [
  { value: "per_walk", label: "Per walk" },
  { value: "per_hour", label: "Per hour" },
  { value: "per_day", label: "Per day" },
  { value: "per_visit", label: "Per visit" },
] as const;
const SIZE_RESTRICTIONS = ["Any size", "Small only", "Medium and below", "No large dogs"] as const;
const CANCELLATION_EXPLANATIONS: Record<string, string> = {
  [CancellationPolicy.flexible]: "24+ hours: full refund. Under 24h: 50% refund. No-show: no refund.",
  [CancellationPolicy.moderate]: "7+ days: full refund. 2–6 days: 50%. Under 48h: no refund.",
  [CancellationPolicy.strict]: "14+ days: full refund. 7–13 days: 50%. Under 7 days: no refund.",
};

const STEPS = [
  { id: "profilePhoto", title: "Profile Photo" },
  { id: "bio", title: "Bio" },
  { id: "services", title: "Services & Pricing" },
  { id: "photos", title: "Photos" },
  { id: "availability", title: "Availability" },
  { id: "petPrefs", title: "Pet Preferences" },
  { id: "idVerification", title: "ID Verification" },
  { id: "cancellationPolicy", title: "Cancellation Policy" },
] as const;

type Props = {
  initialProfile: ProviderWizardProfile;
  areaPriceGuidance: Record<string, { min: number; max: number }>;
};

export function ProviderOnboardingWizard({ initialProfile, areaPriceGuidance }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);

  // Step 1: photo
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl ?? "");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Step 2: bio
  const [bio, setBio] = useState(initialProfile.bio ?? "");

  // Step 3: services
  const [servicesEnabled, setServicesEnabled] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    (Object.keys(SERVICE_LABELS) as string[]).forEach((t) => {
      o[t] = initialProfile.servicesOffered.some((s) => s.type === t);
    });
    return o;
  });
  const [serviceConfig, setServiceConfig] = useState<Record<string, { base_price: number; additional_pet_price: number; price_unit: string; max_pets: number }>>(() => {
    const o: Record<string, { base_price: number; additional_pet_price: number; price_unit: string; max_pets: number }> = {};
    initialProfile.servicesOffered.forEach((s) => {
      o[s.type] = {
        base_price: s.base_price ?? 0,
        additional_pet_price: s.additional_pet_price ?? 0,
        price_unit: s.price_unit ?? "per_walk",
        max_pets: s.max_pets ?? 2,
      };
    });
    (Object.keys(SERVICE_LABELS) as string[]).forEach((t) => {
      if (!(t in o)) o[t] = { base_price: 0, additional_pet_price: 0, price_unit: "per_walk", max_pets: 2 };
    });
    return o;
  });

  // Step 4: photos
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialProfile.photos ?? []);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Step 5: availability
  const [availability, setAvailability] = useState<Record<string, boolean>>(initialProfile.availability ?? {});

  // Step 6: pet prefs
  const [petTypes, setPetTypes] = useState({ dogs: (initialProfile.petTypesAccepted ?? "").toLowerCase().includes("dog"), cats: (initialProfile.petTypesAccepted ?? "").toLowerCase().includes("cat"), other: (initialProfile.petTypesAccepted ?? "").toLowerCase().includes("other") });
  const [sizeRestriction, setSizeRestriction] = useState("");
  const [maxPets, setMaxPets] = useState(initialProfile.maxPets ?? 2);

  // Step 7: ID (Stripe Identity or manual upload)
  const [idDocumentUrl, setIdDocumentUrl] = useState(initialProfile.idDocumentUrl ?? "");
  const [stripeVerificationStarted, setStripeVerificationStarted] = useState(false);
  const idInputRef = useRef<HTMLInputElement>(null);

  // Step 8: cancellation
  const [cancellationPolicy, setCancellationPolicy] = useState(initialProfile.cancellationPolicy || CancellationPolicy.flexible);

  function toggleAvailability(day: string, slot: string) {
    const key = `${day}-${slot}`;
    setAvailability((a) => ({ ...a, [key]: !a[key] }));
  }

  async function handleSaveAndNext() {
    setSaving(true);
    try {
      if (step === 0) {
        if (!avatarUrl.trim()) {
          toast.error("Please upload a profile photo.");
          setSaving(false);
          return;
        }
        const err = await updateProviderWizardPhoto(avatarUrl);
        if (err.error) { toast.error(err.error); setSaving(false); return; }
      }
      if (step === 1) {
        if (bio.trim().length < 200) {
          toast.error("Bio must be at least 200 characters.");
          setSaving(false);
          return;
        }
        if (bio.trim().length > 1000) {
          toast.error("Bio must be at most 1000 characters.");
          setSaving(false);
          return;
        }
        const err = await updateProviderWizardBio(bio);
        if (err.error) { toast.error(err.error); setSaving(false); return; }
      }
      if (step === 2) {
        const offers: ServiceOfferInput[] = [];
        (Object.keys(servicesEnabled) as string[]).forEach((type) => {
          if (servicesEnabled[type] && serviceConfig[type]?.base_price > 0) {
            offers.push({
              type,
              base_price: serviceConfig[type].base_price,
              additional_pet_price: serviceConfig[type].additional_pet_price,
              price_unit: serviceConfig[type].price_unit,
              max_pets: serviceConfig[type].max_pets,
            });
          }
        });
        if (offers.length === 0) {
          toast.error("Select at least one service and set a base price.");
          setSaving(false);
          return;
        }
        const err = await updateProviderWizardServices(offers);
        if (err.error) { toast.error(err.error); setSaving(false); return; }
      }
      if (step === 3) {
        if (galleryUrls.length < 3) {
          toast.error("Upload at least 3 photos (home, garden, you with animals).");
          setSaving(false);
          return;
        }
        const err = await updateProviderWizardPhotos(galleryUrls);
        if (err.error) { toast.error(err.error); setSaving(false); return; }
      }
      if (step === 4) {
        const hasAny = Object.values(availability).some(Boolean);
        if (!hasAny) {
          toast.error("Select at least one time slot when you're available.");
          setSaving(false);
          return;
        }
        const err = await updateProviderWizardAvailability(availability);
        if (err.error) { toast.error(err.error); setSaving(false); return; }
      }
      if (step === 5) {
        const accepted: string[] = [];
        if (petTypes.dogs) accepted.push("dogs");
        if (petTypes.cats) accepted.push("cats");
        if (petTypes.other) accepted.push("other");
        if (accepted.length === 0) {
          toast.error("Select at least one pet type.");
          setSaving(false);
          return;
        }
        let petTypesStr = accepted.join(", ");
        if (sizeRestriction?.trim()) petTypesStr += `. Size: ${sizeRestriction.trim()}`;
        const err = await updateProviderWizardPetPrefs(petTypesStr, maxPets);
        if (err.error) { toast.error(err.error); setSaving(false); return; }
      }
      if (step === 6) {
        if (!idDocumentUrl.trim() && !stripeVerificationStarted) {
          toast.error("Please verify with Stripe or upload your government ID.");
          setSaving(false);
          return;
        }
        if (idDocumentUrl.trim()) {
        const err = await updateProviderWizardIdDocument(idDocumentUrl);
          if (err.error) { toast.error(err.error); setSaving(false); return; }
        }
      }
      if (step === 7) {
        const err = await updateProviderWizardCancellationPolicy(cancellationPolicy);
        if (err.error) { toast.error(err.error); setSaving(false); return; }
      }

      if (step === STEPS.length - 1) {
        toast.success("Profile complete! You can now receive bookings.");
        router.refresh();
        return;
      }
      setStep((s) => s + 1);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("type", "avatar");
    fd.set("file", file);
    const { url, error } = await uploadProviderWizardFile(fd);
    if (error) { toast.error(error); return; }
    setAvatarUrl(url);
    toast.success("Photo uploaded.");
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const urls: string[] = [];
    for (let i = 0; i < Math.min(files.length, 15 - galleryUrls.length); i++) {
      const fd = new FormData();
      fd.set("type", "gallery");
      fd.set("file", files[i]);
      const { url, error } = await uploadProviderWizardFile(fd);
      if (error) { toast.error(error); return; }
      urls.push(url);
    }
    setGalleryUrls((prev) => [...prev, ...urls].slice(0, 15));
    toast.success(`${urls.length} photo(s) added.`);
  }

  async function handleIdUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("type", "id");
    fd.set("file", file);
    const { url, error } = await uploadProviderWizardFile(fd);
    if (error) { toast.error(error); return; }
    setIdDocumentUrl(url);
    toast.success("ID document uploaded. We'll verify within 24–48 hours.");
  }

  const canProceed = (() => {
    if (step === 0) return !!avatarUrl.trim();
    if (step === 1) return bio.trim().length >= 200 && bio.trim().length <= 1000;
    if (step === 2) return (Object.keys(servicesEnabled) as string[]).some((t) => servicesEnabled[t] && (serviceConfig[t]?.base_price ?? 0) > 0);
    if (step === 3) return galleryUrls.length >= 3;
    if (step === 4) return Object.values(availability).some(Boolean);
    if (step === 5) return (petTypes.dogs || petTypes.cats || petTypes.other) && maxPets >= 1;
    if (step === 6) return !!idDocumentUrl.trim() || stripeVerificationStarted;
    if (step === 7) return true;
    return false;
  })();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8" style={{ color: "var(--color-text)" }}>
      <h1 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)" }}>
        Complete your provider profile
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Step {step + 1} of {STEPS.length}: {STEPS[step].title}
      </p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, backgroundColor: "var(--color-primary)" }} />
      </div>

      <div className="mt-8 rounded-[var(--radius-lg)] border p-6 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        {/* Step 1: Profile Photo */}
        {step === 0 && (
          <div>
            <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>Profile photo</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Upload a clear, friendly photo of yourself (not your pet). Required.</p>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <div className="mt-4 flex flex-col items-center gap-4">
              {avatarUrl ? (
                <div className="relative">
                  <img src={avatarUrl} alt="Profile" className="h-32 w-32 rounded-full object-cover border-2" style={{ borderColor: "var(--color-primary)" }} />
                  <button type="button" onClick={() => avatarInputRef.current?.click()} className="mt-2 text-sm font-medium" style={{ color: "var(--color-primary)" }}>Change photo</button>
                </div>
              ) : (
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed py-12 px-8 transition-colors hover:border-[var(--color-primary)]" style={{ borderColor: "var(--color-border)" }}>
                  <Camera className="h-12 w-12" style={{ color: "var(--color-text-secondary)" }} />
                  <span className="mt-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Choose photo</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Bio */}
        {step === 1 && (
          <div>
            <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>Bio</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Write about yourself in 2–3 paragraphs. Include your experience with animals, why you love pet care, your home setup, and any qualifications. Min 200 chars, max 1000.</p>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} className="mt-4 w-full rounded-[var(--radius-lg)] border px-4 py-3 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }} placeholder="I've been caring for dogs and cats for..." />
            <p className={`mt-2 text-sm ${bio.length < 200 ? "" : bio.length > 1000 ? "text-red-600" : ""}`} style={bio.length >= 200 && bio.length <= 1000 ? { color: "var(--color-primary)" } : {}}>{bio.length} / 1000 characters {bio.length >= 200 && bio.length <= 1000 && "✓"}</p>
          </div>
        )}

        {/* Step 3: Services & Pricing */}
        {step === 2 && (
          <div>
            <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>Services & pricing</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Select services and set your rates (EUR).</p>
            <div className="mt-6 space-y-6">
              {(Object.entries(SERVICE_LABELS) as [string, string][]).map(([type, label]) => {
                const guidance = areaPriceGuidance[type];
                return (
                  <div key={type} className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)" }}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={servicesEnabled[type] ?? false} onChange={() => setServicesEnabled((s) => ({ ...s, [type]: !s[type] }))} className="h-4 w-4 rounded" style={{ accentColor: "var(--color-primary)" }} />
                      <span className="font-medium">{label}</span>
                    </label>
                    {servicesEnabled[type] && (
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {guidance && <p className="sm:col-span-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>Other providers in your area charge €{guidance.min}–€{guidance.max}</p>}
                        <div>
                          <label className="block text-sm">Base price (€)</label>
                          <input type="number" min="0" step="0.01" value={serviceConfig[type]?.base_price || ""} onChange={(e) => setServiceConfig((c) => ({ ...c, [type]: { ...c[type], base_price: parseFloat(e.target.value) || 0 } }))} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2" style={{ borderColor: "var(--color-border)" }} placeholder="15" />
                        </div>
                        <div>
                          <label className="block text-sm">Additional pet (€)</label>
                          <input type="number" min="0" step="0.01" value={serviceConfig[type]?.additional_pet_price ?? ""} onChange={(e) => setServiceConfig((c) => ({ ...c, [type]: { ...c[type], additional_pet_price: parseFloat(e.target.value) || 0 } }))} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2" style={{ borderColor: "var(--color-border)" }} placeholder="8" />
                        </div>
                        <div>
                          <label className="block text-sm">Price unit</label>
                          <select value={serviceConfig[type]?.price_unit ?? "per_walk"} onChange={(e) => setServiceConfig((c) => ({ ...c, [type]: { ...c[type], price_unit: e.target.value } }))} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
                            {PRICE_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm">Max pets</label>
                          <input type="number" min="1" max="10" value={serviceConfig[type]?.max_pets ?? 2} onChange={(e) => setServiceConfig((c) => ({ ...c, [type]: { ...c[type], max_pets: parseInt(e.target.value, 10) || 1 } }))} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 3 && (
          <div>
            <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>Photos</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Upload 5–15 photos of your home, garden, walking area, you with animals. Min 3 required.</p>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
            <div className="mt-4 flex flex-wrap gap-3">
              {galleryUrls.map((url, i) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-24 w-24 rounded-[var(--radius-lg)] object-cover border" style={{ borderColor: "var(--color-border)" }} />
                  <button type="button" onClick={() => setGalleryUrls((p) => p.filter((_, j) => j !== i))} className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs">×</button>
                </div>
              ))}
              {galleryUrls.length < 15 && (
                <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex h-24 w-24 flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed" style={{ borderColor: "var(--color-border)" }}>
                  <Upload className="h-6 w-6" style={{ color: "var(--color-text-secondary)" }} />
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Add</span>
                </button>
              )}
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>{galleryUrls.length} / 3 minimum (max 15)</p>
          </div>
        )}

        {/* Step 5: Availability */}
        {step === 4 && (
          <div>
            <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>Availability</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>When you're available. Default: weekdays 8am–6pm. Toggle slots you can accept bookings.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr>
                    <th className="pb-2 text-left font-medium"></th>
                    {DAYS.map((d) => <th key={d} className="pb-2 text-center font-medium">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map((slot) => (
                    <tr key={slot}>
                      <td className="py-2 font-medium">{slot}</td>
                      {DAYS.map((day) => {
                        const key = `${day}-${slot}`;
                        const checked = availability[key] ?? false;
                        return (
                          <td key={key} className="py-2 text-center">
                            <button type="button" onClick={() => toggleAvailability(day, slot)} className={`h-8 w-8 rounded-[var(--radius-lg)] border-2 transition-colors ${checked ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-[var(--color-border)]"}`}>{checked ? "✓" : ""}</button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 6: Pet preferences */}
        {step === 5 && (
          <div>
            <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>Pet preferences</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Pet types accepted and max pets at once.</p>
            <div className="mt-4 space-y-3">
              {(["dogs", "cats", "other"] as const).map((animal) => (
                <label key={animal} className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={petTypes[animal]} onChange={() => setPetTypes((p) => ({ ...p, [animal]: !p[animal] }))} className="h-4 w-4 rounded" style={{ accentColor: "var(--color-primary)" }} />
                  <span className="capitalize">{animal}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Size restrictions</label>
              <select value={sizeRestriction} onChange={(e) => setSizeRestriction(e.target.value)} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
                <option value="">Select (optional)</option>
                {SIZE_RESTRICTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Max pets at once</label>
              <input type="number" min="1" max="10" value={maxPets} onChange={(e) => setMaxPets(parseInt(e.target.value, 10) || 1)} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2" style={{ borderColor: "var(--color-border)" }} />
            </div>
          </div>
        )}

        {/* Step 7: ID Verification */}
        {step === 6 && (
          <div>
            <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>ID verification</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Verify your identity so you can appear in search. Use Stripe (ID + selfie) for instant verification, or upload a document for manual review within 24–48 hours.</p>
            <div className="mt-4 space-y-3">
              <VerifyIdentityButton
                onSuccess={() => setStripeVerificationStarted(true)}
                className="w-full rounded-[var(--radius-lg)] border-2 py-3 text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-70"
                style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              >
                Verify with Stripe (ID + selfie)
              </VerifyIdentityButton>
              <p className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>or</p>
              <input ref={idInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleIdUpload} />
              {idDocumentUrl ? (
                <div>
                  <p className="text-sm" style={{ color: "var(--color-primary)" }}>ID document uploaded (manual review).</p>
                  <button type="button" onClick={() => idInputRef.current?.click()} className="mt-2 text-sm font-medium" style={{ color: "var(--color-primary)" }}>Replace</button>
                </div>
              ) : (
                <button type="button" onClick={() => idInputRef.current?.click()} className="flex w-full flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed py-6 transition-colors hover:border-[var(--color-primary)]" style={{ borderColor: "var(--color-border)" }}>
                  <Upload className="h-8 w-8" style={{ color: "var(--color-text-secondary)" }} />
                  <span className="mt-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Upload ID for manual review</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 8: Cancellation policy */}
        {step === 7 && (
          <div>
            <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>Cancellation policy</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Choose one. Owners see this before booking.</p>
            <div className="mt-4 space-y-3">
              {([CancellationPolicy.flexible, CancellationPolicy.moderate, CancellationPolicy.strict] as const).map((value) => (
                <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3 ${cancellationPolicy === value ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border)]"}`}>
                  <input type="radio" name="cancellation" value={value} checked={cancellationPolicy === value} onChange={() => setCancellationPolicy(value)} className="mt-1 h-4 w-4" style={{ accentColor: "var(--color-primary)" }} />
                  <div>
                    <span className="font-medium capitalize">{value}</span>
                    <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>{CANCELLATION_EXPLANATIONS[value]}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex items-center gap-1 rounded-[var(--radius-lg)] border px-4 py-2 text-sm font-medium disabled:opacity-50" style={{ borderColor: "var(--color-border)" }}>
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button type="button" onClick={handleSaveAndNext} disabled={saving || !canProceed} className="inline-flex items-center gap-1 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" >
            {saving ? "Saving…" : step === STEPS.length - 1 ? "Finish" : "Next"} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
