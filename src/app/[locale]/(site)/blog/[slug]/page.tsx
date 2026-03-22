import type { Metadata } from "next";
import { displayReadMinutesForPost } from "@/lib/blog/read-time";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  absoluteBlogImageUrl,
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/blog/load-posts";
import { getSiteImageWithFallback } from "@/lib/images/get-site-image";
import { MarkdownBody } from "./MarkdownBody";
import { ShareButtons } from "./ShareButtons";
import { BlogCard } from "@/components/blog/BlogCard";

type Props = { params: Promise<{ slug: string }> };

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").replace(/\/$/, "");

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Blog | Tinies" };

  const imageResolved = await getSiteImageWithFallback(`blog-${slug}`, post.image);
  const ogImage = absoluteBlogImageUrl(imageResolved, BASE_URL);
  return {
    title: `${post.title} | Tinies`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.dateISO,
      authors: [post.author],
      url: `${BASE_URL}/blog/${post.slug}`,
      ...(ogImage ? { images: [{ url: ogImage, alt: post.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const imageResolved = await getSiteImageWithFallback(`blog-${slug}`, post.image);
  const postForView = { ...post, image: imageResolved };
  const ogImage = absoluteBlogImageUrl(imageResolved, BASE_URL);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.dateISO,
    author: {
      "@type": "Organization",
      name: post.author,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Tinies",
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    ...(ogImage ? { image: [ogImage] } : {}),
  };

  const relatedRaw = getRelatedPosts(slug, post.category, post.categories, 3);
  const related = await Promise.all(
    relatedRaw.map(async (r) => ({
      ...r,
      image: await getSiteImageWithFallback(`blog-${r.slug}`, r.image),
    }))
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="mx-auto max-w-[720px] px-4 py-16 sm:px-6 sm:py-20">
        <Link
          href="/blog"
          className="text-sm font-medium hover:underline"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
        >
          ← Back to blog
        </Link>

        <header className="mt-6">
          <span
            className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--color-primary-50)",
              color: "var(--color-primary)",
              borderColor: "var(--color-primary-200)",
            }}
          >
            {post.category}
          </span>
          <h1
            className="mt-4 font-normal leading-tight sm:text-4xl"
            style={{
              fontFamily: "var(--font-heading), serif",
              fontSize: "var(--text-3xl)",
              color: "var(--color-text)",
            }}
          >
            {post.title}
          </h1>
          <div
            className="mt-4 flex flex-wrap items-center gap-2 text-sm"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.dateISO}>{post.dateDisplay}</time>
            <span aria-hidden>·</span>
            <span>{displayReadMinutesForPost(post)} min read</span>
          </div>
        </header>

        {postForView.image ? (
          <div
            className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] border"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Image
              src={postForView.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              priority
            />
          </div>
        ) : null}

        <div className="mt-10">
          <MarkdownBody content={post.content} />
        </div>

        <ShareButtons title={post.title} url={postUrl} />

        {related.length > 0 ? (
          <section className="mt-16 border-t pt-12" style={{ borderColor: "var(--color-border)" }}>
            <h2
              className="text-xl font-normal"
              style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
            >
              Related posts
            </h2>
            <ul className="mt-8 grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <BlogCard post={r} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          className="mt-16 rounded-[var(--radius-lg)] border p-8"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h2
            className="text-xl font-normal"
            style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
          >
            Every booking helps a tiny.
          </h2>
          <p
            className="mt-2 leading-relaxed"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            Find trusted pet care or browse adoptable animals at tinies.app.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "var(--text-base)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              Find pet care
            </Link>
            <Link
              href="/adopt"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] border-2 bg-transparent px-6 font-semibold transition-opacity hover:opacity-90"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "var(--text-base)",
                borderColor: "var(--color-primary)",
                color: "var(--color-primary)",
              }}
            >
              Browse adoptions
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
