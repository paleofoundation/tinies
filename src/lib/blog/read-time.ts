import type { BlogPostSummary } from "./types";

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/** ~200 wpm; use ceil so short posts still show a sensible integer. */
export function computeReadTimeMinutes(content: string, excerpt: string, title: string): number {
  let words = wordCount(content);
  if (words === 0) {
    words = wordCount(`${excerpt} ${title}`.trim());
  }
  if (words === 0) return 5;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Safe minutes for UI — avoids blank output when a value is missing or NaN after serialization.
 */
export function displayReadMinutesForPost(
  post: Pick<BlogPostSummary, "readTimeMinutes" | "excerptDisplay" | "title">
): number {
  const n = post.readTimeMinutes;
  if (typeof n === "number" && Number.isFinite(n) && n >= 1) {
    return Math.round(n);
  }
  return computeReadTimeMinutes("", post.excerptDisplay, post.title);
}
