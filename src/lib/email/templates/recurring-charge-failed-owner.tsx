import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type RecurringChargeFailedOwnerEmailProps = {
  providerName: string;
  reason: string;
};

export default function RecurringChargeFailedOwnerEmail({
  providerName,
  reason,
}: RecurringChargeFailedOwnerEmailProps) {
  return (
    <EmailLayout preview="We could not charge your card for a recurring visit">
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 12px", color: "#1A1A1A" }}>
          We couldn&apos;t charge your saved card for your next recurring visit with <strong>{providerName}</strong>.{" "}
          {reason}
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "22px", margin: 0, color: "#444444" }}>
          Your recurring schedule has been paused. Update your payment method in your dashboard, then resume the series when
          you&apos;re ready.
        </Text>
        <Link
          href={`${APP_URL}/dashboard/owner`}
          style={{ display: "inline-block", marginTop: "16px", color: "#0A8080", fontWeight: 600, fontSize: "14px" }}
        >
          Open owner dashboard
        </Link>
      </Section>
    </EmailLayout>
  );
}
