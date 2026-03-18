import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type PaymentReceiptEmailProps = {
  amountEur: string;
  serviceType: string;
  providerName: string;
  transactionId: string;
  dashboardUrl?: string;
};

export default function PaymentReceiptEmail({
  amountEur,
  serviceType,
  providerName,
  transactionId,
  dashboardUrl = `${APP_URL}/dashboard/owner`,
}: PaymentReceiptEmailProps) {
  return (
    <EmailLayout preview={`Payment confirmed: ${amountEur} for ${serviceType}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Payment confirmed: <strong>EUR {amountEur}</strong> for <strong>{serviceType}</strong> with{" "}
          <strong>{providerName}</strong>.
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 16px", color: "#6B7280" }}>
          Transaction ID: {transactionId}
        </Text>
        <Link
          href={dashboardUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#2D6A4F",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            marginTop: "8px",
          }}
        >
          View booking
        </Link>
      </Section>
    </EmailLayout>
  );
}
