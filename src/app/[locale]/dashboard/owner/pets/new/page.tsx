import type { Metadata } from "next";
import Link from "next/link";
import { PetForm } from "../../PetForm";

export const metadata: Metadata = {
  title: "Add Pet",
  description: "Add a pet to your profile.",
};

export default function NewPetPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main
        className="mx-auto px-4 py-20 sm:px-6 sm:py-20"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <div className="mb-8">
          <Link
            href="/dashboard/owner"
            className="text-sm hover:underline"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ← Back to dashboard
          </Link>
          <h1
            className="mt-2 text-2xl font-normal"
            style={{ fontFamily: "var(--font-heading), serif" }}
          >
            Add pet
          </h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Add a pet profile so you can book services.
          </p>
        </div>

        <PetForm mode="create" />
      </main>
    </div>
  );
}
