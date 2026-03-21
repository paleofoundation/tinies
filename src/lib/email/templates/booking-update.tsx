import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type BookingUpdateEmailProps = {
  ownerName: string;
  providerName: string;
  petNames: string;
  dashboardUrl?: string;
};

export default function BookingUpdateEmail({
  ownerName,
  providerName,
  petNames,
  dashboardUrl = `${APP_URL}/dashboard/owner?tab=bookings`,
}: BookingUpdateEmailProps) {
  return (
    <EmailLayout preview={`${providerName} sent a photo update for ${petNames}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Hi {ownerName},
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{providerName}</strong> sent a photo update for <strong>{petNames}</strong>!
        </Text>
        <Text style={{ fontSize: "15px", lineHeight: "22px", margin: "0 0 20px", color: "#444444" }}>
          Open your Tinies dashboard to see the latest moments from their visit.
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
          View update
        </Link>
      </Section>
    </EmailLayout>
  );
}
