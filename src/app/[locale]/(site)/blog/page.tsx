import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/BlogCard";
import { SectionHeader } from "@/components/marketing";
import { PageContainer, Section } from "@/components/theme";
import { getBlogPostSummaries, postMatchesFilter } from "@/lib/blog/load-posts";
import { getSiteImageWithFallback } from "@/lib/images/get-site-image";
import { BLOG_FILTER_CATEGORIES, type BlogFilterCategory } from "@/lib/blog/types";
import { Link } from "@/i18n/navigation";

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
      <Section
        className="theme-paper-grid border-b border-[var(--color-border)]"
        background="background"
        padded
      >
        <PageContainer>
          <SectionHeader
            align="center"
            eyebrow="Stories & guides"
            title="The Tinies Blog"
            description="Pet care tips, adoption stories, and rescue updates from Cyprus."
            className="mx-auto max-w-2xl"
          />
        </PageContainer>
      </Section>

      <main>
        <Section background="surface" padded className="border-b border-[var(--color-border)]">
          <PageContainer>
            <nav
              className="flex max-w-4xl flex-wrap justify-center gap-2"
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
          </PageContainer>
        </Section>
      </main>
    </div>
  );
}
