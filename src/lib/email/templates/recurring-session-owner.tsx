import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type RecurringSessionOwnerEmailProps = {
  providerName: string;
  dateLabel: string;
  serviceTypeLabel: string;
};

export default function RecurringSessionOwnerEmail({
  providerName,
  dateLabel,
  serviceTypeLabel,
}: RecurringSessionOwnerEmailProps) {
  return (
    <EmailLayout preview={`Your recurring ${serviceTypeLabel} is confirmed`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: 0, color: "#1A1A1A" }}>
          Your recurring <strong>{serviceTypeLabel}</strong> with <strong>{providerName}</strong> is confirmed for{" "}
          <strong>{dateLabel}</strong>. We charged your saved card for this session.
        </Text>
      </Section>
    </EmailLayout>
  );
}
