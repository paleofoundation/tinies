import type { Metadata } from "next";

export const metadata: Metadata = {
  /** Root layout supplies `template: "%s | Tinies"` — use a plain segment title (no nested template, no trailing "| Tinies"). */
  title: "Pet Care Services",
  description:
    "Find trusted pet care in Cyprus. Dog walking, sitting, boarding, drop-ins, and daycare from verified providers.",
};

export default function ServicesLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
