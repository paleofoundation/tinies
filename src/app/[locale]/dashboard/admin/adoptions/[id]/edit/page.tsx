import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdoptionListingForm } from "../../new/AdoptionListingForm";
import type { CreateListingInput } from "../../../actions";

export default async function EditAdoptionListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.adoptionListing.findUnique({
    where: { id },
  });

  if (!listing) {
    notFound();
  }

  const initial: Partial<CreateListingInput> = {
    name: listing.name,
    species: listing.species,
    breed: listing.breed ?? "",
    estimatedAge: listing.estimatedAge ?? "",
    sex: listing.sex ?? "Unknown",
    spayedNeutered: listing.spayedNeutered ?? false,
    temperament: listing.temperament ?? "",
    medicalHistory: listing.medicalHistory ?? "",
    specialNeeds: listing.specialNeeds ?? "",
    localAdoptionFeeEur: listing.localAdoptionFee != null ? listing.localAdoptionFee / 100 : undefined,
    internationalEligible: listing.internationalEligible,
    destinationCountries: listing.destinationCountries ?? [],
    photoUrls:
      listing.photos.length > 0
        ? [...listing.photos, "", "", "", ""].slice(0, 5)
        : ["", "", "", "", ""],
    status: listing.status,
  };

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
          Edit adoption listing
        </h1>
        <p className="mt-1 text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
          {listing.name}
        </p>
        <div className="mt-8">
          <AdoptionListingForm initial={initial} listingId={id} />
        </div>
      </main>
    </div>
  );
}
