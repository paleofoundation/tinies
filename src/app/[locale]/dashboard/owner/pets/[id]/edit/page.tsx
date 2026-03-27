import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPetForEdit } from "../../../actions";
import { PetForm } from "../../../PetForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { pet } = await getPetForEdit(id);
  const name = pet?.name ?? "Pet";
  return {
    title: `Edit ${name}`,
    description: `Edit ${name}'s profile.`,
  };
}

export default async function EditPetPage({ params }: Props) {
  const { id } = await params;
  const { pet, error } = await getPetForEdit(id);

  if (error || !pet) {
    notFound();
  }

  const initial = {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? "",
    ageYears: pet.ageYears ?? "",
    weightKg: pet.weightKg ?? "",
    sex: pet.sex ?? "",
    spayedNeutered: pet.spayedNeutered ?? false,
    temperament: pet.temperament ?? "",
    medicalNotes: pet.medicalNotes ?? "",
    dietaryNeeds: pet.dietaryNeeds ?? "",
    vetName: pet.vetName ?? "",
    vetPhone: pet.vetPhone ?? "",
    photos: pet.photos,
  };

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
            Edit {pet.name}
          </h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Update your pet&apos;s profile.
          </p>
        </div>

        <PetForm mode="edit" petId={pet.id} initial={initial} />
      </main>
    </div>
  );
}
