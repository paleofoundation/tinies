"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ServiceType, CancellationPolicy } from "@/lib/constants";

const DISTRICTS = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"] as const;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const SLOTS = ["Morning", "Afternoon", "Evening"] as const;
const PRICE_UNITS = [
  { value: "per_walk", label: "Per walk" },
  { value: "per_hour", label: "Per hour" },
  { value: "per_day", label: "Per day" },
  { value: "per_visit", label: "Per visit" },
] as const;
const SIZE_RESTRICTIONS = ["Any size", "Small only", "Medium and below", "No large dogs"] as const;

type ServiceConfig = {
  basePrice: string;
  additionalPetPrice: string;
  priceUnit: string;
  maxPets: string;
};

const CANCELLATION_EXPLANATIONS: Record<string, string> = {
  [CancellationPolicy.flexible]: "24+ hours: full refund. Under 24h: 50% refund. No-show: no refund.",
  [CancellationPolicy.moderate]: "7+ days: full refund. 2–6 days: 50%. Under 48h: no refund.",
  [CancellationPolicy.strict]: "14+ days: full refund. 7–13 days: 50%. Under 7 days: no refund.",
};

export default function ProviderEditProfilePage() {
  const [bio, setBio] = useState("");
  const [district, setDistrict] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const [services, setServices] = useState<Record<string, boolean>>({
    [ServiceType.walking]: false,
    [ServiceType.sitting]: false,
    [ServiceType.boarding]: false,
    [ServiceType.drop_in]: false,
    [ServiceType.daycare]: false,
  });
  const [serviceConfig, setServiceConfig] = useState<Record<string, ServiceConfig>>({});
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [petPrefs, setPetPrefs] = useState({ dogs: false, cats: false, other: false });
  const [sizeRestriction, setSizeRestriction] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState<string>(CancellationPolicy.flexible);
  const [submitting, setSubmitting] = useState(false);

  const bioLength = bio.length;
  const bioValid = bioLength >= 200 && bioLength <= 1000;

  function toggleService(type: string) {
    setServices((s) => ({ ...s, [type]: !s[type] }));
    if (!services[type]) {
      setServiceConfig((c) => ({
        ...c,
        [type]: {
          basePrice: "",
          additionalPetPrice: "",
          priceUnit: "per_walk",
          maxPets: "2",
        },
      }));
    }
  }

  function setServiceConfigField(
    type: string,
    field: keyof ServiceConfig,
    value: string
  ) {
    setServiceConfig((c) => ({
      ...c,
      [type]: { ...(c[type] ?? {}), [field]: value },
    }));
  }
  function toggleAvailability(day: string, slot: string) {
    const key = `${day}-${slot}`;
    setAvailability((a) => ({ ...a, [key]: !a[key] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bioValid) {
      toast.error("Bio must be between 200 and 1000 characters.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Profile saved successfully.");
    }, 600);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 sm:py-20" style={{ maxWidth: "var(--max-width)" }}>
        <div className="mb-8">
          <Link href="/dashboard/provider" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Edit profile</h1>
          <p className="mt-1 ">Complete your provider profile to appear in search.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Profile photo */}
          <section id="photo" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Profile photo</h2>
            <p className="mt-1 text-sm ">A clear photo of you (not your pet). Required for verification.</p>
            <div className="mt-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)]  py-8 transition-colors hover:border-[var(--color-primary)]/40">
                <input type="file" accept="image/*" className="hidden" />
                <span className="text-sm font-semibold text-[var(--color-primary)]">Choose file</span>
                <span className="mt-1 text-xs ">or drag and drop</span>
              </label>
            </div>
          </section>

          {/* Bio */}
          <section id="bio" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Bio</h2>
            <p className="mt-1 text-sm ">Min 200 characters, max 1000. Tell owners about yourself and your experience.</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
              className="mt-4 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)]  px-4 py-3  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="I've been caring for dogs and cats for..."
            />
            <p className={`mt-2 text-sm ${bioLength < 200 ? "" : bioLength > 1000 ? "text-[#DC2626]" : "text-[var(--color-primary)]"}`}>
              {bioLength} / 1000 characters {bioLength >= 200 && bioLength <= 1000 && "✓"}
            </p>
          </section>

          {/* Services */}
          <section id="services" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Services & pricing</h2>
            <p className="mt-1 text-sm ">Select services and set your rates (in EUR).</p>
            <div className="mt-6 space-y-6">
              {(
                [
                  [ServiceType.walking, "Dog walking"],
                  [ServiceType.sitting, "Pet sitting"],
                  [ServiceType.boarding, "Overnight boarding"],
                  [ServiceType.drop_in, "Drop-in visits"],
                  [ServiceType.daycare, "Daycare"],
                ] as const
              ).map(([type, label]) => (
                <div key={type} className="rounded-[var(--radius-lg)] border border-[var(--color-border)]  p-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={services[type] ?? false}
                      onChange={() => toggleService(type)}
                      className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="font-medium ">{label}</span>
                  </label>
                  {services[type] && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm ">Base price (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={serviceConfig[type]?.basePrice ?? ""}
                          onChange={(e) => setServiceConfigField(type, "basePrice", e.target.value)}
                          className="mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                          placeholder="15.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm ">Additional pet (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={serviceConfig[type]?.additionalPetPrice ?? ""}
                          onChange={(e) => setServiceConfigField(type, "additionalPetPrice", e.target.value)}
                          className="mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                          placeholder="8.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm ">Price unit</label>
                        <select
                          value={serviceConfig[type]?.priceUnit ?? "per_walk"}
                          onChange={(e) => setServiceConfigField(type, "priceUnit", e.target.value)}
                          className="mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                        >
                          {PRICE_UNITS.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm ">Max pets</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={serviceConfig[type]?.maxPets ?? "2"}
                          onChange={(e) => setServiceConfigField(type, "maxPets", e.target.value)}
                          className="mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Service area */}
          <section id="area" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Service area</h2>
            <p className="mt-1 text-sm ">Where you're willing to provide care.</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium ">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--color-primary)]/20  px-4 py-2.5  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium ">Radius: {radiusKm} km</label>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--color-primary)]"
                />
              </div>
            </div>
          </section>

          {/* Availability */}
          <section id="availability" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Availability</h2>
            <p className="mt-1 text-sm ">When you're available. Toggle on the slots you can accept bookings.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr>
                    <th className="pb-2 text-left font-medium "></th>
                    {DAYS.map((d) => (
                      <th key={d} className="pb-2 text-center font-medium ">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map((slot) => (
                    <tr key={slot}>
                      <td className="py-2 font-medium ">{slot}</td>
                      {DAYS.map((day) => {
                        const key = `${day}-${slot}`;
                        const checked = availability[key] ?? false;
                        return (
                          <td key={key} className="py-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleAvailability(day, slot)}
                              className={`h-8 w-8 rounded-[var(--radius-lg)] border-2 transition-colors ${
                                checked
                                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                  : "border-[var(--color-border)]   hover:border-[var(--color-primary)]/40"
                              }`}
                            >
                              {checked ? "✓" : ""}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pet preferences */}
          <section id="pets" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Pet preferences</h2>
            <p className="mt-1 text-sm ">Types and size restrictions.</p>
            <div className="mt-4 space-y-3">
              {(["dogs", "cats", "other"] as const).map((animal) => (
                <label key={animal} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={petPrefs[animal]}
                    onChange={() => setPetPrefs((p) => ({ ...p, [animal]: !p[animal] }))}
                    className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="capitalize ">{animal}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium ">Size restrictions</label>
              <select
                value={sizeRestriction}
                onChange={(e) => setSizeRestriction(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--color-primary)]/20  px-4 py-2.5  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              >
                <option value="">Select restriction</option>
                {SIZE_RESTRICTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Verification placeholder */}
          <section id="verification" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Identity verification</h2>
            <p className="mt-1 text-sm ">Upload a government ID. We review within 24–48 hours. Required to appear in search.</p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)]  py-6 transition-colors hover:border-[var(--color-primary)]/40">
              <input type="file" accept="image/*,.pdf" className="hidden" />
              <span className="text-sm font-semibold text-[var(--color-primary)]">Upload ID document</span>
            </label>
          </section>

          {/* Cancellation policy */}
          <section id="cancellation" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Cancellation policy</h2>
            <p className="mt-1 text-sm ">Choose one. Owners see this before booking.</p>
            <div className="mt-4 space-y-3">
              {(
                [
                  [CancellationPolicy.flexible, "Flexible"],
                  [CancellationPolicy.moderate, "Moderate"],
                  [CancellationPolicy.strict, "Strict"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3 ${
                    cancellationPolicy === value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--color-border)] "
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellation"
                    value={value}
                    checked={cancellationPolicy === value}
                    onChange={() => setCancellationPolicy(value)}
                    className="mt-1 h-4 w-4 border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div>
                    <span className="font-medium ">{label}</span>
                    <p className="mt-0.5 text-sm ">{CANCELLATION_EXPLANATIONS[value]}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/dashboard/provider"
              className="text-sm  hover: hover:underline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !bioValid}
              className="rounded-[var(--radius-pill)] h-12 bg-[var(--color-primary)] px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {submitting ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
