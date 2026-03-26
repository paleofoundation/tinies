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
    <div className={cn("w-full", className)} style={{ backgroundColor: "#0A8080" }}>
      <div className="mx-auto w-full max-w-[1280px] px-6 py-[clamp(4rem,8vw,8rem)] lg:px-10">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat) => (
            <div
              key={`${stat.value}-${stat.label}`}
              className="min-w-0 border-t pt-5 text-center"
              style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <p
                className="font-black uppercase leading-none text-white"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                }}
              >
                {stat.value}
              </p>
              <p
                className="mt-2 font-medium uppercase"
                style={{
                  color: "rgba(255, 255, 255, 0.72)",
                  fontFamily: "var(--font-body), sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
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
