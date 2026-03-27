import type { Metadata } from "next";
import { GiveQuickDonatePage } from "@/components/giving/GiveQuickDonatePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donate · Animal rescue in Cyprus",
  description:
    "Donate once or give monthly. Apple Pay, Google Pay, card. 15 seconds to support animal rescue.",
};

export default async function GivingDonatePage() {
  return <GiveQuickDonatePage />;
}
