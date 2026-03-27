import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Edit Profile · Tinies Provider" },
  description: "Complete your provider profile: photo, bio, services, availability, and verification.",
};

export default function EditProfileLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
