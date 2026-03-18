/**
 * Types for messages. Kept in a non-"use server" file so they can be imported
 * by both server actions and client components.
 */

export type ConversationSummary = {
  conversationId: string;
  otherParty: { id: string; name: string; avatarUrl: string | null };
  lastMessage: { contentPreview: string; createdAt: Date };
  unreadCount: number;
};

export type MessageRow = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  photos: string[];
  createdAt: Date;
  readAt: Date | null;
};

export type SendMessageInput = {
  conversationId?: string;
  recipientId: string;
  content: string;
  bookingId?: string;
  photos?: string[];
};
