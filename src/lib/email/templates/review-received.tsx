import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type ReviewReceivedEmailProps = {
  ownerName: string;
  rating: number;
  dashboardUrl?: string;
};

export default function ReviewReceivedEmail({
  ownerName,
  rating,
  dashboardUrl = `${APP_URL}/dashboard/provider`,
}: ReviewReceivedEmailProps) {
  return (
    <EmailLayout preview={`${ownerName} left you a ${rating}-star review!`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{ownerName}</strong> left you a <strong>{rating}-star</strong> review!
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
          View review
        </Link>
      </Section>
    </EmailLayout>
  );
}
