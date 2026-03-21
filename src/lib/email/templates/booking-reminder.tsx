import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type BookingReminderEmailProps = {
  serviceType: string;
  time: string;
  otherPartyName?: string;
};

export default function BookingReminderEmail({ serviceType, time, otherPartyName }: BookingReminderEmailProps) {
  return (
    <EmailLayout preview={`Reminder: Your ${serviceType} booking starts tomorrow.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Reminder: Your <strong>{serviceType}</strong> with{" "}
          {otherPartyName ? <strong>{otherPartyName}</strong> : "the other party"} starts tomorrow at{" "}
          <strong>{time}</strong>.
        </Text>
      </Section>
    </EmailLayout>
  );
}
