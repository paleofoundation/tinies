import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function SearchLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="mx-auto px-4 py-8 sm:px-6" style={{ maxWidth: "var(--max-width)" }}>
        <div className="h-8 w-48 rounded animate-pulse mb-6" style={{ backgroundColor: "var(--color-border)" }} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-[var(--radius-lg)] animate-pulse"
              style={{ backgroundColor: "var(--color-border)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
