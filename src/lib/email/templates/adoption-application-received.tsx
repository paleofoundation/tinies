import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type AdoptionApplicationReceivedEmailProps = {
  animalName: string;
  species: string;
  applicantName: string;
  country: string;
  city: string;
  dashboardUrl?: string;
};

export default function AdoptionApplicationReceivedEmail({
  animalName,
  species,
  applicantName,
  country,
  city,
  dashboardUrl = "https://tinies.app/dashboard/rescue",
}: AdoptionApplicationReceivedEmailProps) {
  return (
    <EmailLayout preview={`New adoption application for ${animalName}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          You have a new adoption application for <strong>{animalName}</strong> ({species}).
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{applicantName}</strong> is based in {city}, {country}. Review their application and respond from your rescue dashboard.
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
          View application
        </Link>
      </Section>
    </EmailLayout>
  );
}
