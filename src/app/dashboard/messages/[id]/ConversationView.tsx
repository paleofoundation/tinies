"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendMessage } from "../actions";
import type { MessageRow } from "../actions";
import { GivingTierBadge } from "@/components/giving/GivingTierBadge";
import type { GivingTier } from "@/lib/giving/actions";

const POLL_INTERVAL_MS = 10_000;

function formatMessageTime(d: Date | string): string {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationView({
  conversationId,
  recipientId,
  recipientName,
  recipientGivingTier,
  initialMessages,
}: {
  conversationId: string;
  recipientId: string;
  recipientName: string;
  recipientGivingTier?: GivingTier;
  initialMessages: MessageRow[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    const result = await sendMessage({
      conversationId,
      recipientId,
      content: text,
    });
    setSending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setContent("");
    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        senderId: "me",
        senderName: "You",
        content: text,
        photos: [],
        createdAt: new Date(),
        readAt: null,
      },
    ]);
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col rounded-[var(--radius-lg)] border bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="flex flex-wrap items-center gap-2 font-semibold" style={{ color: "var(--color-text)" }}>
          {recipientName}
          {recipientGivingTier && <GivingTierBadge tier={recipientGivingTier} size="sm" />}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[60vh]">
        {messages.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: "var(--color-text-secondary)" }}>
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${m.senderName === "You" ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                {m.senderName}
              </span>
              <div
                className={`mt-0.5 rounded-[var(--radius-lg)] px-3 py-2 ${
                  m.senderName === "You"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-background)]"
                }`}
                style={m.senderName !== "You" ? { color: "var(--color-text)" } : undefined}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                {m.photos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.photos.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block h-20 w-20 overflow-hidden rounded-[var(--radius-lg)]"
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized={url.includes("supabase")}
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <span className="mt-0.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {formatMessageTime(m.createdAt)}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t p-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
          disabled={sending}
        />
        <button
          type="button"
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-background)]"
          title="Photo upload (coming soon)"
        >
          📷
        </button>
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
