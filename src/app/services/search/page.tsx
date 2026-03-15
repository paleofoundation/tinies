"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, List, Map, Star } from "lucide-react";

const SERVICE_TYPES = [
  { value: "", label: "All services" },
  { value: "walking", label: "Dog Walking" },
  { value: "sitting", label: "Pet Sitting" },
  { value: "boarding", label: "Overnight Boarding" },
  { value: "drop_in", label: "Drop-In Visits" },
  { value: "daycare", label: "Daycare" },
] as const;

const DISTRICTS = [
  "All districts",
  "Nicosia",
  "Limassol",
  "Larnaca",
  "Paphos",
  "Famagusta",
] as const;

const PLACEHOLDER_PROVIDERS = [
  { slug: "maria-k", name: "Maria K.", initials: "MK", rating: 4.9, reviewCount: 24, district: "Limassol", services: ["Walking", "Sitting"], price: "€15", bio: "I've been caring for dogs and cats for over 5 years. Your pet will feel at home with me.", color: "#0A6E5C" },
  { slug: "andreas-p", name: "Andreas P.", initials: "AP", rating: 4.8, reviewCount: 18, district: "Nicosia", services: ["Boarding", "Daycare"], price: "€25", bio: "Large garden and calm home. I only take a few pets at a time so everyone gets attention.", color: "#0A6E5C" },
  { slug: "elena-m", name: "Elena M.", initials: "EM", rating: 5.0, reviewCount: 12, district: "Paphos", services: ["Drop-in", "Sitting"], price: "€12", bio: "Cat specialist. I work from home and love having feline company during the day.", color: "#F45D48" },
  { slug: "nikos-c", name: "Nikos C.", initials: "NC", rating: 4.7, reviewCount: 31, district: "Limassol", services: ["Walking", "Daycare"], price: "€18", bio: "Active walker and runner. Perfect for high-energy dogs who need long walks.", color: "#0A6E5C" },
  { slug: "sofia-l", name: "Sofia L.", initials: "SL", rating: 4.9, reviewCount: 9, district: "Larnaca", services: ["Sitting", "Boarding"], price: "€22", bio: "Quiet neighbourhood with a fenced yard. Your dog will have plenty of space to play.", color: "#0A6E5C" },
  { slug: "christos-d", name: "Christos D.", initials: "CD", rating: 4.6, reviewCount: 15, district: "Nicosia", services: ["Walking", "Drop-in"], price: "€14", bio: "Flexible schedule. I offer morning and evening walks plus drop-in visits for cats.", color: "#F45D48" },
] as const;

function getServiceLabel(type: string) {
  return SERVICE_TYPES.find((t) => t.value === type)?.label ?? "Search results";
}

export default function ServicesSearchPage() {
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type") ?? "";
  const [serviceType, setServiceType] = useState(typeFromUrl);
  const [district, setDistrict] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "map">("list");

  useEffect(() => {
    setServiceType(typeFromUrl);
  }, [typeFromUrl]);

  const pageTitle = useMemo(() => getServiceLabel(serviceType), [serviceType]);

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <div className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 lg:px-8">
        <h1
          className="text-2xl font-normal text-[#1B2432] sm:text-3xl"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          {pageTitle}
        </h1>
        <p className="mt-2 text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Verified providers in Cyprus</p>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row">
          <aside className="lg:w-56 lg:shrink-0">
            <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Filters</h2>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Service type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="mt-2 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-sm text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                    style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                  >
                    {SERVICE_TYPES.map((t) => (
                      <option key={t.value || "all"} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="mt-2 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-sm text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                    style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d === "All districts" ? "" : d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Min €</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="mt-2 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Max €</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="100"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="mt-2 w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#6B7280]">Minimum rating</label>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setMinRating(minRating === star ? null : star)}
                        className={`rounded p-1 transition-colors ${
                          minRating !== null && star <= minRating
                            ? "text-amber-500"
                            : "text-[#6B7280]/40 hover:text-amber-500/70"
                        }`}
                        aria-label={`${star} stars minimum`}
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{PLACEHOLDER_PROVIDERS.length} providers</p>
              <div className="flex rounded-[999px] border border-[#E5E7EB] bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`flex items-center gap-2 rounded-[999px] px-4 py-2 text-sm font-semibold transition-colors ${view === "list" ? "bg-[#0A6E5C] text-white" : "text-[#6B7280] hover:bg-[#0A6E5C]/10"}`}
                  style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setView("map")}
                  className={`flex items-center gap-2 rounded-[999px] px-4 py-2 text-sm font-semibold transition-colors ${view === "map" ? "bg-[#0A6E5C] text-white" : "text-[#6B7280] hover:bg-[#0A6E5C]/10"}`}
                  style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                >
                  <Map className="h-4 w-4" />
                  Map
                </button>
              </div>
            </div>

            {view === "list" ? (
              <ul className="space-y-6">
                {PLACEHOLDER_PROVIDERS.map((provider) => (
                  <li
                    key={provider.slug}
                    className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div
                        className="h-16 w-16 shrink-0 rounded-full flex items-center justify-center text-lg font-semibold text-white"
                        style={{ backgroundColor: provider.color }}
                      >
                        {provider.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{provider.name}</h2>
                          <span className="flex items-center gap-1 text-sm text-[#6B7280]">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            {provider.rating}
                          </span>
                          <span className="text-sm text-[#6B7280]">({provider.reviewCount} reviews)</span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-sm text-[#6B7280]">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {provider.district}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {provider.services.map((s) => (
                            <span
                              key={s}
                              className="rounded-[999px] bg-[#0A6E5C]/10 px-2.5 py-0.5 text-xs font-medium text-[#0A6E5C]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-[#6B7280]">{provider.bio}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className="font-semibold text-[#F45D48]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>From {provider.price}</span>
                          <Link
                            href={`/services/provider/${provider.slug}`}
                            className="rounded-[999px] bg-[#0A6E5C] px-5 h-12 font-semibold text-white transition-opacity hover:opacity-90 inline-flex items-center"
                            style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[#E5E7EB] bg-[#F7F7F8] py-20 text-center">
                <Map className="h-16 w-16 text-[#6B7280]/40" />
                <p className="mt-4 font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Map coming soon</p>
                <p className="mt-2 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Switch to list view to browse providers.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
