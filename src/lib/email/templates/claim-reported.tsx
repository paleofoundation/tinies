import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const CLAIM_TYPE_LABELS: Record<string, string> = {
  pet_injury: "Pet injury",
  property_damage: "Property damage",
  provider_no_show: "Provider no-show",
  owner_no_show: "Owner no-show",
};

export type ClaimReportedEmailProps = {
  reporterName: string;
  bookingId: string;
  claimType: string;
  description: string;
  responseDeadline: string;
  dashboardUrl: string;
};

export default function ClaimReportedEmail({
  reporterName,
  bookingId,
  claimType,
  description,
  responseDeadline,
  dashboardUrl,
}: ClaimReportedEmailProps) {
  const typeLabel = CLAIM_TYPE_LABELS[claimType] ?? claimType;
  return (
    <EmailLayout preview={`Guarantee claim filed by ${reporterName}. Response needed within 48 hours.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{reporterName}</strong> has filed a guarantee claim regarding a completed booking.
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Type: <strong>{typeLabel}</strong>
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Description: {description}
          {description.length >= 200 ? "…" : ""}
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#DC2626", fontWeight: 600 }}>
          Please respond within 48 hours. Deadline: {responseDeadline}
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
          View claim & respond
        </Link>
      </Section>
    </EmailLayout>
  );
}
