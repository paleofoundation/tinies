import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/blog/why-being-second-wins",
        destination: "/blog/move-over-rover-why-being-second-wins",
        permanent: true,
      },
      {
        source: "/en/blog/why-being-second-wins",
        destination: "/en/blog/move-over-rover-why-being-second-wins",
        permanent: true,
      },
      {
        source: "/el/blog/why-being-second-wins",
        destination: "/el/blog/move-over-rover-why-being-second-wins",
        permanent: true,
      },
      {
        source: "/ru/blog/why-being-second-wins",
        destination: "/ru/blog/move-over-rover-why-being-second-wins",
        permanent: true,
      },
    ];
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    /** Base64 image payloads exceed the default ~1MB server action body limit. */
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        // Public buckets, signed URLs (/object/sign/), and any future storage paths
        pathname: "/storage/v1/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/paleofoundation/Cats/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
