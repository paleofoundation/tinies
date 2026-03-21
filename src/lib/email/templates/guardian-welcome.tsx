import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";
import { BRAND_TEAL } from "@/lib/email/brand";

export type GuardianWelcomeEmailProps = {
  firstName: string;
  amountMonthlyEur: string;
  givingUrl: string;
};

export default function GuardianWelcomeEmail({
  firstName,
  amountMonthlyEur,
  givingUrl,
}: GuardianWelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome, Tinies Guardian!">
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Hi <strong>{firstName}</strong>,
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Welcome, <strong>Tinies Guardian</strong>! Your monthly <strong>EUR {amountMonthlyEur}</strong> starts today.
          Your Guardian badge is active on your profile where you&apos;ve enabled it.
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
          Manage Giving
        </Link>
      </Section>
    </EmailLayout>
  );
}
