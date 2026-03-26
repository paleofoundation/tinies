import Image from "next/image";
import Link from "next/link";
import { displayReadMinutesForPost } from "@/lib/blog/read-time";
import { formatBlogDateCompact } from "@/lib/blog/format-blog-date";
import { blogCategoryDisplayLabel } from "@/lib/blog/load-posts";
import type { BlogPostSummary } from "@/lib/blog/types";

type Props = {
  post: BlogPostSummary;
};

export function BlogFeaturedPost({ post }: Props) {
  const readMinutes = displayReadMinutesForPost(post);
  const dateLine = formatBlogDateCompact(post.dateISO);
  const categoryLabel = blogCategoryDisplayLabel(post.category).toUpperCase();

  return (
    <article className="mb-16 lg:mb-20">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 lg:gap-x-14">
        <Link
          href={`/blog/${post.slug}`}
          className="relative block aspect-[16/10] overflow-hidden lg:aspect-[5/4]"
          style={{ borderRadius: "var(--blog-card-radius)" }}
        >
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center px-6 text-center text-lg font-semibold leading-snug text-[var(--color-primary)]"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                backgroundColor: "var(--color-primary-50)",
              }}
            >
              {post.title}
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-col lg:py-2">
          <p
            className="theme-eyebrow mb-3"
            style={{ color: "var(--color-secondary)", fontFamily: "var(--font-display), sans-serif" }}
          >
            {categoryLabel}
          </p>
          <h2
            className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2rem] lg:leading-[1.15]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-text)" }}
          >
            <Link href={`/blog/${post.slug}`} className="hover:opacity-85">
              {post.title}
            </Link>
          </h2>
          <p
            className="mt-4 line-clamp-4 text-base leading-relaxed sm:text-lg"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            {post.excerptDisplay}
          </p>
          <p
            className="mt-5 text-sm"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
          >
            <time dateTime={post.dateISO}>{dateLine}</time>
            <span aria-hidden className="mx-2">
              •
            </span>
            <span>
              {readMinutes} min read
            </span>
          </p>
          <Link
            href={`/blog/${post.slug}`}
            className="mt-6 inline-flex w-fit text-sm font-bold hover:underline"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}
          >
            Read article →
          </Link>
        </div>
      </div>
    </article>
  );
}
