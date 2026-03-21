import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";
import { BRAND_TEAL } from "@/lib/email/brand";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type ReviewPromptEmailProps = {
  petName: string;
  providerName: string;
  reviewUrl?: string;
};

export default function ReviewPromptEmail({
  petName,
  providerName,
  reviewUrl = `${APP_URL}/dashboard/owner`,
}: ReviewPromptEmailProps) {
  return (
    <EmailLayout preview={`How was ${petName}'s experience with ${providerName}?`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          How was <strong>{petName}</strong>&apos;s experience with <strong>{providerName}</strong>? Leave a quick review to
          help other pet parents choose with confidence.
        </Text>
        <Link
          href={reviewUrl}
          style={{
            display: "inline-block",
            backgroundColor: BRAND_TEAL,
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            marginTop: "8px",
          }}
        >
          Leave a review
        </Link>
      </Section>
    </EmailLayout>
  );
}
