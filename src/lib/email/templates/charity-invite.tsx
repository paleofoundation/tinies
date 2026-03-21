import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type CharityInviteEmailProps = {
  contactName: string;
  charityName: string;
  adminName: string;
  inviteUrl: string;
};

export default function CharityInviteEmail({
  contactName,
  charityName,
  adminName,
  inviteUrl,
}: CharityInviteEmailProps) {
  return (
    <EmailLayout preview={`${charityName} is set up on Tinies — finish your account`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Hi {contactName},
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{adminName}</strong> from Tinies has set up <strong>{charityName}</strong> on tinies.app to start receiving donations from pet owners across Cyprus.
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Click the button below to finish setting up your account. You can log in if you already have a Tinies account, or create one to access your charity dashboard and see incoming donations.
        </Text>
        <Link
          href={inviteUrl}
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
          Finish setting up your account
        </Link>
      </Section>
    </EmailLayout>
  );
}
