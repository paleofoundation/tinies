import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Tinies",
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
