import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const metadata: Metadata = {
  title: "Search Pet Care Providers",
  description:
    "Find verified dog walkers, pet sitters, and boarders in Cyprus. Filter by service, district, price, and rating.",
  openGraph: {
    title: "Search Pet Care Providers | Tinies",
    description: "Find verified dog walkers, pet sitters, and boarders in Cyprus. Filter by service, district, price, and rating.",
    url: `${BASE_URL}/services/search`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Search Pet Care Providers | Tinies", description: "Find verified dog walkers, pet sitters, and boarders in Cyprus." },
};

export default function SearchLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
