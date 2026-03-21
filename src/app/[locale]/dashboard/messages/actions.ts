"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import NewMessageNotificationEmail from "@/lib/email/templates/new-message-notification";
import { sendSMS, buildNewMessageSMS } from "@/lib/sms";
import { getConversationId } from "@/lib/utils/conversation";
import type { ConversationSummary, MessageRow, SendMessageInput } from "@/lib/utils/messages-helpers";

const PREVIEW_LENGTH = 80;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
const NEW_MESSAGE_EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function getConversations(): Promise<{
  conversations: ConversationSummary[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { conversations: [], error: "Not signed in." };
  const meId = user.id;
  try {
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: meId }, { recipientId: meId }] },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        recipient: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    const byConv = new Map<
      string,
      {
        otherParty: { id: string; name: string; avatarUrl: string | null };
        lastMessage: { contentPreview: string; createdAt: Date };
      }
    >();
    for (const m of messages) {
      if (byConv.has(m.conversationId)) continue;
      const other = m.senderId === meId ? m.recipient : m.sender;
      byConv.set(m.conversationId, {
        otherParty: {
          id: other.id,
          name: other.name,
          avatarUrl: other.avatarUrl,
        },
        lastMessage: {
          contentPreview:
            m.content.length > PREVIEW_LENGTH
              ? m.content.slice(0, PREVIEW_LENGTH) + "…"
              : m.content,
          createdAt: m.createdAt,
        },
      });
    }
    const unreadCounts = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: [...byConv.keys()] },
        recipientId: meId,
        readAt: null,
      },
      _count: { id: true },
    });
    const unreadByConv = new Map(
      unreadCounts.map((u) => [u.conversationId, u._count.id])
    );
    const conversations: ConversationSummary[] = [...byConv.entries()]
      .map(([conversationId, data]) => ({
        conversationId,
        otherParty: data.otherParty,
        lastMessage: data.lastMessage,
        unreadCount: unreadByConv.get(conversationId) ?? 0,
      }))
      .sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
      );
    return { conversations };
  } catch (e) {
    console.error("getConversations", e);
    return { conversations: [], error: "Failed to load conversations." };
  }
}

export async function getConversationMessages(
  conversationId: string
): Promise<{ messages: MessageRow[]; otherParty: { id: string; name: string; avatarUrl: string | null } | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { messages: [], otherParty: null, error: "Not signed in." };
  const meId = user.id;
  try {
    const rows = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });
    if (rows.length === 0) {
      const [id1, id2] = conversationId.replace(/^conv_/, "").split("_");
      const otherId = id1 === meId ? id2 : id1;
      const other = await prisma.user.findUnique({
        where: { id: otherId },
        select: { id: true, name: true, avatarUrl: true },
      });
      return {
        messages: [],
        otherParty: other
          ? { id: other.id, name: other.name, avatarUrl: other.avatarUrl }
          : null,
      };
    }
    const otherId = rows[0].senderId === meId ? rows[0].recipientId : rows[0].senderId;
    const other = await prisma.user.findUnique({
      where: { id: otherId },
      select: { id: true, name: true, avatarUrl: true },
    });
    await prisma.message.updateMany({
      where: { conversationId, recipientId: meId, readAt: null },
      data: { readAt: new Date() },
    });
    const messages: MessageRow[] = rows.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.sender.name,
      content: m.content,
      photos: m.photos,
      createdAt: m.createdAt,
      readAt: m.readAt,
    }));
    revalidatePath("/dashboard/messages");
    revalidatePath(`/dashboard/messages/${conversationId}`);
    return {
      messages,
      otherParty: other
        ? { id: other.id, name: other.name, avatarUrl: other.avatarUrl }
        : null,
    };
  } catch (e) {
    console.error("getConversationMessages", e);
    return { messages: [], otherParty: null, error: "Failed to load messages." };
  }
}

export async function sendMessage(
  input: SendMessageInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const senderId = user.id;
  const conversationId =
    input.conversationId ??
    getConversationId(senderId, input.recipientId);
  const content = input.content.trim();
  if (!content) return { error: "Message cannot be empty." };
  try {
    await prisma.message.create({
      data: {
        conversationId,
        senderId,
        recipientId: input.recipientId,
        bookingId: input.bookingId ?? null,
        content,
        photos: input.photos ?? [],
      },
    });
    try {
      const since = new Date(Date.now() - NEW_MESSAGE_EMAIL_WINDOW_MS);
      const count = await prisma.message.count({
        where: {
          conversationId,
          recipientId: input.recipientId,
          createdAt: { gte: since },
        },
      });
      if (count === 1) {
        const [sender, recipient] = await Promise.all([
          prisma.user.findUnique({
            where: { id: senderId },
            select: { name: true },
          }),
          prisma.user.findUnique({
            where: { id: input.recipientId },
            select: { email: true, phone: true, phoneVerified: true },
          }),
        ]);
        if (recipient?.email && sender?.name) {
          const context = input.bookingId ? "your booking" : "your conversation";
          await sendEmail({
            to: recipient.email,
            subject: `New message from ${sender.name} on Tinies`,
            react: NewMessageNotificationEmail({
              senderName: sender.name,
              context,
              messagesUrl: `${APP_URL}/dashboard/messages/${conversationId}`,
            }),
          });
        }
        if (recipient?.phoneVerified && recipient?.phone && sender?.name) {
          await sendSMS({
            to: recipient.phone,
            body: buildNewMessageSMS({ senderName: sender.name }),
          });
        }
      }
    } catch (emailErr) {
      console.error("sendMessage: new-message notification email failed", emailErr);
    }
    revalidatePath("/dashboard/messages");
    revalidatePath(`/dashboard/messages/${conversationId}`);
    return {};
  } catch (e) {
    console.error("sendMessage", e);
    return { error: e instanceof Error ? e.message : "Failed to send message." };
  }
}

export async function getOrCreateConversation(
  otherUserId: string
): Promise<{ conversationId: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { conversationId: "", error: "Not signed in." };
  const conversationId = getConversationId(user.id, otherUserId);
  return { conversationId };
}

/** Total unread count for current user (for header badge). */
export async function getUnreadMessageCount(): Promise<{
  count: number;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { count: 0 };
  try {
    const count = await prisma.message.count({
      where: { recipientId: user.id, readAt: null },
    });
    return { count };
  } catch (e) {
    console.error("getUnreadMessageCount", e);
    return { count: 0 };
  }
}
