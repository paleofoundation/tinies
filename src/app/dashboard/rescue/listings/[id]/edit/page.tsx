import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AdoptionListingForm } from "@/app/dashboard/admin/adoptions/new/AdoptionListingForm";
import type { CreateListingInput } from "@/app/dashboard/admin/actions";
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
            onUpdate={updateRescueAdoptionListing}
            successRedirect="/dashboard/rescue"
          />
        </div>
      </main>
    </div>
  );
}
