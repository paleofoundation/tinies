import Image from "next/image";
import Link from "next/link";
import { displayReadMinutesForPost } from "@/lib/blog/read-time";
import { formatBlogDateCompact } from "@/lib/blog/format-blog-date";
import { blogCategoryDisplayLabel } from "@/lib/blog/load-posts";
import type { BlogPostSummary } from "@/lib/blog/types";

const BORDER_TEAL = "rgba(10, 128, 128, 0.15)";

function BlogCardArrowIcon() {
  return (
    <svg
      className="size-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.19l-3.72-3.72a.75.75 0 111.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type Props = {
  post: BlogPostSummary;
  animationDelaySec?: number;
};

export function BlogIndexPostCard({ post, animationDelaySec = 0 }: Props) {
  const readMinutes = displayReadMinutesForPost(post);
  const dateLine = formatBlogDateCompact(post.dateISO);
  const categoryLabel = blogCategoryDisplayLabel(post.category);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="blog-editorial-card-link blog-editorial-hover-lift blog-editorial-fade-up block overflow-hidden border bg-[var(--color-background)]"
      style={{
        borderColor: BORDER_TEAL,
        borderRadius: 0,
        animationDelay: `${animationDelaySec}s`,
      }}
    >
      <div className="relative h-[220px] w-full overflow-hidden bg-[var(--color-neutral-100)]">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="blog-editorial-card-img object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold leading-snug"
            aria-hidden
            style={{
              fontFamily: "var(--font-display), sans-serif",
              backgroundColor: "rgba(244, 93, 72, 0.08)",
              color: "var(--color-secondary)",
            }}
          >
            {post.title}
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="mb-3">
          <span
            className="inline-block rounded-full px-2.5 py-1 text-[0.6875rem] font-extrabold uppercase tracking-[0.08em]"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              color: "var(--color-secondary)",
              backgroundColor: "rgba(244, 93, 72, 0.08)",
            }}
          >
            {categoryLabel}
          </span>
        </div>
        <h2
          className="mb-2.5 line-clamp-2 text-[1.0625rem] font-bold leading-[1.3]"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
        >
          {post.title}
        </h2>
        <p
          className="mb-4 line-clamp-3 text-[0.8125rem] leading-[1.7]"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
        >
          {post.excerptDisplay}
        </p>
        <div
          className="flex items-center justify-between gap-3 border-t pt-4"
          style={{ borderColor: BORDER_TEAL }}
        >
          <p
            className="min-w-0 text-[0.75rem]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.5)" }}
          >
            <time dateTime={post.dateISO}>{dateLine}</time>
            <span aria-hidden className="mx-1">
              ·
            </span>
            <span>{readMinutes} min read</span>
          </p>
          <span
            className="inline-flex shrink-0 items-center gap-1 text-[0.75rem] font-bold"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
          >
            Read <BlogCardArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}
