import Link from "next/link";
import { AdoptionListingForm } from "@/app/dashboard/admin/adoptions/new/AdoptionListingForm";
import { createRescueAdoptionListing } from "../../actions";

export default function NewRescueListingPage() {
  return (
    <div
      className="min-h-screen px-4 py-12 sm:px-6 sm:py-16"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <Link
          href="/dashboard/rescue"
          className="text-sm hover:underline"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ← Back to rescue dashboard
        </Link>
        <h1
          className="mt-2 font-normal"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          Add new adoption listing
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          List an animal for adoption. They&apos;ll appear on Tinies for adopters to find.
        </p>
        <div className="mt-8">
          <AdoptionListingForm
            onCreate={createRescueAdoptionListing}
            successRedirect="/dashboard/rescue"
          />
        </div>
      </main>
    </div>
  );
}
