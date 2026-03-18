import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type BookingExpiredEmailProps = {
  providerName: string;
  dashboardUrl?: string;
};

export default function BookingExpiredEmail({
  providerName,
  dashboardUrl = `${APP_URL}/dashboard/owner`,
}: BookingExpiredEmailProps) {
  return (
    <EmailLayout preview="Your booking request expired.">
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your booking request expired because <strong>{providerName}</strong> did not respond. Your payment has been
          released.
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
          Find another provider
        </Link>
      </Section>
    </EmailLayout>
  );
}
