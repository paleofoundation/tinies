import Link from "next/link";
import { AdoptionListingForm } from "./AdoptionListingForm";

export default function NewAdoptionListingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 sm:py-20">
        <Link
          href="/dashboard/admin"
          className="text-sm text-[#6B7280] hover:text-[#1B2432] hover:underline"
        >
          ← Back to admin
        </Link>
        <h1
          className="mt-2 text-2xl font-normal text-[#1B2432] sm:text-3xl"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          Add new adoption listing
        </h1>
        <p className="mt-1 text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
          Gardens of St Gertrude – create a new listing.
        </p>
        <div className="mt-8">
          <AdoptionListingForm />
        </div>
      </main>
    </div>
  );
}
