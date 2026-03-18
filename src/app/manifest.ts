import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tinies",
    short_name: "Tinies",
    description: "Trusted pet care and rescue adoption in Cyprus. No matter the size.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFEF7",
    theme_color: "#2D6A4F",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any",
      },
    ],
  };
}
