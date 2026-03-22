import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type RecurringSessionProviderEmailProps = {
  ownerName: string;
  dateLabel: string;
  serviceTypeLabel: string;
};

export default function RecurringSessionProviderEmail({
  ownerName,
  dateLabel,
  serviceTypeLabel,
}: RecurringSessionProviderEmailProps) {
  return (
    <EmailLayout preview={`Recurring booking from ${ownerName}`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: 0, color: "#1A1A1A" }}>
          Recurring booking from <strong>{ownerName}</strong> for <strong>{dateLabel}</strong> ({serviceTypeLabel}). Payment was
          captured automatically for this session.
        </Text>
      </Section>
    </EmailLayout>
  );
}
