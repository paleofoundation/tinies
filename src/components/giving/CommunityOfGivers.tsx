import { GivingTierBadge } from "./GivingTierBadge";
import type { CommunityGiverCard } from "@/lib/utils/giving-helpers";

type Props = {
  givers: CommunityGiverCard[];
};

export function CommunityOfGivers({ givers }: Props) {
  if (givers.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {givers.map((g, i) => (
        <div
          key={`${g.displayName}-${g.charityName}-${i}`}
          className="rounded-[var(--radius-lg)] border p-4 transition-shadow hover:shadow-md"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <p className="font-medium" style={{ color: "var(--color-text)" }}>
            {g.displayName}
            {g.country && (
              <span className="ml-1.5 text-sm font-normal" style={{ color: "var(--color-text-secondary)" }}>
                {g.countryFlag} {g.country}
              </span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {g.tier && <GivingTierBadge tier={g.tier} size="sm" />}
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              → {g.charityName}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
