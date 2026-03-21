import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";
import { BRAND_TEAL } from "@/lib/email/brand";

export type GuardianCancelledEmailProps = {
  totalDonatedEur: string;
  givingUrl: string;
};

export default function GuardianCancelledEmail({ totalDonatedEur, givingUrl }: GuardianCancelledEmailProps) {
  return (
    <EmailLayout preview="Your Guardian subscription has ended">
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your Guardian subscription is <strong>cancelled</strong>. Thank you for <strong>EUR {totalDonatedEur}</strong>{" "}
          total — the tinies remember.
        </Text>
        <Link
          href={givingUrl}
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
          Visit Tinies Giving
        </Link>
      </Section>
    </EmailLayout>
  );
}
