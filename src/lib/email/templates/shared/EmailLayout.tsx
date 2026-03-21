import { Html, Head, Body, Container, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailFooter } from "./EmailFooter";
import { BRAND_BG, BRAND_MUTED, BRAND_TEAL, BRAND_TEXT } from "@/lib/email/brand";

const BACKGROUND = BRAND_BG;
const PRIMARY = BRAND_TEAL;
const TEXT = BRAND_TEXT;
const MUTED = BRAND_MUTED;

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
