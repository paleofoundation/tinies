import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type MeetAndGreetOwnerUpdateVariant = "confirmed" | "alternative_suggested" | "declined";

export type MeetAndGreetOwnerUpdateEmailProps = {
  providerName: string;
  variant: MeetAndGreetOwnerUpdateVariant;
  petNames: string[];
  originalRequested: string;
  suggestedDate?: string;
  providerMessage?: string;
  dashboardUrl: string;
};

export default function MeetAndGreetOwnerUpdateEmail({
  providerName,
  variant,
  petNames,
  originalRequested,
  suggestedDate,
  providerMessage,
  dashboardUrl,
}: MeetAndGreetOwnerUpdateEmailProps) {
  const title =
    variant === "confirmed"
      ? "Your Meet & Greet is confirmed"
      : variant === "alternative_suggested"
        ? "Alternative time suggested"
        : "Meet & Greet request declined";

  return (
    <EmailLayout preview={`${providerName}: ${title}`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{providerName}</strong> has updated your Meet & Greet request.
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Pets: <strong>{petNames.join(", ")}</strong>
        </Text>
        {variant === "confirmed" ? (
          <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
            They confirmed your requested time: <strong>{originalRequested}</strong>
          </Text>
        ) : (
          <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
            Your preferred time: <strong>{originalRequested}</strong>
          </Text>
        )}
        {variant === "alternative_suggested" && suggestedDate && (
          <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
            Suggested time: <strong>{suggestedDate}</strong>
          </Text>
        )}
        {variant === "declined" && (
          <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
            They are not available for this Meet & Greet. You can try another provider or send a new request later.
          </Text>
        )}
        {providerMessage && (
          <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
            Message: {providerMessage}
          </Text>
        )}
        {(variant === "alternative_suggested" || variant === "confirmed") && (
          <Link
            href={dashboardUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#0A8080",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              marginTop: "8px",
            }}
          >
            {variant === "alternative_suggested" ? "View & confirm in dashboard" : "Open dashboard"}
          </Link>
        )}
      </Section>
    </EmailLayout>
  );
}
