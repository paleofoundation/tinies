import Image from "next/image";
import Link from "next/link";
import { displayReadMinutesForPost } from "@/lib/blog/read-time";
import type { BlogPostSummary } from "@/lib/blog/types";

type Props = {
  post: BlogPostSummary;
};

export function BlogCard({ post }: Props) {
  const readMinutes = displayReadMinutesForPost(post);
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-[var(--color-background)]">
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
            className="flex h-full w-full items-center justify-center text-4xl"
            aria-hidden
            style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
          >
            ✦
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <span
          className="w-fit rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "var(--color-primary-50)",
            color: "var(--color-primary)",
            borderColor: "var(--color-primary-200)",
          }}
        >
          {post.category}
        </span>
        <h2
          className="mt-3 text-xl font-normal leading-snug"
          style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
        >
          <Link href={`/blog/${post.slug}`} className="hover:opacity-80">
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
          className="mt-4 flex flex-wrap items-center gap-2 text-xs"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
        >
          <time dateTime={post.dateISO}>{post.dateDisplay}</time>
          <span aria-hidden>·</span>
          <span>
            {readMinutes} min read
          </span>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex text-sm font-semibold hover:underline"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
        >
          Read article →
        </Link>
      </div>
    </article>
  );
}
