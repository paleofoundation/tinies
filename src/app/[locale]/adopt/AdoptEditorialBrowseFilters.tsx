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

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

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

/**
 * Editorial-styled filters for /adopt — same behaviour as `AdoptBrowseFilters`.
 */
export function AdoptEditorialBrowseFilters({ query }: Props) {
  const router = useRouter();
  const navigate = (next: AdoptBrowseQuery) => {
    router.push(adoptPath(next));
  };

  const hasFilters = adoptBrowseQueryHasFilters(query);

  return (
    <div className="mt-8 w-full" aria-label="Filter adoptable animals">
      <div
        className="flex flex-col gap-4 rounded-full border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: BORDER_TEAL_15,
          fontFamily: "var(--font-body), sans-serif",
        }}
      >
        <span
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: "rgba(28,28,28,0.5)" }}
        >
          <Filter className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
          More filters
        </span>
        <label className="flex min-w-[160px] flex-1 items-center gap-2">
          <span className="sr-only">District</span>
          <select
            className="w-full rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: BORDER_TEAL_15,
              color: "#1C1C1C",
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
          className="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            borderColor: query.international ? "#0A8080" : BORDER_TEAL_15,
            backgroundColor: query.international ? "rgba(10,128,128,0.08)" : "#FFFFFF",
            color: query.international ? "#0A8080" : "rgba(28,28,28,0.7)",
          }}
          aria-pressed={!!query.international}
        >
          International only
        </button>
        <label className="flex min-w-[140px] flex-1 items-center gap-2">
          <span className="sr-only">Age range</span>
          <select
            className="w-full rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: BORDER_TEAL_15,
              color: "#1C1C1C",
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

      {hasFilters ? (
        <div
          className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4"
          style={{ borderColor: BORDER_TEAL_15 }}
        >
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0A8080" }}>
            Active
          </span>
          {query.species && (
            <button
              type="button"
              onClick={() => navigate(clearSpecies(query))}
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: "#0A8080",
                backgroundColor: "rgba(10,128,128,0.08)",
                color: "#0A8080",
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
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: "#0A8080",
                backgroundColor: "rgba(10,128,128,0.08)",
                color: "#0A8080",
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
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: "#0A8080",
                backgroundColor: "rgba(10,128,128,0.08)",
                color: "#0A8080",
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
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: "#0A8080",
                backgroundColor: "rgba(10,128,128,0.08)",
                color: "#0A8080",
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
            style={{ color: "#F45D48" }}
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Species pills for the animals section header (same navigation as full filters). */
export function AdoptEditorialSpeciesPills({ query }: Props) {
  const router = useRouter();
  const navigate = (next: AdoptBrowseQuery) => {
    router.push(adoptPath(next));
  };

  return (
    <div className="flex flex-wrap justify-end gap-2" role="group" aria-label="Species">
      {(["all", "dog", "cat"] as const).map((key) => {
        const active = key === "all" ? query.species == null : query.species === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === "all") navigate(clearSpecies(query));
              else navigate(setSpecies(query, key));
            }}
            className="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              ...(active
                ? { backgroundColor: "#0A8080", color: "#FFFFFF", borderColor: "#0A8080" }
                : {
                    backgroundColor: "#FFFFFF",
                    color: "#0A8080",
                    borderColor: BORDER_TEAL_15,
                  }),
            }}
          >
            {key === "all" ? "All" : key === "dog" ? "Dogs" : "Cats"}
          </button>
        );
      })}
    </div>
  );
}
