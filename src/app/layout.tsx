import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

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

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body
        className="min-h-screen antialiased flex flex-col"
        style={{
          fontFamily: "var(--font-body), sans-serif",
          backgroundColor: "var(--color-background)",
          color: "var(--color-text)",
        }}
      >
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
