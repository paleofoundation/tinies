"use client";

import Link from "next/link";
import Image from "next/image";
import type { ConversationSummary } from "./actions";

function formatMessageTime(d: Date | string): string {
  const date = new Date(d);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (sameDay) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function MessagesListClient({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  if (conversations.length === 0) {
    return (
      <div
        className="mt-8 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed py-16 text-center"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-background)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          No conversations yet.
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Message a provider from their profile to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-1">
      {conversations.map((c) => (
        <li key={c.conversationId}>
          <Link
            href={`/dashboard/messages/${c.conversationId}`}
            className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors hover:bg-[var(--color-background)]"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
              {c.otherParty.avatarUrl ? (
                <Image
                  src={c.otherParty.avatarUrl}
                  alt={c.otherParty.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized={c.otherParty.avatarUrl.includes("supabase")}
                />
              ) : (
                <span>
                  {c.otherParty.name
                    .split(" ")
                    .map((s) => s.charAt(0))
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`truncate font-medium ${c.unreadCount > 0 ? "font-semibold" : ""}`}
                  style={{ color: "var(--color-text)" }}
                >
                  {c.otherParty.name}
                </span>
                <span className="shrink-0 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {formatMessageTime(c.lastMessage.createdAt)}
                </span>
              </div>
              <p
                className={`mt-0.5 truncate text-sm ${c.unreadCount > 0 ? "font-medium" : ""}`}
                style={{ color: "var(--color-text-secondary)" }}
              >
                {c.lastMessage.contentPreview}
              </p>
            </div>
            {c.unreadCount > 0 && (
              <span
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {c.unreadCount > 99 ? "99+" : c.unreadCount}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
