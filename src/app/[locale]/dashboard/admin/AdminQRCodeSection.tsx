"use client";

import { useState } from "react";
import { QRCodeGenerator } from "@/components/giving/QRCodeGenerator";

type Charity = { id: string; name: string; slug: string };

export function AdminQRCodeSection({ charities }: { charities: Charity[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string>(charities[0]?.slug ?? "");
  const selectedCharity = charities.find((c) => c.slug === selectedSlug);

  return (
    <section className="mt-8 rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
      <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
        Quick Donate QR Codes
      </h2>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Generate QR codes for the /giving/donate page. Download as PNG for print.
      </p>
      <div className="mt-6 flex flex-wrap gap-12">
        <div>
          <p className="mb-2 text-sm font-medium" style={{ color: "var(--color-text)" }}>General give page</p>
          <QRCodeGenerator url="/giving/donate" label="tinies-give" size={200} />
        </div>
        {charities.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium" style={{ color: "var(--color-text)" }}>Charity-specific</p>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="mb-3 w-full max-w-xs rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
            >
              {charities.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            {selectedSlug && selectedCharity && (
              <QRCodeGenerator url={`/giving/${selectedSlug}`} label={selectedCharity.name} size={200} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
