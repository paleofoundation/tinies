import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";
import { BRAND_TEAL } from "@/lib/email/brand";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type CaseResolvedEmailProps = {
  caseLabel: string;
  summary: string;
  dashboardUrl?: string;
};

export default function CaseResolvedEmail({
  caseLabel,
  summary,
  dashboardUrl = `${APP_URL}/dashboard/owner`,
}: CaseResolvedEmailProps) {
  return (
    <EmailLayout preview={`${caseLabel} resolved`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your <strong>{caseLabel}</strong> has been resolved.
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#374151" }}>
          <strong>Ruling / summary:</strong> {summary}
        </Text>
        <Link
          href={dashboardUrl}
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
          View dashboard
        </Link>
      </Section>
    </EmailLayout>
  );
}
