import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getCanonicalSiteOrigin } from "@/lib/constants/site-url";
import "./globals.css";

const siteOrigin = getCanonicalSiteOrigin();

export const metadata: Metadata = {
  /** Per-page canonicals resolve from metadataBase + pathname; do not set a root canonical. */
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Tinies – Trusted Pet Care & Rescue Adoption in Cyprus",
    template: "%s | Tinies",
  },
  description:
    "No matter the size. Book verified pet care or adopt a rescue animal in Cyprus.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      "/icon",
    ],
    apple: "/apple-icon",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Tinies",
    title: "Tinies – Trusted Pet Care & Rescue Adoption in Cyprus",
    description: "No matter the size. Book verified pet care or adopt a rescue animal in Cyprus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tinies – Trusted Pet Care & Rescue Adoption in Cyprus",
    description: "No matter the size. Book verified pet care or adopt a rescue animal in Cyprus.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
