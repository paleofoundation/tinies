import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type ProviderIdentityVerifiedEmailProps = {
  providerName: string;
  dashboardUrl?: string;
};

export default function ProviderIdentityVerifiedEmail({
  providerName,
  dashboardUrl = `${APP_URL}/dashboard/provider`,
}: ProviderIdentityVerifiedEmailProps) {
  return (
    <EmailLayout preview="Your identity has been verified!">
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Hi {providerName},
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your identity has been verified! Your profile is now live and visible to pet owners in search.
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
          Go to dashboard
        </Link>
      </Section>
    </EmailLayout>
  );
}
