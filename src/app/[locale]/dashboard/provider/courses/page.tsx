import { Link } from "@/i18n/navigation";
import { listProviderTrainingCourses } from "@/lib/training/course-actions";
import { badgeColorVar } from "@/lib/training/badge-styles";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProviderCoursesPage() {
  const courses = await listProviderTrainingCourses();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-12 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <Link href="/dashboard/provider" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
          ← Back to dashboard
        </Link>
        <h1 className="mt-6 font-normal text-3xl" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          Training & certifications
        </h1>
        <p className="mt-2 max-w-2xl text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Build trust with pet owners. Complete courses to earn badges on your public profile. Required courses must be passed to appear in search.
        </p>

        {courses.length === 0 ? (
          <p className="mt-10 rounded-[var(--radius-xl)] border p-8 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
            No training courses are available yet. If you&apos;re a provider and expected to see courses, ask your admin to run the database seed.
          </p>
        ) : null}

        <ul className="mt-10 grid list-none gap-6 sm:grid-cols-2">
          {courses.map((c) => {
            const cert = c.certification;
            const done = cert?.passed === true;
            const failed = cert && !cert.passed;
            const color = badgeColorVar(c.badgeColor);
            return (
              <li
                key={c.id}
                className="flex flex-col rounded-[var(--radius-xl)] border p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                style={{
                  borderColor: c.required ? "var(--color-primary-200)" : "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                {c.required ? (
                  <span
                    className="mb-3 inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: "var(--color-primary-muted-12)", color: "var(--color-primary)" }}
                  >
                    Complete to appear in search
                  </span>
                ) : null}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}18`, color }}>
                    <Shield className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-normal text-lg" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                      {c.title}
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
                      {c.description}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
                      ~{c.estimatedMinutes} min · {c.totalSlides} slides · Pass {c.passingScore}%+
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                    Badge: {c.badgeLabel}
                  </span>
                </div>
                <div className="mt-4">
                  {done ? (
                    <p className="text-sm font-semibold" style={{ color: "var(--color-success)", fontFamily: "var(--font-body), sans-serif" }}>
                      Completed · {cert!.score}%
                      {cert!.certificateId ? ` · ${cert.certificateId}` : ""}
                    </p>
                  ) : failed ? (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
                      Last attempt: {cert!.score}% — try again when you&apos;re ready.
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
                      Not started
                    </p>
                  )}
                  {!done ? (
                    <Link
                      href={`/dashboard/provider/courses/${c.slug}`}
                      className="mt-3 inline-flex h-11 items-center justify-center rounded-[var(--radius-pill)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
                    >
                      {failed ? "Continue / retake" : "Start course"}
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
