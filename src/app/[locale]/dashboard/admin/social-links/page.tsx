import Link from "next/link";
import { Share2 } from "lucide-react";
import { getSiteSocialUrlsForAdmin } from "@/lib/site-settings/actions";
import { SocialLinksAdminClient } from "./SocialLinksAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminSocialLinksPage() {
  const data = await getSiteSocialUrlsForAdmin();
  if (!data.ok) {
    return (
      <div className="min-h-screen px-4 py-16" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
        <p style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-error, #DC2626)" }}>{data.error}</p>
        <Link href="/dashboard/admin" className="mt-4 inline-block text-sm font-semibold underline" style={{ color: "var(--color-primary)" }}>
          Back to admin
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh" }}>
      <div className="mx-auto max-w-[var(--max-width)] px-4 pt-8 sm:px-6 lg:px-8">
        <Link href="/dashboard/admin" className="text-sm font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
          ← Admin dashboard
        </Link>
      </div>
      <header className="mx-auto max-w-[var(--max-width)] border-b px-4 pb-8 pt-6 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
            style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
            aria-hidden
          >
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
              Social links
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              Footer icons for LinkedIn, Facebook, X, and Instagram. Use full https URLs.
            </p>
          </div>
        </div>
      </header>
      <SocialLinksAdminClient initial={data.data} />
    </div>
  );
}
