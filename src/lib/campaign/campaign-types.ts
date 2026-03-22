import type { Prisma } from "@prisma/client";

export type CampaignMilestone = {
  title: string;
  description: string;
  targetCents: number | null;
  reached: boolean;
  reachedAt?: string | null;
};

export type CampaignUpdateEntry = {
  date: string;
  title: string;
  text: string;
  photoUrl?: string | null;
};

function isJsonObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function parseCampaignMilestones(raw: Prisma.JsonValue | null | undefined): CampaignMilestone[] {
  if (raw == null || !Array.isArray(raw)) return [];
  const out: CampaignMilestone[] = [];
  for (const item of raw) {
    if (!isJsonObject(item)) continue;
    const title = String(item.title ?? "");
    if (!title) continue;
    out.push({
      title,
      description: String(item.description ?? ""),
      targetCents: typeof item.targetCents === "number" ? item.targetCents : null,
      reached: Boolean(item.reached),
      reachedAt: item.reachedAt != null ? String(item.reachedAt) : null,
    });
  }
  return out;
}

export function parseCampaignUpdates(raw: Prisma.JsonValue | null | undefined): CampaignUpdateEntry[] {
  if (raw == null || !Array.isArray(raw)) return [];
  const out: CampaignUpdateEntry[] = [];
  for (const item of raw) {
    if (!isJsonObject(item)) continue;
    const title = String(item.title ?? "");
    const text = String(item.text ?? "");
    if (!title || !text) continue;
    out.push({
      date: String(item.date ?? ""),
      title,
      text,
      photoUrl: item.photoUrl != null ? String(item.photoUrl) : null,
    });
  }
  return out;
}
