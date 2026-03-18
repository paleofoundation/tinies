import type { Metadata } from "next";
import Link from "next/link";
import { getConversations } from "./actions";
import { MessagesListClient } from "./MessagesListClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages | Tinies",
  description: "Your conversations with providers and owners.",
};

export default async function MessagesPage() {
  const { conversations, error } = await getConversations();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main
        className="mx-auto px-4 py-12 sm:px-6 sm:py-16"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <h1
          className="font-normal"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)" }}
        >
          Messages
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Your conversations with providers and pet owners.
        </p>
        {error && (
          <p className="mt-4 text-sm" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        )}
        <MessagesListClient conversations={conversations} />
        <p className="mt-8">
          <Link
            href="/dashboard/owner"
            className="text-sm hover:underline"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ← Back to dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
