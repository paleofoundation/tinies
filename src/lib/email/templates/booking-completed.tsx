import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type BookingCompletedEmailOwnerProps = {
  serviceType: string;
  providerName: string;
  dashboardUrl?: string;
};

export type BookingCompletedEmailProviderProps = {
  serviceType: string;
};

export function BookingCompletedOwnerEmail({
  serviceType,
  providerName,
  dashboardUrl = `${APP_URL}/dashboard/owner`,
}: BookingCompletedEmailOwnerProps) {
  return (
    <EmailLayout preview={`Your ${serviceType} is complete! Leave a review.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Your <strong>{serviceType}</strong> is complete! Leave a review for <strong>{providerName}</strong>.
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
          Leave a review
        </Link>
      </Section>
    </EmailLayout>
  );
}

export function BookingCompletedProviderEmail({ serviceType }: BookingCompletedEmailProviderProps) {
  return (
    <EmailLayout preview="Great work! Your earnings will be in your next payout.">
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Great work! Your <strong>{serviceType}</strong> booking is complete. Your earnings will be in your next
          payout.
        </Text>
      </Section>
    </EmailLayout>
  );
}
