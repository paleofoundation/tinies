import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";
import { BRAND_TEAL } from "@/lib/email/brand";

export type GuardianPausedEmailProps = {
  totalDonatedEur: string;
  givingUrl: string;
};

export default function GuardianPausedEmail({ totalDonatedEur, givingUrl }: GuardianPausedEmailProps) {
  return (
    <EmailLayout preview="Your Guardian subscription is paused">
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your Guardian subscription is <strong>paused</strong>. You can resume anytime from your Giving settings.
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#374151" }}>
          Total donated through Guardian so far: <strong>EUR {totalDonatedEur}</strong>.
        </Text>
        <Link
          href={givingUrl}
          style={{
            display: "inline-block",
            backgroundColor: BRAND_TEAL,
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            marginTop: "8px",
          }}
        >
          Resume or manage
        </Link>
      </Section>
    </EmailLayout>
  );
}
