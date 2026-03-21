import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { dashboardHrefForUser, roleFromDashboardHref } from "@/lib/utils/dashboard-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account settings | Tinies",
  description: "Manage your Tinies account preferences.",
};

const linkClass =
  "block rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90";
const linkBoxStyle = {
  borderColor: "var(--color-border)",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text)",
} as const;

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard/settings");
  }

  const [dbUser, providerProfile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    }),
    prisma.providerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    }),
  ]);
  const hasProviderProfile = !!providerProfile;
  const dashboardHref = dashboardHrefForUser(dbUser?.role, user.user_metadata?.role, hasProviderProfile);
  const roleForSections: UserRole = roleFromDashboardHref(dashboardHref);

  const sections: { href: string; label: string; description: string }[] = [
    { href: dashboardHref, label: "Dashboard", description: "Bookings, overview, and tools for your role." },
  ];

  if (roleForSections === "owner") {
    sections.push({
      href: "/dashboard/owner/giving",
      label: "Giving preferences",
      description: "Round-up donations and Tinies Giving options.",
    });
  }
  if (roleForSections === "provider") {
    sections.push({
      href: "/dashboard/provider/edit-profile",
      label: "Profile & services",
      description: "Update your public profile, services, and service area.",
    });
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main
        className="mx-auto px-4 py-16 sm:px-6"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <h1
          className="font-normal"
          style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "var(--text-2xl)",
            color: "var(--color-text)",
          }}
        >
          Account settings
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Manage preferences and profile. Use your dashboard for day-to-day activity.
        </p>

        <ul className="mt-10 flex max-w-lg flex-col gap-3">
          {sections.map(({ href, label, description }) => (
            <li key={href}>
              <Link href={href} className={linkClass} style={linkBoxStyle}>
                <span className="font-semibold">{label}</span>
                <span className="mt-1 block text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>
                  {description}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/dashboard/messages" className={linkClass} style={linkBoxStyle}>
              <span className="font-semibold">Messages</span>
              <span className="mt-1 block text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>
                Conversations with providers, owners, and rescues.
              </span>
            </Link>
          </li>
        </ul>

        <p className="mt-10">
          <Link href="/" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
