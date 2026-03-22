import { Award, Shield } from "lucide-react";
import { badgeColorVar, MASTER_BADGE_STYLE } from "@/lib/training/badge-styles";

export type ProfileCertification = {
  courseTitle: string;
  courseSlug: string;
  badgeLabel: string;
  badgeColor: string | null;
  score: number;
  completedAt: Date;
  certificateId: string | null;
};

function formatCertDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function CertCard({ c }: { c: ProfileCertification }) {
  const color = badgeColorVar(c.badgeColor);
  return (
    <div
      tabIndex={0}
      className="group relative rounded-[var(--radius-xl)] border bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}18`, color }}
          aria-hidden
        >
          <Shield className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-normal leading-snug" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
            {c.badgeLabel}
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {c.courseTitle}
          </p>
          <p className="mt-2 text-xs" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
            Certified {formatCertDate(c.completedAt)}
          </p>
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-[min(calc(100vw-2rem),18rem)] -translate-x-1/2 rounded-[var(--radius-lg)] border bg-white p-4 shadow-[var(--shadow-lg)] group-hover:block group-focus-within:block"
        style={{ borderColor: "var(--color-border)" }}
        role="tooltip"
      >
        <p className="font-medium" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          {c.courseTitle}
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
          Score: {c.score}% · {formatCertDate(c.completedAt)}
        </p>
        {c.certificateId ? (
          <p className="mt-2 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            ID {c.certificateId}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ProviderCertificationsSection({ certifications }: { certifications: ProfileCertification[] }) {
  if (certifications.length === 0) return null;

  const showMaster = certifications.length >= 3;

  return (
    <section className="mt-12" aria-labelledby="certifications-heading">
      <h2
        id="certifications-heading"
        className="font-normal"
        style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
      >
        Certifications
      </h2>
      <p className="mt-2 max-w-2xl text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
        Tinies training courses completed by this provider. Hover a card for certificate details.
      </p>

      {showMaster ? (
        <div
          className="mt-6 flex items-center gap-3 rounded-[var(--radius-xl)] border px-4 py-3"
          style={{
            borderColor: MASTER_BADGE_STYLE.border,
            background: MASTER_BADGE_STYLE.background,
          }}
        >
          <Award className="h-6 w-6 shrink-0" style={{ color: MASTER_BADGE_STYLE.accent }} aria-hidden />
          <div>
            <p className="font-medium" style={{ fontFamily: "var(--font-heading), serif", color: MASTER_BADGE_STYLE.text }}>
              Tinies Verified Professional
            </p>
            <p className="text-xs" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              Multiple specialist certifications completed on Tinies
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {certifications.map((c) => (
          <CertCard key={`${c.courseSlug}-${c.completedAt.toISOString()}`} c={c} />
        ))}
      </div>
    </section>
  );
}
