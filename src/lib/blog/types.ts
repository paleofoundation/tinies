export const BLOG_FILTER_CATEGORIES = [
  "All",
  "Pet Care",
  "Adoption",
  "Rescue Stories",
  "Cyprus Guide",
] as const;

export type BlogFilterCategory = (typeof BLOG_FILTER_CATEGORIES)[number];

export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
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
