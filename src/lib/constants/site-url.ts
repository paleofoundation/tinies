/**
 * Canonical public site origin for metadata, sitemap, and robots (non-www tinies.app).
 * Normalizes NEXT_PUBLIC_APP_URL so www.tinies.app → https://tinies.app.
 */
export function getCanonicalSiteOrigin(): string {
  let raw = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(raw)) {
    raw = "https://tinies.app";
  }
  try {
    const u = new URL(raw);
    if (u.hostname.toLowerCase() === "www.tinies.app") {
      u.hostname = "tinies.app";
    }
    return u.origin;
  } catch {
    return "https://tinies.app";
  }
}
