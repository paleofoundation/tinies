import { ImageResponse } from "next/og";

/**
 * Default OG image from Refine Design tokens. Replace with Dzyne/Refine output: add opengraph-image.png in app/.
 */
export const alt = "Tinies - Trusted Pet Care & Rescue Adoption in Cyprus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A8080",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.02em" }}>tinies.app</div>
        <div style={{ fontSize: 28, marginTop: 12, opacity: 0.95 }}>No matter the size.</div>
        <div style={{ fontSize: 22, marginTop: 8, opacity: 0.85 }}>Trusted pet care & rescue adoption in Cyprus</div>
      </div>
    ),
    { ...size }
  );
}
