import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type CharityPayoutNotificationEmailProps = {
  month: string;
  amountEur: string;
  donorCount: number;
  givingUrl?: string;
};

export default function CharityPayoutNotificationEmail({
  month,
  amountEur,
  donorCount,
  givingUrl = `${APP_URL}/giving`,
}: CharityPayoutNotificationEmailProps) {
  return (
    <EmailLayout preview={`Your Tinies Giving payout for ${month} is ${amountEur}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your Tinies Giving payout for <strong>{month}</strong> is <strong>EUR {amountEur}</strong> from{" "}
          <strong>{donorCount}</strong> supporter{donorCount === 1 ? "" : "s"}.
        </Text>
        <Link
          href={givingUrl}
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
          View Giving
        </Link>
      </Section>
    </EmailLayout>
  );
}
