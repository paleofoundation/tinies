import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type PostAdoptionCheckinEmailProps = {
  animalName: string;
  timeframe: string;
  shareUpdateUrl: string;
};

export default function PostAdoptionCheckinEmail({
  animalName,
  timeframe,
  shareUpdateUrl,
}: PostAdoptionCheckinEmailProps) {
  return (
    <EmailLayout preview={`It's been ${timeframe} since ${animalName} arrived!`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          It&apos;s been <strong>{timeframe}</strong> since <strong>{animalName}</strong> arrived! Share a photo and
          update:
        </Text>
        <Link
          href={shareUpdateUrl}
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
          Share update
        </Link>
      </Section>
    </EmailLayout>
  );
}
