"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import type { ProviderForBooking } from "../actions";
import { createBookingWithPaymentIntent } from "../actions";
import {
  computeBookingTotalCents,
  computeRoundUpCents,
} from "@/lib/booking-utils";
import { CancellationPolicy } from "@/lib/constants";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const SERVICE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

const CANCELLATION_EXPLANATIONS: Record<string, string> = {
  [CancellationPolicy.flexible]:
    "24+ hours: full refund. Under 24h: 50% refund. No-show: no refund.",
  [CancellationPolicy.moderate]:
    "7+ days: full refund. 2–6 days: 50%. Under 48h: no refund.",
  [CancellationPolicy.strict]:
    "14+ days: full refund. 7–13 days: 50%. Under 7 days: no refund.",
};

function formatEur(cents: number): string {
  return `EUR ${(cents / 100).toFixed(2)}`;
}

type Pet = { id: string; name: string; species: string; breed: string | null; ageYears: number | null; photos: string[] };

type BookingFlowProps = {
  provider: ProviderForBooking;
  pets: Pet[];
};

const sectionClass =
  "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-md)] sm:p-8";
const labelClass = "block text-sm font-medium";
const inputClass =
  "mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40";

export function BookingFlow({ provider, pets }: BookingFlowProps) {
  const [serviceType, setServiceType] = useState<string>(
    provider.services[0]?.type ?? ""
  );
  const hasServices = provider.services.length > 0;
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("17:00");
  const [visitsPerDay, setVisitsPerDay] = useState(2);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [roundUpEnabled, setRoundUpEnabled] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const isRangeService = ["sitting", "boarding", "drop_in", "daycare"].includes(serviceType);
  useEffect(() => {
    if (isRangeService && startDate && (!endDate || endDate < startDate)) {
      setEndDate(startDate);
    }
  }, [isRangeService, startDate, endDate]);

  const serviceConfig = useMemo(
    () => provider.services.find((s) => s.type === serviceType),
    [provider.services, serviceType]
  );

  const totalCents = useMemo(() => {
    if (!serviceConfig || selectedPetIds.length === 0) return 0;
    let cents = computeBookingTotalCents(
      serviceConfig.base_price,
      serviceConfig.additional_pet_price,
      selectedPetIds.length
    );
    if (serviceType === "drop_in" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const numDays = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
      );
      cents = cents * numDays * visitsPerDay;
    }
    return cents;
  }, [
    serviceConfig,
    serviceType,
    selectedPetIds.length,
    startDate,
    endDate,
    visitsPerDay,
  ]);

  const roundUpCents = useMemo(
    () => (roundUpEnabled ? computeRoundUpCents(totalCents) : 0),
    [roundUpEnabled, totalCents]
  );
  const chargeCents = totalCents + roundUpCents;
  const roundedEur = roundUpEnabled
    ? (Math.ceil(totalCents / 100) * 100) / 100
    : totalCents / 100;

  const maxPets = serviceConfig?.max_pets ?? 99;
  const canSelectMorePets = selectedPetIds.length < maxPets;

  const cancellationText =
    CANCELLATION_EXPLANATIONS[provider.cancellationPolicy] ??
    "See provider profile for policy.";

  function togglePet(id: string) {
    setSelectedPetIds((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : prev.length < maxPets
          ? [...prev, id]
          : prev
    );
  }

  async function handleConfirmBooking() {
    if (!serviceConfig || selectedPetIds.length === 0) {
      toast.error("Select a service and at least one pet.");
      return;
    }
    const start = startDate && startTime ? `${startDate}T${startTime}:00` : null;
    const endForWalking = startDate && endTime ? `${startDate}T${endTime}:00` : null;
    const endForRange = endDate && endTime ? `${endDate}T${endTime}:00` : null;
    const end = serviceType === "walking" ? endForWalking : endForRange;
    if (!start || !end) {
      toast.error("Select start and end date/time.");
      return;
    }
    if (new Date(end) <= new Date(start)) {
      toast.error("End must be after start.");
      return;
    }
    setConfirming(true);
    const result = await createBookingWithPaymentIntent({
      providerSlug: provider.slug,
      serviceType: serviceType as "walking" | "sitting" | "boarding" | "drop_in" | "daycare",
      startDatetime: start,
      endDatetime: end,
      petIds: selectedPetIds,
      specialInstructions: specialInstructions.trim() || undefined,
      roundUpEnabled,
      visitsPerDay: serviceType === "drop_in" ? visitsPerDay : undefined,
    });
    setConfirming(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.clientSecret) {
      setClientSecret(result.clientSecret);
      setBookingId(result.bookingId ?? null);
    }
  }

  const petNames = pets.filter((p) => selectedPetIds.includes(p.id)).map((p) => p.name);
  const breakdownLines: string[] = [];
  if (serviceConfig && selectedPetIds.length > 0) {
    const baseCents = Math.round(serviceConfig.base_price * 100);
    const addCents = Math.round(serviceConfig.additional_pet_price * 100);
    const firstPet = petNames[0];
    breakdownLines.push(
      `1× ${SERVICE_LABELS[serviceType] ?? serviceType} (${firstPet}): ${formatEur(baseCents)}`
    );
    for (let i = 1; i < petNames.length; i++) {
      breakdownLines.push(
        `1× additional pet (${petNames[i]}): ${formatEur(addCents)}`
      );
    }
    if (serviceType === "drop_in" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const numDays = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
      );
      const subTotal = computeBookingTotalCents(
        serviceConfig.base_price,
        serviceConfig.additional_pet_price,
        selectedPetIds.length
      );
      const multi = numDays * visitsPerDay;
      breakdownLines.push(
        `${numDays} days × ${visitsPerDay} visits/day = ${multi} visits. Subtotal: ${formatEur(subTotal * multi)}`
      );
    }
  }

  if (clientSecret) {
    return (
      <div className="mt-8 space-y-6">
        <div className={sectionClass}>
          <h2
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif" }}
          >
            Complete payment
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Your booking is reserved. Enter card details to authorize payment. The provider will confirm and we&apos;ll capture payment then.
          </p>
          <div className="mt-4 rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
            <p className="font-semibold" style={{ color: "var(--color-text)" }}>
              Total: {formatEur(chargeCents)}
            </p>
            {roundUpEnabled && roundUpCents > 0 && (
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Includes {formatEur(roundUpCents)} round-up donation.
              </p>
            )}
          </div>
          <div className="mt-6">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: { colorPrimary: "#2D6A4F" },
                },
              }}
            >
              <PaymentForm bookingId={bookingId} />
            </Elements>
          </div>
        </div>
      </div>
    );
  }

  if (!hasServices) {
    return (
      <div className="mt-8">
        <div className={sectionClass}>
          <p style={{ color: "var(--color-text-secondary)" }}>
            This provider has not set up services yet. Check back later or message them.
          </p>
          <Link
            href={`/services/provider/${provider.slug}`}
            className="mt-4 inline-block text-sm font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            ← Back to profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="mt-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleConfirmBooking();
      }}
    >
      {/* 1. Service */}
      <section className={sectionClass}>
        <h2
          className="font-normal"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          Service
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Select the service and see pricing.
        </p>
        <div className="mt-4">
          <label className={labelClass} style={{ color: "var(--color-text)" }}>
            Service type
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className={inputClass}
          >
            {provider.services.map((s) => (
              <option key={s.type} value={s.type}>
                {SERVICE_LABELS[s.type] ?? s.type} — {formatEur(Math.round(s.base_price * 100))} base, {formatEur(Math.round(s.additional_pet_price * 100))} per additional pet (max {s.max_pets} pets)
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Cancellation policy
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {cancellationText}
          </p>
        </div>
      </section>

      {/* 2. Dates & times */}
      <section className={sectionClass}>
        <h2
          className="font-normal"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          Dates & times
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {serviceType === "walking" && "Single date and time."}
          {(serviceType === "sitting" || serviceType === "boarding") && "Start and end of stay."}
          {serviceType === "drop_in" && "Date range and visits per day."}
          {serviceType === "daycare" && "First and last day."}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>
              Start time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </div>
          {serviceType === "walking" && (
            <div className="sm:col-span-2">
              <label className={labelClass} style={{ color: "var(--color-text-secondary)" }}>
                End time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
          {(serviceType === "sitting" || serviceType === "boarding" || serviceType === "drop_in" || serviceType === "daycare") && (
            <>
              <div>
                <label className={labelClass} style={{ color: "var(--color-text)" }}>
                  End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--color-text)" }}>
                  End time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}
          {serviceType === "drop_in" && (
            <div>
              <label className={labelClass} style={{ color: "var(--color-text)" }}>
                Visits per day
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={visitsPerDay}
                onChange={(e) => setVisitsPerDay(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          )}
        </div>
        {serviceType === "walking" && (
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Single date; end time is when the walk ends.
          </p>
        )}
      </section>

      {/* 3. Pets */}
      <section className={sectionClass}>
        <h2
          className="font-normal"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          Pets
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Select pets for this booking. Max {maxPets} for this service.
        </p>
        {pets.length === 0 ? (
          <p className="mt-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            You have no pets yet.{" "}
            <Link href="/dashboard/owner/pets/new" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
              Add a pet
            </Link>{" "}
            first.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {pets.map((pet) => (
              <li key={pet.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)" }}>
                  <input
                    type="checkbox"
                    checked={selectedPetIds.includes(pet.id)}
                    onChange={() => togglePet(pet.id)}
                    disabled={!selectedPetIds.includes(pet.id) && !canSelectMorePets}
                    className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)]"
                  />
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>
                    {pet.name}
                  </span>
                  <span className="text-sm capitalize" style={{ color: "var(--color-text-secondary)" }}>
                    {pet.species}
                    {pet.breed ? ` · ${pet.breed}` : ""}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {breakdownLines.length > 0 && (
          <div className="mt-4 rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
            {breakdownLines.map((line, i) => (
              <p key={i} className="text-sm" style={{ color: "var(--color-text)" }}>
                {line}
              </p>
            ))}
            <p className="mt-2 font-semibold" style={{ color: "var(--color-text)" }}>
              Total: {formatEur(totalCents)}
            </p>
          </div>
        )}
      </section>

      {/* 4. Special instructions */}
      <section className={sectionClass}>
        <h2
          className="font-normal"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          Details
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Any special instructions for the provider.
        </p>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          rows={3}
          className={`mt-4 ${inputClass}`}
          placeholder="Feeding times, medication, access instructions..."
        />
        <div className="mt-4 rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Cancellation: {cancellationText}
          </p>
        </div>
      </section>

      {/* 5. Payment */}
      <section className={sectionClass}>
        <h2
          className="font-normal"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          Payment
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Total and optional round-up donation.
        </p>
        <div className="mt-4 space-y-3">
          <p className="font-semibold" style={{ color: "var(--color-text)" }}>
            Booking total: {formatEur(totalCents)}
          </p>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={roundUpEnabled}
              onChange={(e) => setRoundUpEnabled(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)]"
            />
            <span className="text-sm" style={{ color: "var(--color-text)" }}>
              Round up to EUR {roundedEur.toFixed(2)} and donate {formatEur(roundUpCents)} to animal rescue?
            </span>
          </label>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Amount to charge: {formatEur(chargeCents)}
          </p>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={confirming || selectedPetIds.length === 0 || !serviceType || !startDate || (isRangeService && !endDate)}
            className="rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {confirming ? "Creating booking…" : "Confirm Booking"}
          </button>
        </div>
      </section>

      <p className="pt-4">
        <Link
          href={`/services/provider/${provider.slug}`}
          className="text-sm hover:underline"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ← Back to {provider.providerName}&apos;s profile
        </Link>
      </p>
    </form>
  );
}

function PaymentForm({ bookingId }: { bookingId: string | null }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/owner?booking=${bookingId ?? ""}`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Payment failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="mt-6 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-70"
      >
        {loading ? "Processing…" : "Complete payment"}
      </button>
    </form>
  );
}
