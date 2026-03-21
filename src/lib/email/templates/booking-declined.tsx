import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type BookingDeclinedEmailProps = {
  providerName: string;
  dashboardUrl?: string;
};

export default function BookingDeclinedEmail({
  providerName,
  dashboardUrl = `${APP_URL}/dashboard/owner`,
}: BookingDeclinedEmailProps) {
  return (
    <EmailLayout preview={`${providerName} is unable to accept your booking.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{providerName}</strong> is unable to accept your booking. Your payment has been released.
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
          Find another provider
        </Link>
      </Section>
    </EmailLayout>
  );
}
