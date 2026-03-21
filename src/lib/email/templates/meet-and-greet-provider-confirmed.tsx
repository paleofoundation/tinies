import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type MeetAndGreetProviderConfirmedEmailProps = {
  ownerName: string;
  petNames: string[];
  confirmedDate: string;
  dashboardUrl: string;
};

export default function MeetAndGreetProviderConfirmedEmail({
  ownerName,
  petNames,
  confirmedDate,
  dashboardUrl,
}: MeetAndGreetProviderConfirmedEmailProps) {
  return (
    <EmailLayout preview={`${ownerName} confirmed your suggested Meet & Greet time.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{ownerName}</strong> accepted your suggested time for a Meet & Greet.
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Pets: <strong>{petNames.join(", ")}</strong>
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          Confirmed time: <strong>{confirmedDate}</strong>
        </Text>
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
          View in dashboard
        </Link>
      </Section>
    </EmailLayout>
  );
}
