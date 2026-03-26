import Image from "next/image";
import Link from "next/link";
import { displayReadMinutesForPost } from "@/lib/blog/read-time";
import { formatBlogDateCompact } from "@/lib/blog/format-blog-date";
import { blogCategoryDisplayLabel } from "@/lib/blog/load-posts";
import type { BlogPostSummary } from "@/lib/blog/types";

type Props = {
  post: BlogPostSummary;
};

export function BlogCard({ post }: Props) {
  const readMinutes = displayReadMinutesForPost(post);
  const dateLine = formatBlogDateCompact(post.dateISO);
  const categoryLabel = blogCategoryDisplayLabel(post.category).toUpperCase();

  return (
    <article
      className="flex h-full flex-col overflow-hidden border transition-shadow duration-200 hover:shadow-[var(--shadow-md)]"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-neutral-200)",
        borderRadius: "var(--blog-card-radius)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-[var(--color-neutral-100)]"
        style={{ borderRadius: "var(--blog-card-radius) var(--blog-card-radius) 0 0" }}
      >
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold leading-snug"
            aria-hidden
            style={{
              fontFamily: "var(--font-display), sans-serif",
              backgroundColor: "var(--color-secondary-100)",
              color: "var(--color-secondary)",
            }}
          >
            {post.title}
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
        <span
          className="w-fit rounded-[var(--radius-pill)] px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            backgroundColor: "var(--color-secondary-100)",
            color: "var(--color-secondary)",
          }}
        >
          {categoryLabel}
        </span>
        <h2
          className="mt-3 text-lg font-bold leading-snug tracking-tight sm:text-xl"
          style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-text)" }}
        >
          <Link href={`/blog/${post.slug}`} className="hover:opacity-85">
            {post.title}
          </Link>
        </h2>
        <p
          className="mt-2 flex-1 text-sm leading-relaxed line-clamp-3"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
        >
          {post.excerptDisplay}
        </p>
        <div
          className="mt-4 flex items-center justify-between gap-3 border-t pt-4"
          style={{ borderColor: "var(--color-neutral-200)" }}
        >
          <p
            className="min-w-0 text-xs"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
          >
            <time dateTime={post.dateISO}>{dateLine}</time>
            <span aria-hidden className="mx-1">
              ·
            </span>
            <span>{readMinutes} min read</span>
          </p>
          <Link
            href={`/blog/${post.slug}`}
            className="shrink-0 text-sm font-bold hover:underline"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}
