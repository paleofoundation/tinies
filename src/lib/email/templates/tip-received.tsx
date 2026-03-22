import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type TipReceivedEmailProps = {
  amountEur: string;
  ownerName: string;
  serviceTypeLabel: string;
  bookingDate: string;
  dashboardUrl?: string;
};

export default function TipReceivedEmail({
  amountEur,
  ownerName,
  serviceTypeLabel,
  bookingDate,
  dashboardUrl = `${APP_URL}/dashboard/provider`,
}: TipReceivedEmailProps) {
  return (
    <EmailLayout preview={`${ownerName} left you a €${amountEur} tip`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{ownerName}</strong> left you a <strong>€{amountEur}</strong> tip for your {serviceTypeLabel} booking on{" "}
          {bookingDate}! Thank you for the great care you provide.
        </Text>
        <Text style={{ fontSize: "15px", lineHeight: "22px", margin: "0 0 20px", color: "#444444" }}>
          Tips are included in your next payout.
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
          View earnings
        </Link>
      </Section>
    </EmailLayout>
  );
}
