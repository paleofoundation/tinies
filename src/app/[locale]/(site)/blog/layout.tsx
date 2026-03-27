import type { Metadata } from "next";

/**
 * Route group `(site)` keeps this tree sorted before `[serviceType]/[district]`.
 * Otherwise `/en/blog/my-post` is captured as serviceType=blog and shows a soft 404.
 */

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Pet care tips, adoption stories, and rescue updates from Cyprus — the Tinies blog.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
