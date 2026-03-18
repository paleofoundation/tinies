"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

type Props = {
  /** Full URL to encode (e.g. https://tinies.app/give or /give/charity-slug). */
  url: string;
  /** Label for the download button and filename. */
  label?: string;
  /** Pixel size of the QR image (default 256). */
  size?: number;
};

export function QRCodeGenerator({ url, label = "QR Code", size = 256 }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fullUrl =
    url.startsWith("http") ? url : `${typeof window !== "undefined" ? window.location.origin : ""}${url.startsWith("/") ? "" : "/"}${url}`;

  useEffect(() => {
    setError(null);
    setDataUrl(null);
    QRCode.toDataURL(fullUrl, {
      width: size,
      margin: 2,
      color: { dark: "#1A1A1A", light: "#FFFEF7" },
    })
      .then(setDataUrl)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to generate QR code"));
  }, [fullUrl, size]);

  function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${label.replace(/\s+/g, "-").toLowerCase()}-qrcode.png`;
    a.click();
  }

  return (
    <div className="inline-flex flex-col items-center gap-3">
      {dataUrl && (
        <img src={dataUrl} alt="" width={size} height={size} className="rounded-lg border border-[var(--color-border)] bg-white" />
      )}
      {!dataUrl && !error && <div className="flex h-[256px] w-[256px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-sm" style={{ color: "var(--color-text-secondary)" }}>Generating…</div>}
      {dataUrl && (
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border-2 px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
