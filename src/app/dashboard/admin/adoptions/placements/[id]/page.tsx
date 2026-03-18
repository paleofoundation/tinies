import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlacementById, getTransportProviders } from "../../actions";
import { PlacementManageForm } from "./PlacementManageForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminPlacementDetailPage({ params }: Props) {
  const { id } = await params;
  const [placement, transportResult] = await Promise.all([
    getPlacementById(id),
    getTransportProviders(),
  ]);
  if (!placement) notFound();
  const transportProviders = transportResult.providers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/admin"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Admin
        </Link>
        <h1 className="mt-2 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Placement: {placement.listing.name}
        </h1>
      </div>

      {/* Read-only summary */}
      <section
        className="rounded-[var(--radius-lg)] border p-6"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          Summary
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Animal
            </dt>
            <dd style={{ color: "var(--color-text)" }}>
              {placement.listing.name} — {placement.listing.species}
              {placement.listing.breed && ` (${placement.listing.breed})`}
              {placement.listing.estimatedAge && ` · ${placement.listing.estimatedAge}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Adopter
            </dt>
            <dd style={{ color: "var(--color-text)" }}>
              {placement.adopter.name} — {placement.adopter.email}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Rescue org
            </dt>
            <dd style={{ color: "var(--color-text)" }}>{placement.rescueOrg.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Destination country
            </dt>
            <dd style={{ color: "var(--color-text)" }}>{placement.destinationCountry}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Status
            </dt>
            <dd style={{ color: "var(--color-text)" }}>{placement.status}</dd>
          </div>
        </dl>
      </section>

      <PlacementManageForm placement={placement} transportProviders={transportProviders} />
    </div>
  );
}
