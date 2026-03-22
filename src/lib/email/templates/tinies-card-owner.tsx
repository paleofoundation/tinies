import { Section, Text, Link, Img, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

const ACTIVITY_EMOJI: Record<string, string> = {
  pee: "🐾",
  poo: "🐾",
  food: "🍽️",
  water: "💧",
  medication: "💊",
  play: "🎾",
  rest: "😴",
  other: "✨",
};

const MOOD_LABEL: Record<string, string> = {
  happy: "Happy",
  calm: "Calm",
  playful: "Playful",
  tired: "Tired",
  anxious: "Anxious",
};

export type TiniesCardOwnerEmailProps = {
  ownerFirstName: string;
  petName: string;
  providerName: string;
  serviceType: string;
  mood: string;
  activities: { type: string; time: string; notes: string }[];
  personalNote: string;
  photoUrls: string[];
  walkDistanceKm?: number;
  walkDurationMinutes?: number;
  walkMapImageUrl?: string;
  cardUrl: string;
  dashboardUrl: string;
  givingAmountEur: string;
  /** Owner page where they can leave a tip (optional). */
  tippingUrl?: string;
};

export default function TiniesCardOwnerEmail({
  ownerFirstName,
  petName,
  providerName,
  serviceType,
  mood,
  activities,
  personalNote,
  photoUrls,
  walkDistanceKm,
  walkDurationMinutes,
  walkMapImageUrl,
  cardUrl,
  dashboardUrl,
  givingAmountEur,
  tippingUrl,
}: TiniesCardOwnerEmailProps) {
  const moodLabel = MOOD_LABEL[mood] ?? mood;
  return (
    <EmailLayout preview={`Here's ${petName}'s Tinies Card from ${providerName}`}>
      <Section>
        <Text style={{ fontSize: "18px", lineHeight: "26px", margin: "0 0 12px", color: "#1A1A1A", fontWeight: 600 }}>
          Here&apos;s {petName}&apos;s Tinies Card from {providerName}
        </Text>
        <Text style={{ fontSize: "15px", lineHeight: "22px", margin: "0 0 20px", color: "#444444" }}>
          Hi {ownerFirstName}, your {serviceType.toLowerCase()} is complete. Here&apos;s how the day went.
        </Text>

        {photoUrls.length > 0 ? (
          <Row style={{ marginBottom: "20px" }}>
            {photoUrls.slice(0, 4).map((url, i) => (
              <Column key={i} style={{ width: "25%", paddingRight: i < 3 ? "6px" : "0" }}>
                <Img src={url} alt="" width="140" height="100" style={{ borderRadius: "8px", objectFit: "cover", width: "100%", height: "auto" }} />
              </Column>
            ))}
          </Row>
        ) : null}

        {(walkMapImageUrl != null && walkMapImageUrl.length > 0) || walkDistanceKm != null || walkDurationMinutes != null ? (
          <Section style={{ marginBottom: "20px" }}>
            <Text style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 8px", color: "#1A1A1A" }}>Walk</Text>
            {walkMapImageUrl ? (
              <Img src={walkMapImageUrl} alt="Walk route" width="560" style={{ borderRadius: "8px", maxWidth: "100%", height: "auto" }} />
            ) : null}
            <Text style={{ fontSize: "14px", lineHeight: "20px", margin: "10px 0 0", color: "#444444" }}>
              {walkDistanceKm != null ? <>{walkDistanceKm.toFixed(2)} km</> : null}
              {walkDistanceKm != null && walkDurationMinutes != null ? " · " : null}
              {walkDurationMinutes != null ? <>{walkDurationMinutes} min</> : null}
            </Text>
          </Section>
        ) : null}

        <Text style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 8px", color: "#1A1A1A" }}>Activity log</Text>
        {activities.length > 0 ? (
          <Section style={{ marginBottom: "16px" }}>
            {activities.map((a, i) => (
              <Text key={i} style={{ fontSize: "14px", lineHeight: "22px", margin: "0 0 6px", color: "#333333" }}>
                {ACTIVITY_EMOJI[a.type] ?? "•"} <strong>{a.time}</strong> · {a.type}
                {a.notes?.trim() ? ` — ${a.notes.trim()}` : ""}
              </Text>
            ))}
          </Section>
        ) : (
          <Text style={{ fontSize: "14px", color: "#666666", margin: "0 0 16px" }}>No timed activities logged.</Text>
        )}

        <Text style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 6px", color: "#1A1A1A" }}>Mood</Text>
        <Text style={{ fontSize: "14px", lineHeight: "20px", margin: "0 0 16px", color: "#333333" }}>{moodLabel}</Text>

        {personalNote.trim() ? (
          <>
            <Text style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 8px", color: "#1A1A1A" }}>Note from {providerName}</Text>
            <Section
              style={{
                borderLeft: "4px solid #0A8080",
                paddingLeft: "16px",
                marginBottom: "20px",
              }}
            >
              <Text style={{ fontSize: "15px", lineHeight: "24px", margin: 0, color: "#333333", fontStyle: "italic" }}>
                {personalNote.trim()}
              </Text>
            </Section>
          </>
        ) : null}

        <Link
          href={cardUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#0A8080",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            marginTop: "8px",
            marginBottom: "12px",
          }}
        >
          View full card
        </Link>
        <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "16px 0 0", color: "#444444" }}>
          <Link href={`${APP_URL}/dashboard/owner?tab=bookings`} style={{ color: "#0A8080", fontWeight: 600 }}>
            Leave a review
          </Link>{" "}
          for {providerName} when you have a moment.
        </Text>
        {tippingUrl ? (
          <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "16px 0 0", color: "#444444" }}>
            Was {providerName} amazing?{" "}
            <Link href={tippingUrl} style={{ color: "#0A8080", fontWeight: 600 }}>
              Leave a tip
            </Link>
            . 100% goes directly to {providerName} — Tinies takes no cut. Optional; you can skip anytime.
          </Text>
        ) : null}
        <Text style={{ fontSize: "13px", lineHeight: "20px", margin: "24px 0 0", color: "#666666" }}>
          This booking also generated a €{givingAmountEur} donation to animal rescue through Tinies Giving.
        </Text>
        <Text style={{ fontSize: "12px", lineHeight: "18px", margin: "16px 0 0", color: "#888888" }}>
          <Link href={dashboardUrl} style={{ color: "#0A8080" }}>
            Open in your dashboard
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  );
}
