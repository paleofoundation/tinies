import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type MonthlyGivingReceiptEmailProps = {
  month: string;
  roundUpsEur: string;
  guardianEur: string;
  totalEur: string;
  charityNames: string[];
  givingUrl?: string;
};

export default function MonthlyGivingReceiptEmail({
  month,
  roundUpsEur,
  guardianEur,
  totalEur,
  charityNames,
  givingUrl = `${APP_URL}/giving`,
}: MonthlyGivingReceiptEmailProps) {
  return (
    <EmailLayout preview={`Your Tinies Giving summary for ${month}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your Tinies Giving summary for <strong>{month}</strong>:
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 8px", color: "#1A1A1A" }}>
          Round-ups: EUR {roundUpsEur}. Guardian: EUR {guardianEur}. Total: EUR {totalEur}.
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 16px", color: "#6B7280" }}>
          Charities supported: {charityNames.length > 0 ? charityNames.join(", ") : "—"}
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
