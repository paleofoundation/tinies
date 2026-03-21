import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

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
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster position="top-center" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
