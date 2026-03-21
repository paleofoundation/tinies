import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type PayoutProcessedEmailProps = {
  amountEur: string;
  dashboardUrl?: string;
};

export default function PayoutProcessedEmail({
  amountEur,
  dashboardUrl = `${APP_URL}/dashboard/provider`,
}: PayoutProcessedEmailProps) {
  return (
    <EmailLayout preview={`Your payout of ${amountEur} has been sent.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your weekly payout of <strong>EUR {amountEur}</strong> has been sent to your bank account.
        </Text>
        <Link
          href={dashboardUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#0A8080",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            marginTop: "8px",
          }}
        >
          View dashboard
        </Link>
      </Section>
    </EmailLayout>
  );
}
