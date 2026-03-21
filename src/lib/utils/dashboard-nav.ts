import type { UserRole } from "@prisma/client";

const ROLES: UserRole[] = ["owner", "provider", "rescue", "adopter", "admin"];

/**
 * Primary dashboard path from Prisma `users.role` (single role per account).
 */
export function dashboardPathForRole(role: UserRole | null | undefined): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "rescue":
      return "/dashboard/rescue";
    case "adopter":
      return "/dashboard/adopter";
    case "provider":
      return "/dashboard/provider";
    case "owner":
      return "/dashboard/owner";
    default:
      return "/dashboard/owner";
  }
}

export function parseMetadataRole(raw: unknown): UserRole | null {
  if (typeof raw !== "string") return null;
  return ROLES.includes(raw as UserRole) ? (raw as UserRole) : null;
}

/** Same routing as the header dashboard link, mapped back to a role for conditional UI. */
export function roleFromDashboardHref(href: string): UserRole {
  if (href === "/dashboard/admin") return "admin";
  if (href === "/dashboard/rescue") return "rescue";
  if (href === "/dashboard/adopter") return "adopter";
  if (href === "/dashboard/provider") return "provider";
  return "owner";
}

/**
 * Header / nav: match legacy behavior — a completed provider profile routes to the provider dashboard
 * even when `users.role` is still `owner` (common during onboarding).
 */
export function dashboardHrefForUser(
  dbRole: UserRole | null | undefined,
  metadataRole: unknown,
  hasProviderProfile: boolean
): string {
  const metaRole = parseMetadataRole(metadataRole);
  const role = dbRole ?? metaRole;

  if (role === "admin") return "/dashboard/admin";
  if (role === "rescue") return "/dashboard/rescue";
  if (role === "adopter") return "/dashboard/adopter";
  if (role === "provider" || hasProviderProfile) return "/dashboard/provider";
  if (role === "owner") return "/dashboard/owner";
  return hasProviderProfile ? "/dashboard/provider" : "/dashboard/owner";
}
