import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";
import { BRAND_TEAL } from "@/lib/email/brand";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type SignupDonationThankYouEmailProps = {
  amountEur: string;
  charityName: string;
  givingUrl?: string;
};

export default function SignupDonationThankYouEmail({
  amountEur,
  charityName,
  givingUrl = `${APP_URL}/giving`,
}: SignupDonationThankYouEmailProps) {
  return (
    <EmailLayout preview={`Thank you for €${amountEur} to ${charityName}`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Thank you for <strong>EUR {amountEur}</strong> to <strong>{charityName}</strong>! Your gift helps tinies in
          Cyprus get food, vet care, and a path to a forever home.
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
          Explore Tinies Giving
        </Link>
      </Section>
    </EmailLayout>
  );
}
