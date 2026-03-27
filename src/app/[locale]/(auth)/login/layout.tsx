import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Tinies account. No matter the size.",
};

export default function LoginLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
