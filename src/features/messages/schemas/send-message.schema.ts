import { z } from 'zod';

/**
 * Strict request body for POST /chat/send. Mirrors the RN call site
 * website-bonyad/src/screens/chat/ChatDetailScreen.tsx:268 —
 * `{ roomId, receiverId, content, projectId? }`. We control what we send, so
 * this is strict (CLAUDE.md hard rule 1): content is trimmed + non-empty.
 */
export const sendMessageRequestSchema = z.object({
  roomId: z.string().min(1),
  receiverId: z.number(),
  content: z.string().trim().min(1),
  projectId: z.number().optional(),
});

export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;
