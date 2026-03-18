import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getConversationMessages } from "../actions";
import { computeGivingTier } from "@/lib/giving/actions";
import { ConversationView } from "./ConversationView";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { otherParty } = await getConversationMessages(id);
  const name = otherParty?.name ?? "Conversation";
  return {
    title: `${name} | Messages | Tinies`,
    description: `Chat with ${name}.`,
  };
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const { messages, otherParty, error } = await getConversationMessages(id);
  if (error) notFound();
  if (!otherParty) notFound();
  const recipientGivingTier = await computeGivingTier(otherParty.id);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/dashboard/messages"
            className="text-sm hover:underline"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ← Messages
          </Link>
        </div>
        <ConversationView
          conversationId={id}
          recipientId={otherParty.id}
          recipientName={otherParty.name}
          recipientGivingTier={recipientGivingTier}
          initialMessages={messages}
        />
      </main>
    </div>
  );
}
