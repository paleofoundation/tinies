"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { PET_SPECIES, MAX_PHOTOS } from "@/lib/validations/pet";
import { createPet, updatePet } from "./actions";

const SEX_OPTIONS = [
  { value: "", label: "Select" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

type PetFormProps = {
  mode: "create" | "edit";
  petId?: string;
  initial?: {
    name: string;
    species: string;
    breed: string;
    ageYears: string | number;
    weightKg: string | number;
    sex: string;
    spayedNeutered: boolean | null;
    temperament: string;
    medicalNotes: string;
    dietaryNeeds: string;
    vetName: string;
    vetPhone: string;
    photos: string[];
  };
};

const inputClass =
  "mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40";
const sectionClass =
  "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-md)] sm:p-8";
const labelClass = "block text-sm font-medium";

export function PetForm({ mode, petId, initial }: PetFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [species, setSpecies] = useState(initial?.species ?? "dog");
  const [breed, setBreed] = useState(initial?.breed ?? "");
  const [ageYears, setAgeYears] = useState(
    initial?.ageYears !== undefined && initial?.ageYears !== "" ? String(initial.ageYears) : ""
  );
  const [weightKg, setWeightKg] = useState(
    initial?.weightKg !== undefined && initial?.weightKg !== "" ? String(initial.weightKg) : ""
  );
  const [sex, setSex] = useState(initial?.sex ?? "");
  const [spayedNeutered, setSpayedNeutered] = useState<boolean>(
    initial?.spayedNeutered ?? false
  );
  const [temperament, setTemperament] = useState(initial?.temperament ?? "");
  const [medicalNotes, setMedicalNotes] = useState(initial?.medicalNotes ?? "");
  const [dietaryNeeds, setDietaryNeeds] = useState(initial?.dietaryNeeds ?? "");
  const [vetName, setVetName] = useState(initial?.vetName ?? "");
  const [vetPhone, setVetPhone] = useState(initial?.vetPhone ?? "");
  const [keptPhotoUrls, setKeptPhotoUrls] = useState<string[]>(initial?.photos ?? []);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const totalPhotos = keptPhotoUrls.length + photoFiles.length;
  const canAddMorePhotos = totalPhotos < MAX_PHOTOS;

  function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_PHOTOS - keptPhotoUrls.length;
    setPhotoFiles((prev) => [...prev, ...newFiles].slice(0, remaining));
    e.target.value = "";
  }

  function removeKeptPhoto(url: string) {
    setKeptPhotoUrls((prev) => prev.filter((u) => u !== url));
  }

  function removeNewPhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!species) {
      toast.error("Species is required.");
      return;
    }
    if (totalPhotos > MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }
    setSubmitting(true);

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("species", species);
    if (breed.trim()) formData.set("breed", breed.trim());
    if (ageYears.trim()) formData.set("ageYears", ageYears.trim());
    if (weightKg.trim()) formData.set("weightKg", weightKg.trim());
    if (sex) formData.set("sex", sex);
    formData.set("spayedNeutered", spayedNeutered ? "true" : "false");
    if (temperament.trim()) formData.set("temperament", temperament.trim());
    if (medicalNotes.trim()) formData.set("medicalNotes", medicalNotes.trim());
    if (dietaryNeeds.trim()) formData.set("dietaryNeeds", dietaryNeeds.trim());
    if (vetName.trim()) formData.set("vetName", vetName.trim());
    if (vetPhone.trim()) formData.set("vetPhone", vetPhone.trim());
    if (mode === "edit" && keptPhotoUrls.length > 0) {
      formData.set("existingPhotoUrls", JSON.stringify(keptPhotoUrls));
    }
    photoFiles.forEach((file, i) => formData.append("photos", file));

    if (mode === "create") {
      const result = await createPet(formData);
      setSubmitting(false);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pet added.");
      router.push("/dashboard/owner");
      router.refresh();
    } else if (petId) {
      const result = await updatePet(petId, formData);
      setSubmitting(false);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pet updated.");
      router.push("/dashboard/owner");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Basic info */}
      <section id="basic" className={sectionClass}>
        <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>
          Basic info
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Name and species are required.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Bella"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>
              Species *
            </label>
            <select
              name="species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className={inputClass}
              required
            >
              {PET_SPECIES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
              Breed
            </label>
            <input
              type="text"
              name="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className={inputClass}
              placeholder="e.g. Labrador"
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
                Age (years)
              </label>
              <input
                type="number"
                name="ageYears"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className={inputClass}
                placeholder="2.5"
                min={0}
                max={30}
                step={0.1}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
                Weight (kg)
              </label>
              <input
                type="number"
                name="weightKg"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className={inputClass}
                placeholder="12"
                min={0.1}
                max={200}
                step={0.1}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
              Sex
            </label>
            <select
              name="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className={inputClass}
            >
              {SEX_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="spayedNeutered"
                checked={spayedNeutered === true}
                onChange={(e) => setSpayedNeutered(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm" style={{ color: "var(--color-text)" }}>
                Spayed / neutered
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Temperament & care */}
      <section id="care" className={sectionClass}>
        <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>
          Temperament & care
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Help providers care for your pet.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
              Temperament
            </label>
            <textarea
              name="temperament"
              value={temperament}
              onChange={(e) => setTemperament(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Friendly, good with other dogs..."
              maxLength={2000}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
              Medical notes
            </label>
            <textarea
              name="medicalNotes"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Allergies, medications..."
              maxLength={2000}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
              Dietary needs
            </label>
            <textarea
              name="dietaryNeeds"
              value={dietaryNeeds}
              onChange={(e) => setDietaryNeeds(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Special diet, feeding schedule..."
              maxLength={2000}
            />
          </div>
        </div>
      </section>

      {/* Vet */}
      <section id="vet" className={sectionClass}>
        <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>
          Vet contact
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Optional. Useful for sitters in case of emergency.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
              Vet name
            </label>
            <input
              type="text"
              name="vetName"
              value={vetName}
              onChange={(e) => setVetName(e.target.value)}
              className={inputClass}
              placeholder="Clinic name"
              maxLength={100}
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
              Vet phone
            </label>
            <input
              type="tel"
              name="vetPhone"
              value={vetPhone}
              onChange={(e) => setVetPhone(e.target.value)}
              className={inputClass}
              placeholder="+357 ..."
              maxLength={30}
            />
          </div>
        </div>
      </section>

      {/* Photos */}
      <section id="photos" className={sectionClass}>
        <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif" }}>
          Photos
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Up to {MAX_PHOTOS} photos. Clear photos help providers recognize your pet.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          {keptPhotoUrls.map((url) => (
            <div key={url} className="relative">
              <div className="relative h-24 w-24 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={url.includes("supabase")}
                />
              </div>
              <button
                type="button"
                onClick={() => removeKeptPhoto(url)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-error)] text-xs text-white"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
          {photoFiles.map((file, i) => (
            <div key={`new-${i}`} className="relative">
              <div className="relative h-24 w-24 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)]">
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-error)] text-xs text-white"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
          {canAddMorePhotos && (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)] transition-colors hover:border-[var(--color-primary)]/40">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoFileChange}
                className="hidden"
              />
              <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                Add
              </span>
            </label>
          )}
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {totalPhotos} / {MAX_PHOTOS} photos
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/owner"
          className="text-sm hover:underline"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[var(--radius-pill)] h-12 bg-[var(--color-primary)] px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {submitting ? "Saving…" : mode === "create" ? "Add pet" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
