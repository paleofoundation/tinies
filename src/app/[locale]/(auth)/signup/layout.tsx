import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Tinies account. Pet owners, providers, rescues, and adopters welcome.",
};

export default function SignupLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
