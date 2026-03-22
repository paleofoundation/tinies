const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_SIBLINGS = 20;
const MAX_ALIASES = 20;

export function normalizeListingFk(id: string | undefined | null): string | null {
  const t = id?.trim() ?? "";
  return UUID_RE.test(t) ? t : null;
}

export function normalizeSiblingIds(ids: string[] | undefined, selfListingId?: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of ids ?? []) {
    const t = id.trim();
    if (!UUID_RE.test(t) || t === selfListingId || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= MAX_SIBLINGS) break;
  }
  return out;
}

export function normalizeAlternateNames(names: string[] | undefined): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const n of names ?? []) {
    const t = n.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= MAX_ALIASES) break;
  }
  return out;
}

export function sanitizeParentIds(
  motherId: string | null,
  fatherId: string | null,
  selfId?: string
): { motherId: string | null; fatherId: string | null } {
  let m = motherId;
  let f = fatherId;
  if (selfId) {
    if (m === selfId) m = null;
    if (f === selfId) f = null;
  }
  if (m && f && m === f) f = null;
  return { motherId: m, fatherId: f };
}
