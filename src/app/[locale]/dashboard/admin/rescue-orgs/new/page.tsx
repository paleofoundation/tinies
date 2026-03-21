import type { Metadata } from "next";
import Link from "next/link";
import { RescueOrgForm } from "../RescueOrgForm";

export const metadata: Metadata = {
  title: "Register Rescue Organisation | Admin | Tinies",
  description: "Create a new rescue organisation on Tinies.",
};

export default function NewRescueOrgPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-12 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        <Link
          href="/dashboard/admin"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          ← Admin dashboard
        </Link>
        <h1
          className="mt-6 font-normal"
          style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "var(--text-2xl)",
            color: "var(--color-text)",
          }}
        >
          Register new rescue organisation
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
          Creates a linked user account if the contact email is new. Slug is generated from the organisation name.
        </p>
        <RescueOrgForm mode="create" />
      </main>
    </div>
  );
}
