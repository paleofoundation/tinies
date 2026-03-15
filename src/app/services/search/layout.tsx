import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Pet Care Providers | Tinies",
  description:
    "Find verified dog walkers, pet sitters, and boarders in Cyprus. Filter by service, district, price, and rating.",
};

export default function SearchLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
