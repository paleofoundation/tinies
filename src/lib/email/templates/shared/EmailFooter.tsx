import { Section, Text, Link, Hr } from "@react-email/components";
import * as React from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export function EmailFooter() {
  return (
    <>
      <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
      <Section>
        <Text style={{ color: "#6B7280", fontSize: "12px", margin: 0 }}>
          10% of proceeds support animal rescue.{" "}
          <Link href={`${APP_URL}/giving`} style={{ color: "#2D6A4F" }}>
            tinies.app/giving
          </Link>
        </Text>
      </Section>
    </>
  );
}
