import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type BookingAcceptedEmailProps = {
  providerName: string;
  petName: string;
  date: string;
  dashboardUrl?: string;
};

export default function BookingAcceptedEmail({
  providerName,
  petName,
  date,
  dashboardUrl = `${APP_URL}/dashboard/owner`,
}: BookingAcceptedEmailProps) {
  return (
    <EmailLayout preview={`${providerName} accepted your booking.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Great news! <strong>{providerName}</strong> accepted your booking for <strong>{petName}</strong> on{" "}
          <strong>{date}</strong>. Payment confirmed.
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
