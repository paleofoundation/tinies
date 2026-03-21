"use client";

import { useRouter } from "@/i18n/navigation";
import { Filter, X } from "lucide-react";
import type { AdoptBrowseQuery } from "@/lib/adoption/adopt-browse-params";
import {
  ADOPT_AGE_OPTIONS,
  ADOPT_DISTRICT_OPTIONS,
  adoptBrowseQueryHasFilters,
  buildAdoptBrowseSearchParams,
} from "@/lib/adoption/adopt-browse-params";
import type { AdoptBrowseSpecies } from "@/lib/adoption/adopt-browse-params";
import type { AdoptAgeBand } from "@/lib/adoption/parse-estimated-age";

type Props = {
  query: AdoptBrowseQuery;
};

function adoptPath(q: AdoptBrowseQuery): string {
  const p = buildAdoptBrowseSearchParams(q);
  return p.toString() ? `/adopt?${p.toString()}` : "/adopt";
}

function clearSpecies(q: AdoptBrowseQuery): AdoptBrowseQuery {
  const { species: _s, ...rest } = q;
  return rest;
}

function setSpecies(q: AdoptBrowseQuery, species: AdoptBrowseSpecies): AdoptBrowseQuery {
  return { ...clearSpecies(q), species };
}

function setDistrict(q: AdoptBrowseQuery, district: string): AdoptBrowseQuery {
  const next = { ...q };
  if (!district) {
    const { district: _d, ...rest } = next;
    return rest;
  }
  return { ...next, district: district as AdoptBrowseQuery["district"] };
}

function setAge(q: AdoptBrowseQuery, age: string): AdoptBrowseQuery {
  const next = { ...q };
  if (!age) {
    const { age: _a, ...rest } = next;
    return rest;
  }
  return { ...next, age: age as AdoptAgeBand };
}

function toggleInternational(q: AdoptBrowseQuery): AdoptBrowseQuery {
  if (q.international) {
    const { international: _i, ...rest } = q;
    return rest;
  }
  return { ...q, international: true };
}

const SPECIES_LABEL: Record<AdoptBrowseSpecies, string> = {
  dog: "Dog",
  cat: "Cat",
};

const DISTRICT_LABEL = Object.fromEntries(
  ADOPT_DISTRICT_OPTIONS.map((d) => [d.slug, d.label])
) as Record<string, string>;

const AGE_LABEL = Object.fromEntries(
  ADOPT_AGE_OPTIONS.map((a) => [a.value, a.label])
) as Record<string, string>;

export function AdoptBrowseFilters({ query }: Props) {
  const router = useRouter();
  const navigate = (next: AdoptBrowseQuery) => {
    router.push(adoptPath(next));
  };

  const hasFilters = adoptBrowseQueryHasFilters(query);

  return (
    <section className="px-4 pb-8 sm:px-6 lg:px-8" aria-label="Filter adoptable animals">
      <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <div
          className="flex flex-col gap-4 rounded-[var(--radius-lg)] border px-6 py-4"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span
              className="flex items-center gap-2 text-sm font-medium"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
            >
              <Filter className="h-4 w-4" aria-hidden />
              Filters
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="text-sm"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
              >
                Species:
              </span>
              <div
                className="flex rounded-[var(--radius-pill)] border p-0.5"
                style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}
                role="group"
                aria-label="Species"
              >
                {(["all", "dog", "cat"] as const).map((key) => {
                  const active =
                    key === "all" ? query.species == null : query.species === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (key === "all") navigate(clearSpecies(query));
                        else navigate(setSpecies(query, key));
                      }}
                      className={`rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-colors ${
                        active ? "text-white" : "hover:bg-[var(--color-primary-50)]"
                      }`}
                      style={{
                        fontFamily: "var(--font-body), sans-serif",
                        ...(active
                          ? { backgroundColor: "var(--color-primary)" }
                          : { color: "var(--color-text-secondary)" }),
                      }}
                    >
                      {key === "all" ? "All" : key === "dog" ? "Dogs" : "Cats"}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex flex-wrap items-center gap-2">
              <span className="sr-only">District</span>
              <select
                className="rounded-[var(--radius-lg)] border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                aria-label="District"
                value={query.district ?? ""}
                onChange={(e) => navigate(setDistrict(query, e.target.value))}
              >
                <option value="">All districts</option>
                {ADOPT_DISTRICT_OPTIONS.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => navigate(toggleInternational(query))}
              className="rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition-colors"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                borderColor: query.international ? "var(--color-primary)" : "var(--color-border)",
                backgroundColor: query.international ? "rgba(10, 128, 128, 0.12)" : "var(--color-background)",
                color: query.international ? "var(--color-primary)" : "var(--color-text-secondary)",
              }}
              aria-pressed={!!query.international}
            >
              International only
            </button>
            <label className="flex flex-wrap items-center gap-2">
              <span className="sr-only">Age range</span>
              <select
                className="rounded-[var(--radius-lg)] border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                aria-label="Age range"
                value={query.age ?? ""}
                onChange={(e) => navigate(setAge(query, e.target.value))}
              >
                <option value="">Any age</option>
                {ADOPT_AGE_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {hasFilters && (
            <div
              className="flex flex-wrap items-center gap-2 border-t pt-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
              >
                Active
              </span>
              {query.species && (
                <button
                  type="button"
                  onClick={() => navigate(clearSpecies(query))}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-3 py-1 text-sm font-medium"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(10, 128, 128, 0.12)",
                    color: "var(--color-primary)",
                  }}
                >
                  {SPECIES_LABEL[query.species]}
                  <X className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">Remove species filter</span>
                </button>
              )}
              {query.district && (
                <button
                  type="button"
                  onClick={() => {
                    const { district: _d, ...rest } = query;
                    navigate(rest);
                  }}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-3 py-1 text-sm font-medium"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(10, 128, 128, 0.12)",
                    color: "var(--color-primary)",
                  }}
                >
                  {DISTRICT_LABEL[query.district] ?? query.district}
                  <X className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">Remove district filter</span>
                </button>
              )}
              {query.age && (
                <button
                  type="button"
                  onClick={() => {
                    const { age: _a, ...rest } = query;
                    navigate(rest);
                  }}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-3 py-1 text-sm font-medium"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(10, 128, 128, 0.12)",
                    color: "var(--color-primary)",
                  }}
                >
                  {AGE_LABEL[query.age] ?? query.age}
                  <X className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">Remove age filter</span>
                </button>
              )}
              {query.international && (
                <button
                  type="button"
                  onClick={() => {
                    const { international: _i, ...rest } = query;
                    navigate(rest);
                  }}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-3 py-1 text-sm font-medium"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(10, 128, 128, 0.12)",
                    color: "var(--color-primary)",
                  }}
                >
                  International only
                  <X className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">Remove international filter</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate({})}
                className="ml-auto text-sm font-semibold underline-offset-2 hover:underline"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
