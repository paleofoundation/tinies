import { Html, Head, Body, Container, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailFooter } from "./EmailFooter";

const BACKGROUND = "#FFFEF7";
const PRIMARY = "#2D6A4F";
const TEXT = "#1A1A1A";
const MUTED = "#6B7280";

type EmailLayoutProps = {
  children: React.ReactNode;
  preview?: string;
};

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        {preview && (
          // eslint-disable-next-line @next/next/no-head-element
          <meta name="description" content={preview} />
        )}
      </Head>
      <Body style={{ backgroundColor: BACKGROUND, fontFamily: "Inter, sans-serif", color: TEXT }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Section style={{ marginBottom: "24px" }}>
            <Text style={{ fontSize: "20px", fontWeight: 600, color: PRIMARY, margin: 0 }}>
              Tinies
            </Text>
          </Section>
          {children}
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
