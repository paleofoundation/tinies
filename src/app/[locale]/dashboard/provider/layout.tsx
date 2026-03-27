import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Provider Dashboard",
  description: "Manage your profile, bookings, earnings, and messages.",
};

export default function ProviderDashboardLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
