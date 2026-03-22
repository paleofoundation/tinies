import Link from "next/link";
import { notFound } from "next/navigation";
import { getFeedbackByIdForAdmin } from "@/lib/feedback/admin-actions";
import { AdminFeedbackUpdateForm } from "@/app/[locale]/dashboard/admin/feedback/AdminFeedbackUpdateForm";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  bug: "Bug report",
  feature: "Feature request",
  general: "General feedback",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  in_progress: "In progress",
  resolved: "Resolved",
  wont_fix: "Won't fix",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminFeedbackDetailPage({ params }: Props) {
  const { id } = await params;
  const { feedback, error } = await getFeedbackByIdForAdmin(id);

  if (error || !feedback) {
    notFound();
  }

  const displayEmail = feedback.email ?? feedback.user?.email ?? "—";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 sm:py-20" style={{ maxWidth: "var(--max-width)" }}>
        <p className="mb-4">
          <Link href="/dashboard/admin/feedback" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
            ← All feedback
          </Link>
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <h1
            className="font-normal sm:text-3xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            Feedback detail
          </h1>
          <span
            className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--color-primary-50)",
              color: "var(--color-primary)",
              borderColor: "var(--color-primary-200)",
              fontFamily: "var(--font-body), sans-serif",
            }}
          >
            {TYPE_LABELS[feedback.type] ?? feedback.type}
          </span>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
            {STATUS_LABELS[feedback.status] ?? feedback.status}
          </span>
        </div>

        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
          {new Date(feedback.createdAt).toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <section className="mt-8 rounded-[var(--radius-lg)] border p-6" style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading), serif" }}>
            Description
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
            {feedback.description}
          </p>

          <dl className="mt-6 grid gap-3 text-sm" style={{ fontFamily: "var(--font-body), sans-serif" }}>
            <div>
              <dt className="font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                Contact / user email
              </dt>
              <dd style={{ color: "var(--color-text)" }}>{displayEmail}</dd>
            </div>
            {feedback.user ? (
              <div>
                <dt className="font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  Account
                </dt>
                <dd style={{ color: "var(--color-text)" }}>
                  {feedback.user.name} ({feedback.user.id})
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                Page URL
              </dt>
              <dd>
                <a href={feedback.pageUrl} className="break-all text-[var(--color-primary)] underline hover:opacity-90">
                  {feedback.pageUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                User agent
              </dt>
              <dd className="break-all" style={{ color: "var(--color-text)" }}>
                {feedback.userAgent ?? "—"}
              </dd>
            </div>
          </dl>

          {feedback.screenshotUrl ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                Screenshot
              </h3>
              <div className="relative mt-2 max-h-[480px] max-w-full overflow-auto rounded-lg border" style={{ borderColor: "var(--color-border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- dynamic storage URL, dimensions unknown */}
                <img
                  src={feedback.screenshotUrl}
                  alt="Feedback screenshot"
                  className="max-h-[480px] w-auto max-w-full object-contain"
                />
              </div>
              <p className="mt-2 text-xs break-all" style={{ color: "var(--color-text-muted)" }}>
                <a href={feedback.screenshotUrl} className="underline hover:opacity-90" style={{ color: "var(--color-primary)" }}>
                  Open image URL
                </a>
              </p>
            </div>
          ) : null}
        </section>

        <section className="mt-8 rounded-[var(--radius-lg)] border p-6" style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading), serif" }}>
            Admin
          </h2>
          <AdminFeedbackUpdateForm id={feedback.id} initialStatus={feedback.status} initialNotes={feedback.adminNotes} />
        </section>
      </main>
    </div>
  );
}
