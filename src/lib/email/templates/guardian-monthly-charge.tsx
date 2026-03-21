import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";
import { BRAND_TEAL } from "@/lib/email/brand";

export type GuardianMonthlyChargeEmailProps = {
  amountEur: string;
  monthLabel: string;
  givingUrl: string;
};

export default function GuardianMonthlyChargeEmail({
  amountEur,
  monthLabel,
  givingUrl,
}: GuardianMonthlyChargeEmailProps) {
  return (
    <EmailLayout preview={`Guardian donation processed for ${monthLabel}`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your Guardian donation of <strong>EUR {amountEur}</strong> was processed for <strong>{monthLabel}</strong>.
          Thank you for standing up for the tinies.
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
          View Giving
        </Link>
      </Section>
    </EmailLayout>
  );
}
