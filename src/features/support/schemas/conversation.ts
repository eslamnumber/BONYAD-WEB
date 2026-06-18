import { z } from 'zod';

/**
 * A support-conversation message (the live chat room with the assigned admin).
 * Permissive (rule 1) — structurally compatible with the web chat `ChatMessage`,
 * scoped to support so the feature owns no cross-feature import.
 */
export type ConversationMessage = {
  id: number;
  senderId?: number | null;
  senderName?: string | null;
  content?: string | null;
  createdAt?: string | null;
  roomId?: string | null;
  chatRoomId?: number | null;
};

/** GET /chat/room/:roomId/messages — bare array or `{ data }` / `{ messages }` envelope. */
export type ConversationListBody =
  | ConversationMessage[]
  | { data?: ConversationMessage[]; messages?: ConversationMessage[] };

/** Strict POST /chat/send body (mirrors the web messages send shape) (rule 1). */
export const sendConversationSchema = z.object({
  roomId: z.string(),
  receiverId: z.number(),
  content: z.string().trim().min(1),
});
export type SendConversationBody = z.infer<typeof sendConversationSchema>;
