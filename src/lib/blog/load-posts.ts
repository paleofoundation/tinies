import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { computeReadTimeMinutes } from "./read-time";
import type { BlogPostFull, BlogPostSummary } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

function parseCategories(data: Record<string, unknown>): {
  category: string;
  categories: string[];
} {
  const category = String(data.category ?? "Pet Care").trim() || "Pet Care";
  const extra = data.categories;
  const list = Array.isArray(extra)
    ? extra.map((x) => String(x).trim()).filter(Boolean)
    : [];
  const set = new Set<string>([category, ...list]);
  return { category, categories: [...set] };
}

function excerptDisplay(excerpt: string): string {
  const t = excerpt.trim();
  if (t.length <= 150) return t;
  return `${t.slice(0, 147)}…`;
}

function dateDisplay(iso: string): string {
  const d = Date.parse(iso);
  if (Number.isNaN(d)) return iso;
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toSummary(
  slug: string,
  data: Record<string, unknown>,
  content: string
): BlogPostSummary {
  const { category, categories } = parseCategories(data);
  const title = String(data.title ?? slug).trim();
  const excerpt = String(data.excerpt ?? "").trim();
  const seoRaw = data.seoDescription ?? data.seo_description;
  const seoDescription =
    typeof seoRaw === "string" && seoRaw.trim().length > 0 ? seoRaw.trim() : excerpt;
  const dateISO = String(data.date ?? "").trim();
  const author = String(data.author ?? "Tinies Team").trim();
  const image = String(data.image ?? "").trim();
  const readTimeMinutes = computeReadTimeMinutes(content, excerpt, title);

  return {
    slug,
    title,
    excerpt,
    seoDescription,
    excerptDisplay: excerptDisplay(excerpt),
    dateISO,
    dateDisplay: dateDisplay(dateISO),
    category,
    categories,
    author,
    image,
    readTimeMinutes,
  };
}

let postsCache: BlogPostFull[] | null = null;

export function getAllBlogPosts(): BlogPostFull[] {
  if (postsCache) return postsCache;
  if (!fs.existsSync(CONTENT_DIR)) {
    postsCache = [];
    return postsCache;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const posts: BlogPostFull[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const record = data as Record<string, unknown>;
    const slug = String(record.slug ?? path.basename(file, ".md")).trim();
    if (!slug) continue;

    const summary = toSummary(slug, record, content);
    posts.push({ ...summary, content: content.trim() });
  }

  posts.sort(
    (a, b) =>
      (Number.isNaN(Date.parse(b.dateISO)) ? 0 : Date.parse(b.dateISO)) -
        (Number.isNaN(Date.parse(a.dateISO)) ? 0 : Date.parse(a.dateISO)) ||
      b.slug.localeCompare(a.slug)
  );
  postsCache = posts;
  return postsCache;
}

export function getBlogPostSummaries(): BlogPostSummary[] {
  return getAllBlogPosts().map(
    ({ content: _c, ...summary }) => summary
  );
}

export function getBlogPostBySlug(slug: string): BlogPostFull | undefined {
  return getAllBlogPosts().find((p) => p.slug === slug);
}

export function getRelatedPosts(
  slug: string,
  category: string,
  categories: string[],
  limit = 3
): BlogPostSummary[] {
  const all = getAllBlogPosts().filter((p) => p.slug !== slug);
  const matchKeys = new Set([category, ...categories]);
  const scored = all.map((p) => {
    const overlap = p.categories.filter((c) => matchKeys.has(c)).length;
    return { p, overlap };
  });
  scored.sort((a, b) => {
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    return Date.parse(b.p.dateISO) - Date.parse(a.p.dateISO);
  });
  return scored
    .filter((s) => s.overlap > 0)
    .slice(0, limit)
    .map(({ p }) => {
      const { content: _c, ...rest } = p;
      return rest;
    });
}

export function postMatchesFilter(
  post: Pick<BlogPostSummary, "categories">,
  filter: string
): boolean {
  if (filter === "All") return true;
  return post.categories.includes(filter);
}

export function absoluteBlogImageUrl(
  image: string,
  baseUrl: string
): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  const origin = baseUrl.replace(/\/$/, "");
  const pathPart = image.startsWith("/") ? image : `/${image}`;
  return `${origin}${pathPart}`;
}
