import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register your rescue | Tinies",
  description:
    "Create a free rescue organisation account on Tinies. List adoptable animals, manage applications, and reach adopters in Cyprus and across Europe.",
};

export default function RescueSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
