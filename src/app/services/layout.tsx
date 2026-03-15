import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Pet Care Services | Tinies",
    template: "%s | Tinies",
  },
  description:
    "Find trusted pet care in Cyprus. Dog walking, sitting, boarding, drop-ins, and daycare from verified providers.",
};

export default function ServicesLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
