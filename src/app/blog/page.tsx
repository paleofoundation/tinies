import Link from "next/link";
import { BLOG_POSTS, getReadTimeMinutes } from "@/lib/constants/blog-posts";

export const metadata = {
  title: "Blog | Tinies",
  description: "Stories and tips about pet care, adoption, and the Tinies community.",
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 sm:py-20">
        <h1
          className="text-3xl font-normal text-[#1B2432] sm:text-4xl"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          Blog
        </h1>
        <p className="mt-2 text-[#6B7280] max-w-xl" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
          Stories and tips about pet care, adoption, and our community.
        </p>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => {
            const readMins = getReadTimeMinutes(post.content);
            return (
              <li key={post.slug}>
                <article className="h-full rounded-[14px] border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_20px_44px_rgba(15,23,42,0.1)]">
                  <span className="rounded-[999px] bg-[#0A6E5C]/15 px-2.5 py-0.5 text-xs font-medium text-[#0A6E5C]">
                    {post.category}
                  </span>
                  <h2 className="mt-3 text-xl font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>
                    <Link href={`/blog/${post.slug}`} className="hover:opacity-80">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-[#6B7280] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                    <span>·</span>
                    <span>{readMins} min read</span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-[#0A6E5C] hover:underline"
                    style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                  >
                    Read more →
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
