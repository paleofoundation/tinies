"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FEEDBACK_STATUSES, FEEDBACK_TYPES, updateFeedbackAdminSchema } from "@/lib/validations/feedback";

export type AdminFeedbackListRow = {
  id: string;
  createdAt: Date;
  type: string;
  description: string;
  status: string;
  email: string | null;
  userEmail: string | null;
};

export async function getFeedbackListForAdmin(filters: {
  type?: string;
  status?: string;
}): Promise<{ rows: AdminFeedbackListRow[]; error?: string }> {
  try {
    const typeFilter =
      filters.type && FEEDBACK_TYPES.includes(filters.type as (typeof FEEDBACK_TYPES)[number])
        ? filters.type
        : undefined;
    const statusFilter =
      filters.status && FEEDBACK_STATUSES.includes(filters.status as (typeof FEEDBACK_STATUSES)[number])
        ? filters.status
        : undefined;

    const rows = await prisma.feedback.findMany({
      where: {
        ...(typeFilter ? { type: typeFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        type: true,
        description: true,
        status: true,
        email: true,
        user: { select: { email: true } },
      },
    });

    return {
      rows: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        type: r.type,
        description: r.description,
        status: r.status,
        email: r.email,
        userEmail: r.user?.email ?? null,
      })),
    };
  } catch (e) {
    console.error("getFeedbackListForAdmin", e);
    return { rows: [], error: "Failed to load feedback." };
  }
}

export async function getFeedbackByIdForAdmin(id: string): Promise<{
  feedback: NonNullable<Awaited<ReturnType<typeof prisma.feedback.findUnique>>> | null;
  error?: string;
}> {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
    if (!feedback) {
      return { feedback: null, error: "Not found." };
    }
    return { feedback };
  } catch (e) {
    console.error("getFeedbackByIdForAdmin", e);
    return { feedback: null, error: "Failed to load feedback." };
  }
}

export async function updateFeedbackAdmin(
  input: unknown
): Promise<{ ok?: true; error?: string }> {
  const parsed = updateFeedbackAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid update." };
  }

  const { id, status, adminNotes } = parsed.data;
  const notesTrimmed = adminNotes.trim();
  const notes = notesTrimmed === "" ? null : notesTrimmed;

  try {
    await prisma.feedback.update({
      where: { id },
      data: {
        status,
        adminNotes: notes,
      },
    });
    revalidatePath("/dashboard/admin/feedback");
    revalidatePath(`/dashboard/admin/feedback/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("updateFeedbackAdmin", e);
    return { error: "Could not update feedback." };
  }
}
