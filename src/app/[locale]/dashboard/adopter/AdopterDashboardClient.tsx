"use client";

import Link from "next/link";
import { Heart, MessageSquare } from "lucide-react";
import { LogisticsStepper } from "./LogisticsStepper";
import type { AdopterApplicationSummary } from "./adopter-dashboard-types";

const STATUS_LABELS: Record<string, string> = {
  new: "Received",
  under_review: "Under review",
  approved: "Approved",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

type Props = {
  applications: AdopterApplicationSummary[];
};

export function AdopterDashboardClient({ applications }: Props) {
  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-4 border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
        <span className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
          <Heart className="h-4 w-4" />
          Your applications
        </span>
        <Link
          href="/dashboard/messages"
          className="flex items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-primary-50)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          <MessageSquare className="h-4 w-4" />
          Messages
        </Link>
      </div>

      <div className="mt-6">
          <ul className="space-y-8">
            {applications.map((app) => (
              <li
                key={app.id}
                className="rounded-[var(--radius-lg)] border p-6"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      {app.listing.name}
                    </h2>
                    <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {app.listing.species} · Applied {formatDate(app.createdAt)}
                    </p>
                  </div>
                  <span
                    className="rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium"
                    style={{
                      backgroundColor:
                        app.status === "approved"
                          ? "var(--color-primary-50)"
                          : app.status === "declined"
                            ? "var(--color-error)/0.1"
                            : app.status === "new"
                              ? "var(--color-secondary-50)"
                              : "var(--color-primary-50)",
                      color:
                        app.status === "approved"
                          ? "var(--color-primary)"
                          : app.status === "declined"
                            ? "var(--color-error)"
                            : app.status === "new"
                              ? "var(--color-secondary)"
                              : "var(--color-primary)",
                      borderColor:
                        app.status === "approved"
                          ? "var(--color-primary-200)"
                          : app.status === "declined"
                            ? "var(--color-error)/0.3"
                            : "var(--color-primary-200)",
                    }}
                  >
                    {STATUS_LABELS[app.status] ?? app.status}
                  </span>
                </div>
                <Link
                  href={`/adopt/${app.listing.slug}`}
                  className="mt-4 inline-block text-sm font-medium hover:underline"
                  style={{ color: "var(--color-primary)" }}
                >
                  View listing →
                </Link>

                {app.status === "approved" && app.placement && (
                  <div className="mt-8 rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      Your adoption journey
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Track progress from Cyprus to you. The rescue will update each step as they go.
                    </p>
                    <div className="mt-6">
                      <LogisticsStepper placement={app.placement} />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}
