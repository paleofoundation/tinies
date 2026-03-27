import Link from "next/link";
import { InviteCharityForm } from "./InviteCharityForm";

export const metadata = {
  title: "Invite Charity (Admin)",
  description: "Invite a charity to join Tinies Giving.",
};

export default function AdminInviteCharityPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-12 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        <Link
          href="/dashboard/admin"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          ← Admin dashboard
        </Link>
        <h1
          className="mt-6 font-normal"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          Invite Charity
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Create a charity profile and send an invite link so they can claim their dashboard.
        </p>
        <InviteCharityForm />
      </main>
    </div>
  );
}
