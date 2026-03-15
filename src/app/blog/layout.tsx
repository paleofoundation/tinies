import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Tinies",
  description: "News, adoption guides, and stories from the world of Tinies.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
