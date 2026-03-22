export type ResolvedListingVideo =
  | { kind: "youtube"; embedSrc: string }
  | { kind: "direct"; src: string };

function youtubeEmbedFromUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      const m = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (m?.[1]) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return `https://www.youtube-nocookie.com/embed/${shorts[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

/** YouTube watch/short/embed URLs, or a direct https media URL for <video>. */
export function resolveListingVideoUrl(url: string | null | undefined): ResolvedListingVideo | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  const yt = youtubeEmbedFromUrl(trimmed);
  if (yt) return { kind: "youtube", embedSrc: yt };
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return { kind: "direct", src: trimmed };
    }
  } catch {
    return null;
  }
  return null;
}
