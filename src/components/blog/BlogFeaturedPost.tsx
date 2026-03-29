import Image from "next/image";
import Link from "next/link";
import { displayReadMinutesForPost } from "@/lib/blog/read-time";
import { formatBlogDateCompact } from "@/lib/blog/format-blog-date";
import { blogCategoryDisplayLabel } from "@/lib/blog/load-posts";
import type { BlogPostSummary } from "@/lib/blog/types";

const BORDER_TEAL = "rgba(10, 128, 128, 0.15)";
const SHADOW_LG = "0 8px 32px rgba(10, 128, 128, 0.1)";

function FeaturedArrowIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
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
};

export function BlogFeaturedPost({ post }: Props) {
  const readMinutes = displayReadMinutesForPost(post);
  const dateLine = formatBlogDateCompact(post.dateISO);
  const categoryLabel = blogCategoryDisplayLabel(post.category);

  return (
    <section className="bg-[var(--color-background)]">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-[clamp(3rem,6vw,5rem)] lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <Link
            href={`/blog/${post.slug}`}
            className="blog-editorial-feature-wrap relative block h-[clamp(280px,30vw,440px)] overflow-hidden rounded-[24px]"
            style={{ boxShadow: SHADOW_LG }}
          >
            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="blog-editorial-feature-img object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center px-6 text-center text-lg font-semibold leading-snug"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  backgroundColor: "var(--color-primary-50)",
                  color: "var(--color-primary)",
                }}
              >
                {post.title}
              </div>
            )}
          </Link>

          <div className="blog-editorial-fade-up min-w-0">
            <p
              className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
              style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-secondary)" }}
            >
              {categoryLabel}
            </p>
            <h2
              className="mt-4 text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold leading-[1.15]"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="transition-colors hover:text-[var(--color-primary)]"
              >
                {post.title}
              </Link>
            </h2>
            <p
              className="mt-4 text-base leading-[1.8]"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
            >
              {post.excerptDisplay}
            </p>
            <div
              className="mt-5 flex items-center gap-4 text-[0.8125rem]"
              style={{ color: "rgba(28, 28, 28, 0.5)" }}
            >
              <time dateTime={post.dateISO}>{dateLine}</time>
              <span
                className="size-1 shrink-0 rounded-full"
                style={{ backgroundColor: BORDER_TEAL }}
                aria-hidden
              />
              <span>{readMinutes} min read</span>
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="group/read mt-6 inline-flex items-center gap-2 text-[0.875rem] font-bold transition-all duration-200 ease-out group-hover/read:gap-3"
              style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
            >
              Read article
              <FeaturedArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
