"use client";

/**
 * Simple pulse skeleton for loading.tsx. Pass bars to match the page layout.
 */
export function PageLoadingSkeleton({
  titleBar = true,
  bars = 4,
  className = "",
}: {
  titleBar?: boolean;
  bars?: number;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto px-4 py-20 sm:px-6 sm:py-20 ${className}`}
      style={{ maxWidth: "var(--max-width)" }}
    >
      {titleBar && (
        <div
          className="h-8 w-64 rounded animate-pulse"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      )}
      <div className="mt-6 space-y-3">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded animate-pulse"
            style={{
              backgroundColor: "var(--color-border)",
              width: i === bars - 1 && bars > 2 ? "75%" : "100%",
            }}
          />
        ))}
      </div>
    </div>
  );
}
