import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type OwnerCancelledEmailProps = {
  ownerName: string;
  date: string;
  refundNote: string;
  dashboardUrl?: string;
};

export default function OwnerCancelledEmail({
  ownerName,
  date,
  refundNote,
  dashboardUrl = `${APP_URL}/dashboard/provider`,
}: OwnerCancelledEmailProps) {
  return (
    <EmailLayout preview={`${ownerName} cancelled the booking for ${date}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{ownerName}</strong> has cancelled the booking for <strong>{date}</strong>.
        </Text>
        {refundNote && (
          <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#6B7280" }}>
            {refundNote}
          </Text>
        )}
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
