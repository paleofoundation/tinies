import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  service_quality: "Service quality",
  pet_welfare: "Pet welfare",
  communication: "Communication",
  payment: "Payment",
};

export type DisputeReportedEmailProps = {
  reporterName: string;
  bookingId: string;
  disputeType: string;
  description: string;
  responseDeadline: string;
  dashboardUrl: string;
};

export default function DisputeReportedEmail({
  reporterName,
  bookingId,
  disputeType,
  description,
  responseDeadline,
  dashboardUrl,
}: DisputeReportedEmailProps) {
  const typeLabel = DISPUTE_TYPE_LABELS[disputeType] ?? disputeType;
  return (
    <EmailLayout preview={`Dispute reported by ${reporterName}. Response needed within 48 hours.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{reporterName}</strong> has reported a dispute regarding a completed booking.
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
            backgroundColor: "#0A8080",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            marginTop: "8px",
          }}
        >
          View dispute & respond
        </Link>
      </Section>
    </EmailLayout>
  );
}
