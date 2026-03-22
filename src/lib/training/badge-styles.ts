/**
 * Maps course `badgeColor` tokens from the database to design-token CSS variables.
 */

export const BADGE_COLOR_VARS: Record<string, string> = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  "primary-700": "var(--color-primary-700)",
  "primary-900": "var(--color-primary-900)",
};

export function badgeColorVar(token: string | null | undefined): string {
  if (!token) return "var(--color-primary)";
  return BADGE_COLOR_VARS[token] ?? "var(--color-primary)";
}

/** Master "Tinies Verified Professional" accent — warm gold-leaning using brand secondary + warning. */
export const MASTER_BADGE_STYLE = {
  border: "var(--color-secondary)",
  background: "linear-gradient(135deg, rgba(244, 93, 72, 0.08) 0%, rgba(234, 179, 8, 0.12) 100%)",
  text: "var(--color-text)",
  accent: "var(--color-secondary)",
} as const;
