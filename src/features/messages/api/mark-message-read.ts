import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

/**
 * Mark a single message read. Mirrors the RN call site
 * website-bonyad/src/screens/chat/ChatDetailScreen.tsx:284 — POST
 * /chat/messages/:messageId/mark-read. Called imperatively from the live message
 * handler when an inbound message arrives, so it's a plain fetcher (no hook).
 */
export async function markMessageRead(messageId: number): Promise<void> {
  const path = API_ENDPOINTS.CHAT.MARK_READ.replace(':messageId', String(messageId));
  await apiClient.post<unknown>(path);
}
