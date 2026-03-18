import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./shared/EmailLayout";

export type NewMessageNotificationEmailProps = {
  senderName: string;
  context: string;
  messagesUrl: string;
};

export default function NewMessageNotificationEmail({
  senderName,
  context,
  messagesUrl,
}: NewMessageNotificationEmailProps) {
  return (
    <EmailLayout preview={`New message from ${senderName}.`}>
      <Section>
        <Text style={{ fontSize: "16px", lineHeight: "24px", margin: "0 0 16px", color: "#1A1A1A" }}>
          New message from <strong>{senderName}</strong> about {context}.
        </Text>
        <Link
          href={messagesUrl}
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
          Reply on Tinies
        </Link>
      </Section>
    </EmailLayout>
  );
}
