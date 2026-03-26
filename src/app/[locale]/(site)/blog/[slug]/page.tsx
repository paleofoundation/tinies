import type { Metadata } from "next";
import { displayReadMinutesForPost } from "@/lib/blog/read-time";
import Image from "next/image";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogStayConnectedCTA } from "@/components/blog/BlogStayConnectedCTA";
import { PageContainer, Section } from "@/components/theme";
import { formatBlogDateCompact } from "@/lib/blog/format-blog-date";
import { notFound } from "next/navigation";
import {
  absoluteBlogImageUrl,
  blogCategoryDisplayLabel,
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/blog/load-posts";
import { getSiteImageWithFallback } from "@/lib/images/get-site-image";
import { Link } from "@/i18n/navigation";
import { MarkdownBody } from "./MarkdownBody";
import { ShareButtons } from "./ShareButtons";

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
  const metaDescription = post.seoDescription.trim() || post.excerpt;
  return {
    title: `${post.title} | Tinies`,
    description: metaDescription,
    openGraph: {
      title: post.title,
      description: metaDescription,
      type: "article",
      publishedTime: post.dateISO,
      authors: [post.author],
      url: `${BASE_URL}/blog/${post.slug}`,
      ...(ogImage ? { images: [{ url: ogImage, alt: post.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: metaDescription,
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
  const categoryLabel = blogCategoryDisplayLabel(post.category).toUpperCase();
  const dateCompact = formatBlogDateCompact(post.dateISO);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription.trim() || post.excerpt,
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
      <Section className="border-b border-[var(--color-border)]" background="background" padded>
        <PageContainer>
          <div className="mx-auto max-w-[720px]">
            <Link
              href="/blog"
              className="text-sm font-semibold hover:underline"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
            >
              ← Back to blog
            </Link>

            <header className="mt-6">
              <p
                className="theme-eyebrow"
                style={{ color: "var(--color-secondary)", fontFamily: "var(--font-display), sans-serif" }}
              >
                {categoryLabel}
              </p>
              <h1
                className="mt-4 font-bold leading-[1.12] tracking-tight text-[var(--color-text)]"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
                }}
              >
                {post.title}
              </h1>
              <div
                className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
              >
                <span>{post.author}</span>
                <span aria-hidden>·</span>
                <time dateTime={post.dateISO}>{dateCompact}</time>
                <span aria-hidden>·</span>
                <span>{displayReadMinutesForPost(post)} min read</span>
              </div>
            </header>
          </div>
        </PageContainer>
      </Section>

      <article className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-14">
        {postForView.image ? (
          <div
            className="relative mt-2 aspect-[16/9] overflow-hidden border"
            style={{
              borderColor: "var(--color-neutral-200)",
              borderRadius: "var(--blog-card-radius)",
            }}
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
              className="font-black uppercase tracking-tight text-[var(--color-text)]"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              }}
            >
              Related posts
            </h2>
            <ul className="mt-8 grid list-none gap-8 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <BlogCard post={r} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>

      <BlogStayConnectedCTA />
    </div>
  );
}
