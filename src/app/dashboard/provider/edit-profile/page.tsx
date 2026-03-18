"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ServiceType, CancellationPolicy } from "@/lib/constants";
import { ServiceAreaPicker, type ServiceAreaValue } from "@/components/maps";
import { VerifyIdentityButton } from "../VerifyIdentityButton";
import { getProviderHomeDetailsForEdit, updateProviderHomeDetails, getProviderHolidaysForEdit, updateProviderHolidays, HOLIDAY_OPTIONS } from "../actions";

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
  const [serviceArea, setServiceArea] = useState<ServiceAreaValue>({
    lat: null,
    lng: null,
    radiusKm: 10,
  });
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

  // Home details (Phase 6.3)
  const [homeType, setHomeType] = useState("");
  const [hasYard, setHasYard] = useState<boolean | "">("");
  const [yardFenced, setYardFenced] = useState<boolean | "">("");
  const [smokingHome, setSmokingHome] = useState<boolean | "">("");
  const [petsInHome, setPetsInHome] = useState("");
  const [childrenInHome, setChildrenInHome] = useState("");
  const [dogsOnFurniture, setDogsOnFurniture] = useState<boolean | "">("");
  const [pottyBreakFrequency, setPottyBreakFrequency] = useState("");
  const [typicalDay, setTypicalDay] = useState("");
  const [infoWantedAboutPet, setInfoWantedAboutPet] = useState("");
  const [homeDetailsLoaded, setHomeDetailsLoaded] = useState(false);
  const [confirmedHolidays, setConfirmedHolidays] = useState<string[]>([]);
  const [holidaysLoaded, setHolidaysLoaded] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    getProviderHomeDetailsForEdit().then((data) => {
      if (cancelled || !data) return;
      setHomeType(data.homeType ?? "");
      setHasYard(data.hasYard ?? "");
      setYardFenced(data.yardFenced ?? "");
      setSmokingHome(data.smokingHome ?? "");
      setPetsInHome(data.petsInHome ?? "");
      setChildrenInHome(data.childrenInHome ?? "");
      setDogsOnFurniture(data.dogsOnFurniture ?? "");
      setPottyBreakFrequency(data.pottyBreakFrequency ?? "");
      setTypicalDay(data.typicalDay ?? "");
      setInfoWantedAboutPet(data.infoWantedAboutPet ?? "");
      setHomeDetailsLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    getProviderHolidaysForEdit().then((data) => {
      if (cancelled || !data) return;
      setConfirmedHolidays(data.confirmedHolidays);
      setHolidaysLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bioValid) {
      toast.error("Bio must be between 200 and 1000 characters.");
      return;
    }
    setSubmitting(true);
    const [homeErr, holidaysErr] = await Promise.all([
      updateProviderHomeDetails({
        homeType: homeType || null,
        hasYard: hasYard === "" ? null : hasYard,
        yardFenced: yardFenced === "" ? null : yardFenced,
        smokingHome: smokingHome === "" ? null : smokingHome,
        petsInHome: petsInHome || null,
        childrenInHome: childrenInHome || null,
        dogsOnFurniture: dogsOnFurniture === "" ? null : dogsOnFurniture,
        pottyBreakFrequency: pottyBreakFrequency || null,
        typicalDay: typicalDay || null,
        infoWantedAboutPet: infoWantedAboutPet || null,
      }),
      updateProviderHolidays(confirmedHolidays),
    ]);
    setSubmitting(false);
    if (homeErr.error) toast.error(homeErr.error);
    else if (holidaysErr.error) toast.error(holidaysErr.error);
    else toast.success("Profile saved successfully.");
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
            <p className="mt-1 text-sm ">Where you&apos;re willing to provide care. Click the map to set your center, then set your radius (1–50 km).</p>
            <div className="mt-4 space-y-4">
              <ServiceAreaPicker
                value={serviceArea}
                onChange={setServiceArea}
              />
              <div>
                <label className="block text-sm font-medium ">District (for search)</label>
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

          {/* Home & Environment */}
          <section id="home" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Home & Environment</h2>
            <p className="mt-1 text-sm ">Details that help owners decide for boarding and daycare.</p>
            {!homeDetailsLoaded && <p className="mt-2 text-sm " style={{ color: "var(--color-text-secondary)" }}>Loading…</p>}
            {homeDetailsLoaded && (
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium ">Home type</label>
                  <select
                    value={homeType}
                    onChange={(e) => setHomeType(e.target.value)}
                    className="mt-1.5 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                  >
                    <option value="">Select</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasYard === true}
                      onChange={() => setHasYard(hasYard === true ? false : true)}
                      className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span>Has yard</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={yardFenced === true}
                      onChange={() => setYardFenced(yardFenced === true ? false : true)}
                      disabled={hasYard !== true}
                      className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)] disabled:opacity-50"
                    />
                    <span>Yard is fenced</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={smokingHome === true}
                      onChange={() => setSmokingHome(smokingHome === true ? false : true)}
                      className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span>Smoking home</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dogsOnFurniture === true}
                      onChange={() => setDogsOnFurniture(dogsOnFurniture === true ? false : true)}
                      className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span>Dogs allowed on furniture</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium ">Pets in home</label>
                  <input
                    type="text"
                    value={petsInHome}
                    onChange={(e) => setPetsInHome(e.target.value)}
                    placeholder="e.g. One small dog, two cats"
                    className="mt-1.5 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium ">Children in home</label>
                  <input
                    type="text"
                    value={childrenInHome}
                    onChange={(e) => setChildrenInHome(e.target.value)}
                    placeholder="e.g. Two kids, 5 and 8"
                    className="mt-1.5 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium ">Potty break frequency</label>
                  <input
                    type="text"
                    value={pottyBreakFrequency}
                    onChange={(e) => setPottyBreakFrequency(e.target.value)}
                    placeholder="e.g. Every 4–6 hours, or as needed"
                    className="mt-1.5 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                  />
                </div>
              </div>
            )}
          </section>

          {/* A Typical Day */}
          <section id="typical-day" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>A Typical Day</h2>
            <p className="mt-1 text-sm ">Describe a typical day with you so owners know what to expect.</p>
            <textarea
              value={typicalDay}
              onChange={(e) => setTypicalDay(e.target.value)}
              rows={5}
              className="mt-4 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)]  px-4 py-3  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Morning walk, breakfast together, playtime in the garden..."
            />
          </section>

          {/* What I'd Like to Know About Your Pet */}
          <section id="info-wanted" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>What I&apos;d Like to Know About Your Pet</h2>
            <p className="mt-1 text-sm ">Tell owners what details you&apos;d like before a stay (routine, diet, temperament, etc.).</p>
            <textarea
              value={infoWantedAboutPet}
              onChange={(e) => setInfoWantedAboutPet(e.target.value)}
              rows={4}
              className="mt-4 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)]  px-4 py-3  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Feeding schedule, any anxieties, how they get on with other dogs..."
            />
          </section>

          {/* Holiday Availability */}
          <section id="holidays" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Holiday Availability</h2>
            <p className="mt-1 text-sm ">Select periods when you&apos;re available. Owners can filter search by these.</p>
            {!holidaysLoaded && <p className="mt-2 text-sm " style={{ color: "var(--color-text-secondary)" }}>Loading…</p>}
            {holidaysLoaded && (
              <div className="mt-4 flex flex-wrap gap-3">
                {HOLIDAY_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-2.5 transition-colors hover:border-[var(--color-primary)]/40" style={{ borderColor: "var(--color-border)" }}>
                    <input
                      type="checkbox"
                      checked={confirmedHolidays.includes(opt.id)}
                      onChange={() => setConfirmedHolidays((prev) => prev.includes(opt.id) ? prev.filter((id) => id !== opt.id) : [...prev, opt.id])}
                      className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Verification */}
          <section id="verification" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8">
            <h2 className="font-normal " style={{ fontFamily: "var(--font-heading), serif" }}>Identity verification</h2>
            <p className="mt-1 text-sm ">Verify with Stripe (ID + selfie) for instant verification, or upload a document for manual review within 24–48 hours. Required to appear in search.</p>
            <div className="mt-4 space-y-3">
              <VerifyIdentityButton
                className="rounded-[var(--radius-lg)] border-2 border-[var(--color-primary)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:opacity-90 disabled:opacity-70"
              />
              <p className="text-center text-sm " style={{ color: "var(--color-text-secondary)" }}>or upload ID for manual review</p>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)] py-6 transition-colors hover:border-[var(--color-primary)]/40">
                <input type="file" accept="image/*,.pdf" className="hidden" />
                <span className="text-sm font-semibold text-[var(--color-primary)]">Upload ID document</span>
              </label>
            </div>
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
