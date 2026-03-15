import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, blogPosts } from "@/lib/constants/blog-posts";
import { MarkdownBody } from "./MarkdownBody";
import { ShareButtons } from "./ShareButtons";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog | Tinies" };
  return {
    title: `${post.title} | Tinies Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <article className="mx-auto max-w-[720px] px-4 py-20 sm:px-6 sm:py-24">
        <Link
          href="/blog"
          className="text-sm font-medium hover:underline"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
        >
          ← Back to blog
        </Link>

        <header className="mt-6">
          <span className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)", borderColor: "var(--color-primary-200)" }}>
            {post.category}
          </span>
          <h1
            className="mt-3 font-normal leading-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        <div className="mt-10">
          <MarkdownBody content={post.content} />
        </div>

        <ShareButtons title={post.title} url={postUrl} />

        <section className="mt-16 rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <h2
            className="text-xl font-normal"
            style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
          >
            Every booking helps a tiny.
          </h2>
          <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Find trusted pet care or browse adoptable animals at tinies.app.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
            >
              Find pet care
            </Link>
            <Link
              href="/adopt"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] border-2 bg-transparent px-6 font-semibold transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              Browse adoptions
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
