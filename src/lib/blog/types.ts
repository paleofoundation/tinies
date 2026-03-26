export const BLOG_FILTER_CATEGORIES = [
  "All",
  "Pet Care",
  "Adoption",
  "Rescue Stories",
  "Cyprus Guide",
  "Business & Platform",
] as const;

export type BlogFilterCategory = (typeof BLOG_FILTER_CATEGORIES)[number];

export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  /** Optional; used for meta/OG description when set, otherwise `excerpt` is used. */
  seoDescription: string;
  excerptDisplay: string;
  dateISO: string;
  dateDisplay: string;
  category: string;
  categories: string[];
  author: string;
  image: string;
  readTimeMinutes: number;
};

export type BlogPostFull = BlogPostSummary & {
  content: string;
};
