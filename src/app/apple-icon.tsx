import { ImageResponse } from "next/og";

/**
 * Apple touch icon from Refine Design tokens (primary #0A8080).
 * Replace with Dzyne/Refine-generated asset when available: drop file in app/ as apple-icon.png.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A8080",
          borderRadius: 24,
          fontFamily: "system-ui, sans-serif",
          fontSize: 88,
          fontWeight: 700,
          color: "white",
        }}
      >
        t
      </div>
    ),
    { ...size }
  );
}
