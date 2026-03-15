import Link from "next/link";
import { blogPosts } from "@/lib/constants/blog-posts";

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 sm:py-20" style={{ maxWidth: "var(--max-width)" }}>
        <header className="text-center">
          <h1
            className="font-normal sm:text-4xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            Stories & Guides
          </h1>
          <p className="mt-2 mx-auto max-w-xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            News, guides, and stories from the world of Tinies.
          </p>
        </header>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <article className="h-full rounded-[var(--radius-lg)] border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
                <span className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)", borderColor: "var(--color-primary-200)" }}>
                  {post.category}
                </span>
                <h2 className="mt-3 text-xl font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                  <Link href={`/blog/${post.slug}`} className="hover:opacity-80">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed line-clamp-3" style={{ color: "var(--color-text-secondary)" }}>
                  {post.excerpt}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex items-center text-sm font-semibold hover:underline"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
                >
                  Read more →
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
