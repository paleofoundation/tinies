import { cn } from "@/lib/utils";

export type StatItem = {
  value: string;
  label: string;
};

export type StatsBandProps = {
  stats: readonly StatItem[];
  className?: string;
};

/**
 * Full-width teal band with responsive stat columns (intended for four items).
 */
export function StatsBand({ stats, className }: StatsBandProps) {
  return (
    <div
      className={cn("w-full", className)}
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="theme-container py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat) => (
            <div key={`${stat.value}-${stat.label}`} className="min-w-0 text-center">
              <p
                className="theme-display text-2xl sm:text-3xl lg:text-4xl"
                style={{ color: "var(--color-background)" }}
              >
                {stat.value}
              </p>
              <p
                className="mt-2 text-xs font-medium uppercase tracking-[0.06em] sm:text-sm"
                style={{
                  color: "rgba(255, 255, 255, 0.88)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
