import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type FeedbackSubmittedEmailProps = {
  typeLabel: string;
  description: string;
  email: string;
  pageUrl: string;
  userAgent: string;
  screenshotUrl: string | null;
  submittedByUserId: string | null;
};

export default function FeedbackSubmittedEmail({
  typeLabel,
  description,
  email,
  pageUrl,
  userAgent,
  screenshotUrl,
  submittedByUserId,
}: FeedbackSubmittedEmailProps) {
  return (
    <EmailLayout preview={`New ${typeLabel} on Tinies`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 12px", color: "#1A1A1A" }}>
          <strong>Type:</strong> {typeLabel}
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 12px", color: "#1A1A1A" }}>
          <strong>Description</strong>
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 16px", color: "#333333", whiteSpace: "pre-wrap" }}>
          {description}
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 8px", color: "#333333" }}>
          <strong>Contact email:</strong> {email || "—"}
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 8px", color: "#333333" }}>
          <strong>Page URL:</strong>{" "}
          <Link href={pageUrl} style={{ color: "#0A8080" }}>
            {pageUrl}
          </Link>
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 8px", color: "#333333" }}>
          <strong>User agent:</strong> {userAgent || "—"}
        </Text>
        {submittedByUserId ? (
          <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 8px", color: "#333333" }}>
            <strong>User ID:</strong> {submittedByUserId}
          </Text>
        ) : null}
        {screenshotUrl ? (
          <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 8px", color: "#333333" }}>
            <strong>Screenshot:</strong>{" "}
            <Link href={screenshotUrl} style={{ color: "#0A8080" }}>
              View image
            </Link>
          </Text>
        ) : null}
      </Section>
    </EmailLayout>
  );
}
