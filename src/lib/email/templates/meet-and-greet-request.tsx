import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type MeetAndGreetRequestEmailProps = {
  ownerName: string;
  petNames: string[];
  requestedDate: string;
  locationType: string;
  notes?: string;
  dashboardUrl: string;
};

export default function MeetAndGreetRequestEmail({
  ownerName,
  petNames,
  requestedDate,
  locationType,
  notes,
  dashboardUrl,
}: MeetAndGreetRequestEmailProps) {
  return (
    <EmailLayout preview={`Meet & Greet request from ${ownerName}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{ownerName}</strong> has requested a Meet & Greet with you.
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Pets: <strong>{petNames.join(", ")}</strong>
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Preferred date/time: <strong>{requestedDate}</strong>
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Location: <strong>{locationType}</strong>
        </Text>
        {notes && (
          <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
            Notes: {notes}
          </Text>
        )}
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
          View request & respond
        </Link>
      </Section>
    </EmailLayout>
  );
}
