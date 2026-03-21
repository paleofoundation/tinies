import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tinies - Trusted Pet Care & Rescue Adoption in Cyprus",
    template: "%s | Tinies",
  },
  description:
    "No matter the size. Book verified pet care or adopt a rescue animal in Cyprus.",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://tinies.app",
    siteName: "Tinies",
    title: "Tinies - Trusted Pet Care & Rescue Adoption in Cyprus",
    description: "No matter the size. Book verified pet care or adopt a rescue animal in Cyprus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tinies - Trusted Pet Care & Rescue Adoption in Cyprus",
    description: "No matter the size. Book verified pet care or adopt a rescue animal in Cyprus.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
