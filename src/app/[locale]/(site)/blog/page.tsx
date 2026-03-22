import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/BlogCard";
import { getBlogPostSummaries, postMatchesFilter } from "@/lib/blog/load-posts";
import { getSiteImageWithFallback } from "@/lib/images/get-site-image";
import { BLOG_FILTER_CATEGORIES, type BlogFilterCategory } from "@/lib/blog/types";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "The Tinies Blog | Tinies",
  description:
    "Pet care tips, adoption stories, and rescue updates from Cyprus — guides for pet owners and adopters from the Tinies team.",
  openGraph: {
    title: "The Tinies Blog | Tinies",
    description:
      "Pet care tips, adoption stories, and rescue updates from Cyprus.",
    url: `${BASE_URL}/blog`,
    type: "website",
    siteName: "Tinies",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Tinies Blog | Tinies",
    description:
      "Pet care tips, adoption stories, and rescue updates from Cyprus.",
  },
};

function isFilterCategory(v: string | undefined): v is BlogFilterCategory {
  return (
    v !== undefined &&
    (BLOG_FILTER_CATEGORIES as readonly string[]).includes(v)
  );
}

type SearchProps = { searchParams: Promise<{ category?: string }> };

export default async function BlogIndexPage({ searchParams }: SearchProps) {
  const { category: raw } = await searchParams;
  const activeFilter: BlogFilterCategory =
    raw && raw !== "All" && isFilterCategory(raw) ? raw : "All";

  const allPostsRaw = getBlogPostSummaries();
  const allPosts = await Promise.all(
    allPostsRaw.map(async (p) => ({
      ...p,
      image: await getSiteImageWithFallback(`blog-${p.slug}`, p.image),
    }))
  );
  const posts =
    activeFilter === "All"
      ? allPosts
      : allPosts.filter((p) => postMatchesFilter(p, activeFilter));

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main
        className="mx-auto px-4 py-16 sm:px-6 sm:py-20"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <header className="mx-auto max-w-3xl text-center">
          <h1
            className="font-normal sm:text-5xl"
            style={{
              fontFamily: "var(--font-heading), serif",
              fontSize: "var(--text-4xl)",
              color: "var(--color-text)",
            }}
          >
            The Tinies Blog
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-lg leading-relaxed"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              color: "var(--color-text-secondary)",
            }}
          >
            Pet care tips, adoption stories, and rescue updates from Cyprus.
          </p>
        </header>

        <nav
          className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-2"
          aria-label="Filter by category"
        >
          {BLOG_FILTER_CATEGORIES.map((cat) => {
            const isActive = cat === activeFilter;
            const href =
              cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`;
            return (
              <Link
                key={cat}
                href={href}
                className="rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  borderColor: isActive ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: isActive ? "var(--color-primary-50)" : "transparent",
                  color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                }}
              >
                {cat}
              </Link>
            );
          })}
        </nav>

        {posts.length === 0 ? (
          <p
            className="mx-auto mt-16 max-w-md text-center text-sm"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            No posts in this category yet.{" "}
            <Link href="/blog" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
              View all posts
            </Link>
          </p>
        ) : (
          <ul className="mt-12 grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
