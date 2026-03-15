/**
 * Static blog posts. Replace placeholder content with full article markdown.
 */
export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string; // ISO date e.g. "2025-03-14"
  category: string;
  author: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "welcome-to-tinies",
    title: "Welcome to Tinies",
    excerpt: "No matter the size – meet the pet care and adoption platform built for Cyprus and beyond.",
    content: `Placeholder content. Replace with full article markdown.

## Subheading example

You can use **bold**, *italic*, lists, and [links](https://tinies.app).

- Bullet one
- Bullet two

More paragraphs go here.`,
    date: "2025-03-14",
    category: "News",
    author: "Tinies Team",
  },
  {
    slug: "how-international-adoption-works",
    title: "How International Adoption Works",
    excerpt: "A short guide to adopting a rescue animal from Cyprus to your country.",
    content: `Placeholder content. Replace with full article markdown.`,
    date: "2025-03-10",
    category: "Adoption",
    author: "Tinies Team",
  },
  {
    slug: "finding-the-right-sitter",
    title: "Finding the Right Pet Sitter",
    excerpt: "Tips for choosing a trusted carer for your dog or cat in Cyprus.",
    content: `Placeholder content. Replace with full article markdown.`,
    date: "2025-03-05",
    category: "Pet Care",
    author: "Tinies Team",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Rough read time in minutes (avg ~200 words per minute). */
export function getReadTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
