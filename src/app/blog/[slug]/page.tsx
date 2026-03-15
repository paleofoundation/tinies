import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getReadTimeMinutes,
  BLOG_POSTS,
} from "@/lib/constants/blog-posts";
import { MarkdownBody } from "./MarkdownBody";
import { ShareButtons } from "./ShareButtons";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Blog | Tinies" };
  return {
    title: `${post.title} | Tinies Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
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
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const readMins = getReadTimeMinutes(post.content);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <article className="mx-auto max-w-[720px] px-4 py-20 sm:px-6 sm:py-24">
        <Link
          href="/blog"
          className="text-sm font-medium text-[#6B7280] hover:text-[#0A6E5C] hover:underline"
          style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
        >
          ← Back to blog
        </Link>

        <header className="mt-6">
          <span className="rounded-[999px] bg-[#0A6E5C]/15 px-2.5 py-0.5 text-xs font-medium text-[#0A6E5C]">
            {post.category}
          </span>
          <h1
            className="mt-3 text-3xl font-normal leading-tight text-[#1B2432] sm:text-4xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{post.author}</span>
            <span>·</span>
            <span>{readMins} min read</span>
          </div>
        </header>

        <div className="mt-10 leading-[1.75]">
          <MarkdownBody content={post.content} />
        </div>

        <ShareButtons title={post.title} url={postUrl} />

        <section className="mt-16 rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <h2
            className="text-xl font-normal text-[#1B2432]"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            No matter the size
          </h2>
          <p className="mt-2 text-[#6B7280] leading-relaxed">
            Find trusted pet care in Cyprus or start your adoption journey. Join Tinies today.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-[999px] bg-[#0A6E5C] px-5 h-12 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              Find pet care
            </Link>
            <Link
              href="/adopt"
              className="inline-flex items-center justify-center rounded-[999px] border-2 border-[#0A6E5C] bg-transparent px-5 h-12 font-semibold text-[#0A6E5C] transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              Browse adoptions
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
