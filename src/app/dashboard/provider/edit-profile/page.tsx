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
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 sm:py-20">
        <div className="mb-8">
          <Link href="/dashboard/provider" className="text-sm text-[#6B7280] hover:text-[#1B2432] hover:underline">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Edit profile</h1>
          <p className="mt-1 text-[#6B7280]">Complete your provider profile to appear in search.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Profile photo */}
          <section id="photo" className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Profile photo</h2>
            <p className="mt-1 text-sm text-[#6B7280]">A clear photo of you (not your pet). Required for verification.</p>
            <div className="mt-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[#E5E7EB] bg-[#F7F7F8] py-8 transition-colors hover:border-[#0A6E5C]/40">
                <input type="file" accept="image/*" className="hidden" />
                <span className="text-sm font-semibold text-[#0A6E5C]">Choose file</span>
                <span className="mt-1 text-xs text-[#6B7280]">or drag and drop</span>
              </label>
            </div>
          </section>

          {/* Bio */}
          <section id="bio" className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Bio</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Min 200 characters, max 1000. Tell owners about yourself and your experience.</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
              className="mt-4 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-3 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
              placeholder="I've been caring for dogs and cats for..."
            />
            <p className={`mt-2 text-sm ${bioLength < 200 ? "text-[#6B7280]" : bioLength > 1000 ? "text-[#DC2626]" : "text-[#0A6E5C]"}`}>
              {bioLength} / 1000 characters {bioLength >= 200 && bioLength <= 1000 && "✓"}
            </p>
          </section>

          {/* Services */}
          <section id="services" className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Services & pricing</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Select services and set your rates (in EUR).</p>
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
                <div key={type} className="rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] p-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={services[type] ?? false}
                      onChange={() => toggleService(type)}
                      className="h-4 w-4 rounded border-[#0A6E5C]/30 text-[#0A6E5C] focus:ring-[#0A6E5C]"
                    />
                    <span className="font-medium text-[#1B2432]">{label}</span>
                  </label>
                  {services[type] && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm text-[#6B7280]">Base price (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={serviceConfig[type]?.basePrice ?? ""}
                          onChange={(e) => setServiceConfigField(type, "basePrice", e.target.value)}
                          className="mt-1 w-full rounded-[14px] border border-[#E5E7EB] bg-white px-3 py-2 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                          placeholder="15.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#6B7280]">Additional pet (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={serviceConfig[type]?.additionalPetPrice ?? ""}
                          onChange={(e) => setServiceConfigField(type, "additionalPetPrice", e.target.value)}
                          className="mt-1 w-full rounded-[14px] border border-[#E5E7EB] bg-white px-3 py-2 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                          placeholder="8.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#6B7280]">Price unit</label>
                        <select
                          value={serviceConfig[type]?.priceUnit ?? "per_walk"}
                          onChange={(e) => setServiceConfigField(type, "priceUnit", e.target.value)}
                          className="mt-1 w-full rounded-[14px] border border-[#E5E7EB] bg-white px-3 py-2 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                        >
                          {PRICE_UNITS.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-[#6B7280]">Max pets</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={serviceConfig[type]?.maxPets ?? "2"}
                          onChange={(e) => setServiceConfigField(type, "maxPets", e.target.value)}
                          className="mt-1 w-full rounded-[14px] border border-[#E5E7EB] bg-white px-3 py-2 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Service area */}
          <section id="area" className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Service area</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Where you're willing to provide care.</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1B2432]">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#0A6E5C]/20 bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B2432]">Radius: {radiusKm} km</label>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="mt-2 w-full accent-[#0A6E5C]"
                />
              </div>
            </div>
          </section>

          {/* Availability */}
          <section id="availability" className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Availability</h2>
            <p className="mt-1 text-sm text-[#6B7280]">When you're available. Toggle on the slots you can accept bookings.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr>
                    <th className="pb-2 text-left font-medium text-[#6B7280]"></th>
                    {DAYS.map((d) => (
                      <th key={d} className="pb-2 text-center font-medium text-[#1B2432]">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map((slot) => (
                    <tr key={slot}>
                      <td className="py-2 font-medium text-[#6B7280]">{slot}</td>
                      {DAYS.map((day) => {
                        const key = `${day}-${slot}`;
                        const checked = availability[key] ?? false;
                        return (
                          <td key={key} className="py-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleAvailability(day, slot)}
                              className={`h-8 w-8 rounded-[14px] border-2 transition-colors ${
                                checked
                                  ? "border-[#0A6E5C] bg-[#0A6E5C] text-white"
                                  : "border-[#E5E7EB] bg-[#F7F7F8] text-[#6B7280] hover:border-[#0A6E5C]/40"
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
          <section id="pets" className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Pet preferences</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Types and size restrictions.</p>
            <div className="mt-4 space-y-3">
              {(["dogs", "cats", "other"] as const).map((animal) => (
                <label key={animal} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={petPrefs[animal]}
                    onChange={() => setPetPrefs((p) => ({ ...p, [animal]: !p[animal] }))}
                    className="h-4 w-4 rounded border-[#0A6E5C]/30 text-[#0A6E5C] focus:ring-[#0A6E5C]"
                  />
                  <span className="capitalize text-[#1B2432]">{animal}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#1B2432]">Size restrictions</label>
              <select
                value={sizeRestriction}
                onChange={(e) => setSizeRestriction(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#0A6E5C]/20 bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
              >
                <option value="">Select restriction</option>
                {SIZE_RESTRICTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Verification placeholder */}
          <section id="verification" className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Identity verification</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Upload a government ID. We review within 24–48 hours. Required to appear in search.</p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[#E5E7EB] bg-[#F7F7F8] py-6 transition-colors hover:border-[#0A6E5C]/40">
              <input type="file" accept="image/*,.pdf" className="hidden" />
              <span className="text-sm font-semibold text-[#0A6E5C]">Upload ID document</span>
            </label>
          </section>

          {/* Cancellation policy */}
          <section id="cancellation" className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h2 className="font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Cancellation policy</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Choose one. Owners see this before booking.</p>
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
                  className={`flex cursor-pointer items-start gap-3 rounded-[14px] border px-4 py-3 ${
                    cancellationPolicy === value
                      ? "border-[#0A6E5C] bg-[#0A6E5C]/5"
                      : "border-[#E5E7EB] bg-[#F7F7F8]"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellation"
                    value={value}
                    checked={cancellationPolicy === value}
                    onChange={() => setCancellationPolicy(value)}
                    className="mt-1 h-4 w-4 border-[#0A6E5C]/30 text-[#0A6E5C] focus:ring-[#0A6E5C]"
                  />
                  <div>
                    <span className="font-medium text-[#1B2432]">{label}</span>
                    <p className="mt-0.5 text-sm text-[#6B7280]">{CANCELLATION_EXPLANATIONS[value]}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/dashboard/provider"
              className="text-sm text-[#6B7280] hover:text-[#1B2432] hover:underline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !bioValid}
              className="rounded-[999px] h-12 bg-[#0A6E5C] px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {submitting ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
