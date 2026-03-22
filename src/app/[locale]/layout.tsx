import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { Roboto } from "next/font/google";
import { getSiteImageWithFallback } from "@/lib/images/get-site-image";
import { Toaster } from "sonner";
import { FeedbackShell } from "@/components/feedback/FeedbackShell";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { shouldShowBetaFeedbackUI } from "@/lib/feedback/should-show-beta-ui";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

const roboto = Roboto({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "greek", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const DEFAULT_OG_IMAGE =
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const [ogUrl, faviconUrl] = await Promise.all([
    getSiteImageWithFallback("og-default", DEFAULT_OG_IMAGE),
    getSiteImageWithFallback("favicon", "/favicon.png"),
  ]);
  const og = ogUrl.trim();
  const fav = faviconUrl.trim() || "/favicon.png";
  const isPng = fav.toLowerCase().endsWith(".png");
  return {
    ...(og ? { openGraph: { images: [{ url: og }] }, twitter: { images: [og] } } : {}),
    icons: {
      icon: [{ url: fav, sizes: "32x32", type: isPng ? "image/png" : "image/x-icon" }],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const showBetaUI = shouldShowBetaFeedbackUI();
  let defaultFeedbackEmail: string | null = null;
  if (showBetaUI) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    defaultFeedbackEmail = user?.email ?? null;
  }

  return (
    <html lang={locale} className={roboto.variable} suppressHydrationWarning>
      <body
        className="flex min-h-screen flex-col antialiased"
        style={{
          fontFamily: "var(--font-body), sans-serif",
          backgroundColor: "var(--color-background)",
          color: "var(--color-text)",
        }}
      >
        <NextIntlClientProvider messages={messages}>
          <FeedbackShell showBetaUI={showBetaUI} defaultEmail={defaultFeedbackEmail}>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </FeedbackShell>
          <Toaster position="top-center" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
