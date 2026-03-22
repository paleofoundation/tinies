import { UserRole } from "@prisma/client";

export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case UserRole.admin:
      return "/dashboard/admin";
    case UserRole.provider:
      return "/dashboard/provider";
    case UserRole.rescue:
      return "/dashboard/rescue";
    case UserRole.adopter:
      return "/dashboard/adopter";
    default:
      return "/dashboard/owner";
  }
}

/** Allow only relative paths for ?next= (open-redirect safe). Never send users back to /welcome in a loop. */
export function safePostWelcomePath(next: string | null | undefined, role: UserRole): string {
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
    if (next === "/welcome" || next.startsWith("/welcome?")) {
      return dashboardPathForRole(role);
    }
    return next;
  }
  return dashboardPathForRole(role);
}
