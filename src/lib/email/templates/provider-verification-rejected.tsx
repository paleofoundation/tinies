import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type ProviderVerificationRejectedEmailProps = {
  providerName: string;
  reason: string;
};

export default function ProviderVerificationRejectedEmail({
  providerName,
  reason,
}: ProviderVerificationRejectedEmailProps) {
  return (
    <EmailLayout preview="Identity verification update">
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Hi {providerName},
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          We were unable to verify your identity at this time.
        </Text>
        {reason && (
          <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
            Reason: {reason}
          </Text>
        )}
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Please upload a different document or try again. If you have questions, reply to this email.
        </Text>
      </Section>
    </EmailLayout>
  );
}
