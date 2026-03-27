import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getConversationMessages } from "../actions";
import { computeGivingTier } from "@/lib/giving/actions";
import type { GivingTier } from "@/lib/utils/giving-helpers";
import { ConversationView } from "./ConversationView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let otherParty: Awaited<ReturnType<typeof getConversationMessages>>["otherParty"] = null;
  try {
    const result = await getConversationMessages(id);
    otherParty = result.otherParty;
  } catch (e) {
    console.error("getConversationMessages (metadata)", e);
  }
  const name = otherParty?.name ?? "Conversation";
  return {
    title: `${name} · Messages`,
    description: `Chat with ${name}.`,
  };
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  let messages: Awaited<ReturnType<typeof getConversationMessages>>["messages"] = [];
  let otherParty: Awaited<ReturnType<typeof getConversationMessages>>["otherParty"] = null;
  let error: string | undefined;
  try {
    const result = await getConversationMessages(id);
    messages = result.messages;
    otherParty = result.otherParty;
    error = result.error;
  } catch (e) {
    console.error("getConversationMessages", e);
    notFound();
  }
  if (error) notFound();
  if (!otherParty) notFound();
  let recipientGivingTier: GivingTier = null;
  try {
    recipientGivingTier = await computeGivingTier(otherParty.id);
  } catch (e) {
    console.error("computeGivingTier", e);
  }

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
