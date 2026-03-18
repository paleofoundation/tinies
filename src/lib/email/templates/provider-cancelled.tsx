import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type ProviderCancelledEmailProps = {
  providerName: string;
  amountEur: string;
  dashboardUrl?: string;
};

export default function ProviderCancelledEmail({
  providerName,
  amountEur,
  dashboardUrl = `${APP_URL}/dashboard/owner`,
}: ProviderCancelledEmailProps) {
  return (
    <EmailLayout preview={`${providerName} has cancelled your booking.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{providerName}</strong> has cancelled your booking. Full refund of <strong>EUR {amountEur}</strong>{" "}
          initiated.
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
          View bookings
        </Link>
      </Section>
    </EmailLayout>
  );
}
