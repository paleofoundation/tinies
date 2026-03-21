/**
 * Convert free-text adoption listing ages (e.g. "2 years", "6 months") to years for filtering.
 * Returns null if no reliable numeric age can be inferred.
 */
export function parseEstimatedAgeToYears(value: string | null | undefined): number | null {
  if (value == null) return null;
  const s = value.trim().toLowerCase();
  if (!s) return null;

  const yearMatch = s.match(/(\d+(?:\.\d+)?)\s*(years?|yrs?|yr)\b/);
  if (yearMatch) {
    const n = parseFloat(yearMatch[1]);
    return Number.isFinite(n) ? n : null;
  }

  const monthMatch = s.match(/(\d+(?:\.\d+)?)\s*(months?|mos?\b|mo\b)/);
  if (monthMatch) {
    const n = parseFloat(monthMatch[1]);
    return Number.isFinite(n) ? n / 12 : null;
  }

  const weekMatch = s.match(/(\d+(?:\.\d+)?)\s*(weeks?|wks?|wk)\b/);
  if (weekMatch) {
    const n = parseFloat(weekMatch[1]);
    return Number.isFinite(n) ? n / 52 : null;
  }

  return null;
}

export type AdoptAgeBand = "kitten" | "young" | "adult" | "senior";

/** Whether parsed age in years falls in the browse filter band. Unknown age never matches when a band is selected. */
export function ageYearsMatchesBand(years: number | null, band: AdoptAgeBand): boolean {
  if (years == null || !Number.isFinite(years)) return false;
  switch (band) {
    case "kitten":
      return years < 1;
    case "young":
      return years >= 1 && years < 3;
    case "adult":
      return years >= 3 && years < 7;
    case "senior":
      return years >= 7;
    default:
      return false;
  }
}
