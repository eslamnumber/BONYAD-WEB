import { z } from 'zod';

/**
 * Strict request for POST /chat/send-with-file. Mirrors the RN call site
 * website-bonyad/src/screens/chat/ChatDetailScreen.tsx (`uploadAttachment`) —
 * a multipart body of `{ receiverId, content, projectId?, file }`. We control
 * what we send, so this is strict (CLAUDE.md hard rule 1). `roomId` is not part
 * of the wire payload — it keys the client-side cache reconciliation only.
 */
export const sendMessageWithFileRequestSchema = z.object({
  roomId: z.string().min(1),
  receiverId: z.number(),
  file: z.instanceof(File),
  content: z.string().trim().optional(),
  projectId: z.number().optional(),
});

export type SendMessageWithFileRequest = z.infer<typeof sendMessageWithFileRequestSchema>;
