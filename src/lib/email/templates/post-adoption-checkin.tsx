import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";
import { BRAND_TEAL } from "@/lib/email/brand";

export type PostAdoptionPhase = "1w" | "1m" | "3m";

export type PostAdoptionCheckinEmailProps = {
  animalName: string;
  phase: PostAdoptionPhase;
  shareUpdateUrl: string;
};

function copyForPhase(animalName: string, phase: PostAdoptionPhase): { preview: string; body: React.ReactNode } {
  switch (phase) {
    case "1m":
      return {
        preview: `One month with ${animalName}!`,
        body: (
          <>
            <strong>One month</strong> with <strong>{animalName}</strong>! Share an update and a photo from their new home
            for <strong>Tinies who made it</strong>:
          </>
        ),
      };
    case "3m":
      return {
        preview: `Three months with ${animalName}!`,
        body: (
          <>
            <strong>Three months</strong> with <strong>{animalName}</strong>! Their story could inspire the next adoption.
            Share for <strong>Tinies who made it</strong>:
          </>
        ),
      };
    default:
      return {
        preview: `It's been one week since ${animalName} arrived!`,
        body: (
          <>
            It&apos;s been <strong>one week</strong> since <strong>{animalName}</strong> arrived! Share a photo and a few
            words for <strong>Tinies who made it</strong> — our gallery of happy adoptions:
          </>
        ),
      };
  }
}

export default function PostAdoptionCheckinEmail({
  animalName,
  phase,
  shareUpdateUrl,
}: PostAdoptionCheckinEmailProps) {
  const { preview, body } = copyForPhase(animalName, phase);
  return (
    <EmailLayout preview={preview}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>{body}</Text>
        <Link
          href={shareUpdateUrl}
          style={{
            display: "inline-block",
            backgroundColor: BRAND_TEAL,
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            marginTop: "8px",
          }}
        >
          Share your story
        </Link>
      </Section>
    </EmailLayout>
  );
}
