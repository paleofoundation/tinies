import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getProviderCoursePageState } from "@/lib/training/course-actions";
import { badgeColorVar } from "@/lib/training/badge-styles";
import { CoursePlayer } from "../CoursePlayer";
import { Shield } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export default async function ProviderCourseSlugPage({ params }: Props) {
  const { slug } = await params;
  const state = await getProviderCoursePageState(slug);

  if (state.mode === "missing") {
    redirect("/dashboard/provider/courses");
  }

  if (state.mode === "completed") {
    const accent = badgeColorVar(state.badgeColor);
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
        <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
          <Link href="/dashboard/provider/courses" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
            ← All courses
          </Link>
          <div
            className="mt-8 rounded-[var(--radius-xl)] border p-8 text-center shadow-[var(--shadow-md)]"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accent}22`, color: accent }}
            >
              <Shield className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <h1 className="mt-6 font-normal text-2xl" style={{ fontFamily: "var(--font-heading), serif" }}>
              You&apos;ve earned this badge
            </h1>
            <p className="mt-2 text-lg font-medium" style={{ color: accent, fontFamily: "var(--font-heading), serif" }}>
              {state.badgeLabel}
            </p>
            <p className="mt-4 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
              {state.title} · Score {state.score}%
            </p>
            {state.certificateId ? (
              <p className="mt-2 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
                {state.certificateId}
              </p>
            ) : null}
            <p className="mt-4 text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
              Completed{" "}
              {new Date(state.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <Link
              href="/dashboard/provider/courses"
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-pill)] font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
            >
              Back to courses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-8 sm:px-6 lg:px-8" style={{ maxWidth: "56rem" }}>
        <Link href="/dashboard/provider/courses" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
          ← {state.course.title}
        </Link>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
          Pass the quizzes with at least {state.course.passingScore}% to earn your badge.
        </p>
        <div className="mt-8">
          <CoursePlayer course={state.course} />
        </div>
      </main>
    </div>
  );
}
