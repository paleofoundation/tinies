import { addDays } from "date-fns";
import { enGB } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const NICOSIA_TZ = "Asia/Nicosia";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function parseTimeSlot(timeSlot: string): { h: number; m: number } {
  const [hs, ms] = timeSlot.trim().split(":");
  const h = parseInt(hs ?? "0", 10);
  const m = parseInt(ms ?? "0", 10);
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
}

/** Calendar Y-M-D in Nicosia for an instant. */
export function nicosiaYmdFromUtc(d: Date): { y: number; m1: number; d: number } {
  const fmt = formatInTimeZone(d, NICOSIA_TZ, "yyyy-MM-dd");
  const [y, m, day] = fmt.split("-").map((x) => parseInt(x, 10));
  return { y, m1: m, d: day };
}

const LONG_WEEKDAY_TO_JS: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/** JS weekday 0=Sun..6=Sat for a Nicosia calendar date. */
export function nicosiaJsDowFromYmd(y: number, m1: number, d: number): number {
  const wall = `${y}-${pad2(m1)}-${pad2(d)}T12:00:00`;
  const utc = fromZonedTime(wall, NICOSIA_TZ);
  const long = formatInTimeZone(utc, NICOSIA_TZ, "EEEE", { locale: enGB });
  return LONG_WEEKDAY_TO_JS[long] ?? 0;
}

export function utcInstantForNicosiaWall(y: number, m1: number, d: number, h: number, min: number): Date {
  const wall = `${y}-${pad2(m1)}-${pad2(d)}T${pad2(h)}:${pad2(min)}:00`;
  return fromZonedTime(wall, NICOSIA_TZ);
}

export function nicosiaCalendarPlusDays(y: number, m1: number, d: number, deltaDays: number): { y: number; m1: number; d: number } {
  const noon = utcInstantForNicosiaWall(y, m1, d, 12, 0);
  const next = addDays(noon, deltaDays);
  return nicosiaYmdFromUtc(next);
}

/**
 * Next session start strictly after `afterExclusive`, on one of `daysOfWeek` (0=Sun..6=Sat),
 * at timeH:timeM Nicosia wall time. Respects optional series end (inclusive end-of-series instant).
 */
export function nextOccurrenceUtc(
  afterExclusive: Date,
  daysOfWeek: number[],
  timeH: number,
  timeM: number,
  seriesEndUtc: Date | null
): Date | null {
  const want = [...new Set(daysOfWeek)]
    .filter((d) => d >= 0 && d <= 6)
    .sort((a, b) => a - b);
  if (want.length === 0) return null;
  let { y, m1, d } = nicosiaYmdFromUtc(afterExclusive);
  ({ y, m1, d } = nicosiaCalendarPlusDays(y, m1, d, 1));
  for (let step = 0; step < 370; step++) {
    const dow = nicosiaJsDowFromYmd(y, m1, d);
    if (want.includes(dow)) {
      const candidate = utcInstantForNicosiaWall(y, m1, d, timeH, timeM);
      if (candidate > afterExclusive) {
        if (seriesEndUtc && candidate > seriesEndUtc) return null;
        return candidate;
      }
    }
    ({ y, m1, d } = nicosiaCalendarPlusDays(y, m1, d, 1));
  }
  return null;
}

export function startOfTodayNicosiaUtc(): Date {
  const now = new Date();
  const { y, m1, d } = nicosiaYmdFromUtc(now);
  return utcInstantForNicosiaWall(y, m1, d, 0, 0);
}

/** End of series from owner-selected YYYY-MM-DD (last day inclusive, end of day Nicosia). */
export function endOfDayFromYmdString(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  return utcInstantForNicosiaWall(y, mo, d, 23, 59);
}

const SLOT_LABELS = ["Morning", "Afternoon", "Evening"] as const;

function slotForHour(hour: number): (typeof SLOT_LABELS)[number] {
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

/** Availability keys match provider profile: e.g. "Mon-Morning". */
export function availabilityKeyForInstant(instant: Date): string {
  const wd = formatInTimeZone(instant, NICOSIA_TZ, "EEE");
  const hour = parseInt(formatInTimeZone(instant, NICOSIA_TZ, "H"), 10);
  const slot = slotForHour(hour);
  return `${wd}-${slot}`;
}

/** True when profile explicitly marks that day/slot as unavailable. */
export function isTimeBlockedByAvailability(
  availability: Record<string, boolean> | null | undefined,
  instant: Date
): boolean {
  if (!availability || Object.keys(availability).length === 0) return false;
  const key = availabilityKeyForInstant(instant);
  return Object.prototype.hasOwnProperty.call(availability, key) && availability[key] === false;
}
