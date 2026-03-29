import type { Metadata } from "next";
import { BlogIndexPostCard } from "@/components/blog/BlogIndexPostCard";
import { BlogFeaturedPost } from "@/components/blog/BlogFeaturedPost";
import { BlogStayConnectedCTA } from "@/components/blog/BlogStayConnectedCTA";
import { getBlogPostSummaries, postMatchesFilter } from "@/lib/blog/load-posts";
import { getSiteImageUrlsForKeys } from "@/lib/images/get-site-image";
import { BLOG_FILTER_CATEGORIES, type BlogFilterCategory } from "@/lib/blog/types";
import { Link } from "@/i18n/navigation";
import { getCanonicalSiteOrigin } from "@/lib/constants/site-url";
import { cn } from "@/lib/utils";

import "./blog-editorial.css";

const BASE_URL = getCanonicalSiteOrigin();

const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

export const metadata: Metadata = {
  title: "The Tinies Blog",
  description:
    "Pet care tips, adoption stories, and rescue updates from Cyprus — guides for pet owners and adopters from the Tinies team.",
  alternates: { canonical: `${BASE_URL}/blog` },
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
  const blogKeys = allPostsRaw.map((p) => `blog-${p.slug}`);
  const siteImgMap = await getSiteImageUrlsForKeys(blogKeys);
  const allPosts = allPostsRaw.map((p) => {
    const admin = siteImgMap.get(`blog-${p.slug}`)?.trim();
    const fb = p.image.trim();
    return { ...p, image: admin || fb || "" };
  });
  const posts =
    activeFilter === "All"
      ? allPosts
      : allPosts.filter((p) => postMatchesFilter(p, activeFilter));

  const isAll = activeFilter === "All";
  const featuredPost = isAll && allPosts.length > 0 ? allPosts[0] : null;
  const gridPosts = isAll ? allPosts.slice(1) : posts;

  const totalPublished = allPosts.length;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <section
        className="border-b bg-[var(--color-background)]"
        style={{ borderColor: BORDER_TEAL_15 }}
      >
        <div
          className={HOME_INNER}
          style={{
            paddingTop: "clamp(3rem, 6vw, 5rem)",
            paddingBottom: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          <p
            className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-secondary)" }}
          >
            Stories & insights
          </p>
          <h1
            className="mt-4 font-black uppercase leading-[0.94] tracking-[-0.04em]"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
            }}
          >
            <span className="block" style={{ color: "#1C1C1C" }}>
              the tinies
            </span>
            <span className="block" style={{ color: "#0A8080" }}>
              blog
            </span>
          </h1>
          <p
            className="mt-5 max-w-[520px] text-[1.125rem] leading-[1.7]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
          >
            Pet care tips, adoption stories, and rescue updates from Cyprus.
          </p>
          <p
            className="mt-4 text-[0.8125rem]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.5)" }}
          >
            {totalPublished} articles published
          </p>
        </div>
      </section>

      <div
        className="w-full border-b"
        style={{
          borderColor: BORDER_TEAL_15,
          backgroundColor: "var(--color-primary-50)",
        }}
      >
        <nav
          className={`${HOME_INNER} flex gap-2 overflow-x-auto py-4`}
          style={{ WebkitOverflowScrolling: "touch" }}
          aria-label="Filter by category"
        >
          {BLOG_FILTER_CATEGORIES.map((cat) => {
            const isActive = cat === activeFilter;
            const href = cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`;
            return (
              <Link
                key={cat}
                href={href}
                scroll={false}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-[18px] py-2 text-[0.8125rem] font-semibold transition-colors",
                  isActive
                    ? "border border-[#0A8080] bg-[#0A8080] text-white"
                    : "border border-[rgba(10,128,128,0.15)] bg-white text-[rgba(28,28,28,0.7)] hover:border-[#0A8080] hover:text-[#0A8080]",
                )}
                style={{ fontFamily: "var(--font-body), sans-serif" }}
              >
                {cat}
              </Link>
            );
          })}
        </nav>
      </div>

      {featuredPost ? <BlogFeaturedPost post={featuredPost} /> : null}
      {featuredPost ? (
        <div className="border-t" style={{ borderColor: BORDER_TEAL_15 }} aria-hidden />
      ) : null}

      <section
        className="bg-[var(--color-background)]"
        style={{ paddingBlock: "clamp(4rem, 8vw, 8rem)" }}
      >
        <div className={HOME_INNER}>
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
              {!isAll ? (
                <div className="mb-10">
                  <h2
                    className="font-black uppercase leading-[0.94] tracking-[-0.04em]"
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                      color: "#0A8080",
                    }}
                  >
                    {activeFilter}
                  </h2>
                  <div
                    className="mt-3 h-1 w-16 rounded-sm"
                    style={{ backgroundColor: "var(--color-secondary)" }}
                    aria-hidden
                  />
                  <p
                    className="mt-3 text-[0.8125rem]"
                    style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.5)" }}
                  >
                    {posts.length} article{posts.length !== 1 ? "s" : ""}
                  </p>
                </div>
              ) : null}
              {gridPosts.length > 0 ? (
                <ul className="grid list-none grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3">
                  {gridPosts.map((post, i) => (
                    <li key={post.slug}>
                      <BlogIndexPostCard post={post} animationDelaySec={i * 0.05} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>
      </section>

      <BlogStayConnectedCTA />
    </div>
  );
}
