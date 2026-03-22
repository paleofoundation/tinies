import Link from "next/link";
import { getFeedbackListForAdmin } from "@/lib/feedback/admin-actions";
import { FEEDBACK_STATUSES, FEEDBACK_TYPES } from "@/lib/validations/feedback";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  bug: "Bug",
  feature: "Feature",
  general: "General",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  in_progress: "In progress",
  resolved: "Resolved",
  wont_fix: "Won't fix",
};

type Props = {
  searchParams: Promise<{ type?: string; status?: string }>;
};

function excerpt(text: string, max = 120): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default async function AdminFeedbackListPage({ searchParams }: Props) {
  const params = await searchParams;
  const typeFilter = typeof params.type === "string" ? params.type : undefined;
  const statusFilter = typeof params.status === "string" ? params.status : undefined;

  const { rows, error } = await getFeedbackListForAdmin({
    type: typeFilter,
    status: statusFilter,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 sm:py-20" style={{ maxWidth: "var(--max-width)" }}>
        <p className="mb-4">
          <Link href="/dashboard/admin" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
            ← Admin dashboard
          </Link>
        </p>
        <h1
          className="font-normal sm:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          Feedback
        </h1>
        <p className="mt-1" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Beta bug reports, feature requests, and general feedback.
        </p>

        <form method="get" className="mt-6 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="filter-type" className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Type
            </label>
            <select
              id="filter-type"
              name="type"
              defaultValue={typeFilter ?? ""}
              className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", fontFamily: "var(--font-body), sans-serif" }}
            >
              <option value="">All types</option>
              {FEEDBACK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-status" className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Status
            </label>
            <select
              id="filter-status"
              name="status"
              defaultValue={statusFilter ?? ""}
              className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", fontFamily: "var(--font-body), sans-serif" }}
            >
              <option value="">All statuses</option>
              {FEEDBACK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-10 rounded-lg px-4 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
          >
            Apply filters
          </button>
          {(typeFilter || statusFilter) && (
            <Link
              href="/dashboard/admin/feedback"
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
            >
              Clear
            </Link>
          )}
        </form>

        {error ? (
          <p className="mt-6 text-sm" style={{ color: "var(--color-error)", fontFamily: "var(--font-body), sans-serif" }}>
            {error}
          </p>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <table className="w-full min-w-[720px] text-sm" style={{ fontFamily: "var(--font-body), sans-serif" }}>
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Excerpt</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center" style={{ color: "var(--color-text-secondary)" }}>
                    No feedback yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const displayEmail = row.email ?? row.userEmail ?? "—";
                  return (
                    <tr key={row.id} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--color-text-secondary)" }}>
                        {new Date(row.createdAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: "var(--color-primary-50)",
                            color: "var(--color-primary)",
                            borderColor: "var(--color-primary-200)",
                          }}
                        >
                          {TYPE_LABELS[row.type] ?? row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <Link href={`/dashboard/admin/feedback/${row.id}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                          {excerpt(row.description)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                          {STATUS_LABELS[row.status] ?? row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 break-all" style={{ color: "var(--color-text-secondary)" }}>
                        {displayEmail}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
