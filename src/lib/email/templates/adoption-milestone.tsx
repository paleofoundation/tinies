import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type AdoptionMilestoneEmailProps = {
  animalName: string;
  milestone: string;
  trackProgressUrl: string;
};

export default function AdoptionMilestoneEmail({
  animalName,
  milestone,
  trackProgressUrl,
}: AdoptionMilestoneEmailProps) {
  return (
    <EmailLayout preview={`${animalName} update: ${milestone}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          <strong>{animalName}</strong> update: {milestone}
        </Text>
        <Link
          href={trackProgressUrl}
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
          Track progress
        </Link>
      </Section>
    </EmailLayout>
  );
}
