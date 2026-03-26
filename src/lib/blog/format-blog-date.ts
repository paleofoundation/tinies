/** e.g. 29 Mar 2026 — matches blog mock metadata line. */
export function formatBlogDateCompact(iso: string): string {
  const d = Date.parse(iso);
  if (Number.isNaN(d)) return iso;
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
