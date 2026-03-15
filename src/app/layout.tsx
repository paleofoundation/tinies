import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tinies - Trusted Pet Care & Rescue Adoption in Cyprus",
  description:
    "No matter the size. Book verified pet care or adopt a rescue animal in Cyprus.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body
        className="min-h-screen bg-[#F7F7F8] text-[#1B2432] antialiased flex flex-col"
        style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
      >
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
