import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogFeaturedPost } from "@/components/blog/BlogFeaturedPost";
import { BlogStayConnectedCTA } from "@/components/blog/BlogStayConnectedCTA";
import { PageContainer } from "@/components/theme";
import { getBlogPostSummaries, postMatchesFilter } from "@/lib/blog/load-posts";
import { getSiteImageWithFallback } from "@/lib/images/get-site-image";
import { BLOG_FILTER_CATEGORIES, type BlogFilterCategory } from "@/lib/blog/types";
import { Link } from "@/i18n/navigation";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "The Tinies Blog",
  description:
    "Pet care tips, adoption stories, and rescue updates from Cyprus — guides for pet owners and adopters from the Tinies team.",
  openGraph: {
    title: "The Tinies Blog | Tinies",
    description: "Pet care tips, adoption stories, and rescue updates from Cyprus.",
    url: `${BASE_URL}/blog`,
    type: "website",
    siteName: "Tinies",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Tinies Blog | Tinies",
    description: "Pet care tips, adoption stories, and rescue updates from Cyprus.",
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

  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      {/* Hero — editorial mock */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
        <PageContainer>
          <p
            className="theme-eyebrow mb-4"
            style={{ color: "var(--color-secondary)", fontFamily: "var(--font-display), sans-serif" }}
          >
            Stories & insights
          </p>
          <h1
            className="font-black uppercase leading-[0.92] tracking-tight"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            <span
              className="block text-[var(--color-text)]"
              style={{ fontSize: "clamp(2.25rem, 7vw, 4.25rem)" }}
            >
              The Tinies
            </span>
            <span
              className="block text-[var(--color-primary)]"
              style={{ fontSize: "clamp(2.25rem, 7vw, 4.25rem)" }}
            >
              Blog
            </span>
          </h1>
          <p
            className="mt-6 max-w-xl text-base leading-[1.75] sm:text-lg"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            Pet care tips, adoption stories, and rescue updates from Cyprus.
          </p>
        </PageContainer>
      </header>

      {/* Category bar */}
      <div
        className="w-full border-b border-[var(--color-border)]"
        style={{ backgroundColor: "var(--blog-filter-bar-bg)" }}
      >
        <PageContainer className="py-4 sm:py-5">
          <nav className="flex flex-wrap gap-2 sm:gap-2.5" aria-label="Filter by category">
            {BLOG_FILTER_CATEGORIES.map((cat) => {
              const isActive = cat === activeFilter;
              const href = cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className="rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold transition-colors"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    border: isActive ? "1px solid transparent" : "1px solid var(--color-neutral-200)",
                    backgroundColor: isActive ? "var(--color-primary)" : "#ffffff",
                    color: isActive ? "#ffffff" : "var(--color-neutral-700)",
                  }}
                >
                  {cat}
                </Link>
              );
            })}
          </nav>
        </PageContainer>
      </div>

      <main className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <PageContainer>
          {posts.length === 0 ? (
            <p
              className="mx-auto max-w-md text-center text-sm"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
            >
              No posts in this category yet.{" "}
              <Link href="/blog" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                View all posts
              </Link>
            </p>
          ) : (
            <>
              {featured ? <BlogFeaturedPost post={featured} /> : null}
              {rest.length > 0 ? (
                <ul className="grid list-none grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                  {rest.map((post) => (
                    <li key={post.slug}>
                      <BlogCard post={post} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </PageContainer>
      </main>

      <BlogStayConnectedCTA />
    </div>
  );
}
