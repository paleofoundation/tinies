import { Heart } from "lucide-react";
import type { GivingTier } from "@/lib/giving/actions";

type Props = {
  tier: GivingTier;
  size?: "sm" | "md";
};

const TIER_CONFIG: Record<NonNullable<GivingTier>, { label: string; className: string }> = {
  friend: {
    label: "Tinies Friend",
    className: "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]",
  },
  guardian: {
    label: "Tinies Guardian",
    className: "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  },
  champion: {
    label: "Tinies Champion",
    className: "border-amber-400/50 bg-amber-50 text-amber-800",
  },
  hero: {
    label: "Tinies Hero",
    className: "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  },
};

export function GivingTierBadge({ tier, size = "sm" }: Props) {
  if (!tier) return null;
  const config = TIER_CONFIG[tier];
  if (!config) return null;
  const isSm = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border font-medium ${config.className} ${isSm ? "px-1.5 py-0 text-xs" : "px-2 py-0.5 text-xs"}`}
    >
      {tier === "hero" && <Heart className={isSm ? "h-2.5 w-2.5" : "h-3 w-3"} fill="currentColor" />}
      {config.label}
    </span>
  );
}
