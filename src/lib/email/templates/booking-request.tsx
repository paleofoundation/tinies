import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type BookingRequestEmailProps = {
  ownerName: string;
  serviceType: string;
  date: string;
  petName: string;
  species: string;
  dashboardUrl?: string;
};

export default function BookingRequestEmail({
  ownerName,
  serviceType,
  date,
  petName,
  species,
  dashboardUrl = `${APP_URL}/dashboard/provider`,
}: BookingRequestEmailProps) {
  return (
    <EmailLayout preview={`New booking request from ${ownerName} for ${serviceType}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          New booking request from <strong>{ownerName}</strong> for <strong>{serviceType}</strong> on{" "}
          <strong>{date}</strong>.
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          {petName} ({species}). Respond within 4 hours.
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
