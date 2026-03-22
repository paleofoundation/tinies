import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AdoptionListingForm } from "@/app/[locale]/dashboard/admin/adoptions/new/AdoptionListingForm";
import type { CreateListingInput } from "@/app/[locale]/dashboard/admin/adoption-listing-types";
import { photoUrlSlotsForForm } from "@/lib/adoption/listing-photos";
import { getAdoptionListingPeerOptions } from "@/lib/adoption/listing-peers";
import { updateRescueAdoptionListing } from "../../../actions";

export default async function EditRescueListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const org = await prisma.rescueOrg.findUnique({
    where: { userId: user.id },
  });
  if (!org) notFound();

  const listing = await prisma.adoptionListing.findFirst({
    where: { id, orgId: org.id },
  });
  if (!listing) notFound();

  const peerListings = await getAdoptionListingPeerOptions({
    excludeListingId: id,
    orgId: org.id,
  });

  const initial: Partial<CreateListingInput> = {
    name: listing.name,
    species: listing.species,
    breed: listing.breed ?? "",
    estimatedAge: listing.estimatedAge ?? "",
    sex: listing.sex ?? "Unknown",
    spayedNeutered: listing.spayedNeutered ?? false,
    alternateNames: [...listing.alternateNames],
    nameStory: listing.nameStory ?? "",
    temperament: listing.temperament ?? "",
    medicalHistory: listing.medicalHistory ?? "",
    specialNeeds: listing.specialNeeds ?? "",
    backstory: listing.backstory ?? "",
    personality: listing.personality ?? "",
    idealHome: listing.idealHome ?? "",
    goodWith: [...listing.goodWith],
    notGoodWith: [...listing.notGoodWith],
    videoUrl: listing.videoUrl ?? "",
    fosterLocation: listing.fosterLocation ?? "",
    lineageTitle: listing.lineageTitle ?? "",
    motherId: listing.motherId ?? "",
    fatherId: listing.fatherId ?? "",
    motherName: listing.motherName ?? "",
    fatherName: listing.fatherName ?? "",
    siblingIds: [...listing.siblingIds],
    familyNotes: listing.familyNotes ?? "",
    localAdoptionFeeEur: listing.localAdoptionFee != null ? listing.localAdoptionFee / 100 : undefined,
    internationalEligible: listing.internationalEligible,
    destinationCountries: listing.destinationCountries ?? [],
    photoUrls: photoUrlSlotsForForm(listing.photos),
    status: listing.status,
  };

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
          Edit adoption listing
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {listing.name}
        </p>
        <div className="mt-8">
          <AdoptionListingForm
            initial={initial}
            listingId={id}
            listingSlugForUpload={listing.slug}
            peerListings={peerListings}
            onUpdate={updateRescueAdoptionListing}
            successRedirect="/dashboard/rescue"
          />
        </div>
      </main>
    </div>
  );
}
