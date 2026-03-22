import Link from "next/link";
import { adminListSiteImages } from "@/lib/images/site-image-actions";
import { SiteImagesAdminClient } from "./SiteImagesAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminSiteImagesPage() {
  const data = await adminListSiteImages();
  if ("error" in data) {
    return (
      <div className="min-h-screen px-4 py-16" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
        <p style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-error, #DC2626)" }}>{data.error}</p>
        <Link href="/dashboard/admin" className="mt-4 inline-block text-sm font-semibold underline" style={{ color: "var(--color-primary)" }}>
          Back to admin
        </Link>
      </div>
    );
  }

  const rows = data.map((r) => ({
    id: r.id,
    imageKey: r.imageKey,
    category: r.category,
    label: r.label,
    url: r.url,
    alt: r.alt,
    width: r.width,
    height: r.height,
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mx-auto max-w-[var(--max-width)] px-4 pt-8 sm:px-6 lg:px-8">
        <Link href="/dashboard/admin" className="text-sm font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
          ← Admin dashboard
        </Link>
      </div>
      <SiteImagesAdminClient initialRows={rows} />
    </div>
  );
}
