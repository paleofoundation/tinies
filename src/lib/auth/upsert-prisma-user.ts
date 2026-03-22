import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export function roleFromSupabaseMetadata(raw: unknown): UserRole {
  const s = String(raw ?? "owner");
  if (s === "provider" || s === "rescue" || s === "adopter" || s === "admin") {
    return s as UserRole;
  }
  return UserRole.owner;
}

type SupabaseUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

/**
 * Ensures a Prisma `User` row exists for a Supabase-authenticated user (email/OAuth).
 */
export async function upsertPrismaUserFromSupabaseAuthUser(user: SupabaseUserLike): Promise<void> {
  const email = (user.email ?? "").trim().toLowerCase();
  const name =
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    email.split("@")[0] ||
    "Member";
  const role = roleFromSupabaseMetadata(user.user_metadata?.role);
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: email || `${user.id}@placeholder.local`,
      name: name.slice(0, 200),
      passwordHash: "supabase-auth-placeholder",
      role,
    },
    update: {},
  });
}
