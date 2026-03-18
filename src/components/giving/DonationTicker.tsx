"use client";

import type { TickerItem } from "@/lib/giving/actions";

type Props = {
  items: TickerItem[];
};

function TickerRow({ items }: { items: TickerItem[] }) {
  return (
    <div className="flex shrink-0 gap-8 pr-8">
      {items.map((item) => (
        <span
          key={item.id}
          className="whitespace-nowrap text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {item.type === "donation" && item.amountEur != null && (
            <>
              <strong style={{ color: "var(--color-text)" }}>{item.displayName}</strong>
              {" "}just donated EUR {item.amountEur.toFixed(0)} to {item.charityName}
            </>
          )}
          {item.type === "guardian_started" && (
            <>
              <strong style={{ color: "var(--color-text)" }}>{item.displayName}</strong>
              {" "}started a Tinies Guardian subscription → {item.charityName}
            </>
          )}
        </span>
      ))}
    </div>
  );
}

export function DonationTicker({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden border-y py-3"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      <div className="flex animate-ticker gap-8">
        <TickerRow items={items} />
        <TickerRow items={items} />
      </div>
    </div>
  );
}
