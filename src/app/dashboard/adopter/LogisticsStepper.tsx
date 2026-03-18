import { Check, Circle, Loader2 } from "lucide-react";

type Placement = {
  status: string;
  destinationCountry: string;
  vetPrepStatus: unknown;
  transportMethod: string | null;
  transportProviderName: string | null;
  transportBookedDate: Date | string | null;
  departureDate: Date | string | null;
  arrivalDate: Date | string | null;
  checkin1w: Date | string | null;
  checkin1m: Date | string | null;
  checkin3m: Date | string | null;
};

const STATUS_ORDER = ["preparing", "vet_complete", "transport_booked", "in_transit", "delivered", "follow_up"];

function statusRank(s: string): number {
  const i = STATUS_ORDER.indexOf(s);
  return i >= 0 ? i : -1;
}

function formatDate(d: Date | string | null): string {
  if (d == null) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** UK requires rabies titer test; show step only for UK. */
function isUK(country: string): boolean {
  const c = country.toLowerCase();
  return c === "uk" || c === "united kingdom";
}

type StepState = "complete" | "current" | "pending";

export function LogisticsStepper({ placement }: { placement: Placement }) {
  const rank = statusRank(placement.status);
  const vetPrep = (placement.vetPrepStatus as Record<string, boolean | string> | null) ?? {};
  const healthCheck = vetPrep.healthCheck ?? vetPrep.health_check;
  const vaccinations = vetPrep.vaccinations;
  const microchip = vetPrep.microchip;
  const spayNeuter = vetPrep.spayNeuter ?? vetPrep.spay_neuter;
  const rabiesTiterRequired = isUK(placement.destinationCountry);

  const vetComplete = rank >= statusRank("vet_complete");
  const transportDone = rank >= statusRank("transport_booked");
  const departureDone = !!placement.departureDate;
  const inTransit = rank >= statusRank("in_transit");
  const delivered = rank >= statusRank("delivered");
  const followUp = placement.status === "follow_up";

  const vetSub: string[] = [];
  if (healthCheck) vetSub.push("Health check");
  if (vaccinations) vetSub.push("Vaccinations");
  if (microchip) vetSub.push("Microchip");
  if (spayNeuter) vetSub.push("Spay/neuter");
  const transportDetail = [placement.transportMethod, placement.transportProviderName].filter(Boolean).join(" · ") || undefined;
  const checkinDetails: string[] = [];
  if (placement.checkin1w) checkinDetails.push(`1 week: ${formatDate(placement.checkin1w)}`);
  if (placement.checkin1m) checkinDetails.push(`1 month: ${formatDate(placement.checkin1m)}`);
  if (placement.checkin3m) checkinDetails.push(`3 months: ${formatDate(placement.checkin3m)}`);

  const stepsWithComplete: { key: string; label: string; complete: boolean; detail?: string; date?: string | null }[] = [];

  stepsWithComplete.push({ key: "approved", label: "Application approved", complete: true, detail: "Your application was accepted. The rescue is preparing your tiny for travel." });
  stepsWithComplete.push({
    key: "vet",
    label: "Vet preparation",
    complete: vetComplete,
    detail: vetSub.length > 0 ? vetSub.join(" · ") : vetComplete ? "Complete" : "Health check, vaccinations, microchip, spay/neuter as needed",
  });
  if (rabiesTiterRequired) {
    stepsWithComplete.push({
      key: "titer",
      label: "Rabies titer test",
      complete: vetComplete,
      detail: "Required for UK entry (blood draw 30+ days after vaccination)",
    });
  }
  stepsWithComplete.push({ key: "passport", label: "EU pet passport", complete: vetComplete, detail: "Issued by vet in Cyprus" });
  stepsWithComplete.push({
    key: "transport",
    label: "Transport booked",
    complete: transportDone,
    detail: transportDetail,
    date: placement.transportBookedDate ? formatDate(placement.transportBookedDate) : undefined,
  });
  stepsWithComplete.push({
    key: "departure",
    label: "Departure confirmed",
    complete: departureDone,
    date: placement.departureDate ? formatDate(placement.departureDate) : undefined,
  });
  stepsWithComplete.push({
    key: "transit",
    label: "In transit",
    complete: inTransit,
    detail: "Your tiny is on the way to you",
  });
  stepsWithComplete.push({
    key: "delivered",
    label: "Delivered",
    complete: delivered,
    detail: placement.arrivalDate ? `Arrived ${formatDate(placement.arrivalDate)}` : undefined,
    date: placement.arrivalDate ? formatDate(placement.arrivalDate) : undefined,
  });
  stepsWithComplete.push({
    key: "followup",
    label: "Follow-up",
    complete: followUp,
    detail: checkinDetails.length > 0 ? checkinDetails.join(" · ") : "Check-ins at 1 week, 1 month, 3 months",
  });

  const currentIndex = stepsWithComplete.findIndex((s) => !s.complete);
  const steps: { key: string; label: string; state: StepState; detail?: string; date?: string | null }[] = stepsWithComplete.map((s, i) => ({
    key: s.key,
    label: s.label,
    detail: s.detail,
    date: s.date,
    state: (s.complete ? "complete" : i === currentIndex ? "current" : "pending") as StepState,
  }));

  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        className="absolute left-5 top-6 bottom-6 w-0.5"
        style={{ backgroundColor: "var(--color-border)" }}
        aria-hidden
      />
      <ul className="space-y-0">
        {steps.map((step, index) => (
          <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            <div
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
              style={{
                backgroundColor: step.state === "complete" ? "var(--color-primary)" : step.state === "current" ? "var(--color-primary-50)" : "var(--color-background)",
                borderColor: step.state === "complete" ? "var(--color-primary)" : step.state === "current" ? "var(--color-primary)" : "var(--color-border)",
              }}
            >
              {step.state === "complete" ? (
                <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
              ) : step.state === "current" ? (
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--color-primary)" }} />
              ) : (
                <Circle className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
              )}
            </div>
            <div
              className="min-w-0 flex-1 pt-0.5"
              style={{
                opacity: step.state === "pending" ? 0.7 : 1,
              }}
            >
              <p
                className="font-semibold"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: step.state === "pending" ? "var(--color-text-muted)" : "var(--color-text)",
                }}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {step.detail}
                </p>
              )}
              {step.date && (
                <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {step.date}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
