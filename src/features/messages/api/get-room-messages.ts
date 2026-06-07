import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ChatMessage } from '../schemas/chat';

export type RoomMessagesParams = { limit?: number };

const DEFAULT_LIMIT = 100;

export const roomMessagesQueryKey = (roomId: string) =>
  ['chat', 'room', roomId, 'messages'] as const;

/**
 * Message history for one room. Mirrors the RN call site
 * website-bonyad/src/screens/chat/ChatDetailScreen.tsx — GET
 * /chat/room/:roomId/messages?limit=100, normalise the message body (the backend
 * has returned it under `content` / `body` / `message` / `text`), and drop rows
 * that can't be keyed (no numeric `id`) or that carry a foreign `roomId` (guards
 * the known room-id-collision bug). `isMine` is NOT computed here — it needs the
 * session user id and is derived at the component layer.
 */
export async function getRoomMessages(
  roomId: string,
  params: RoomMessagesParams = {},
): Promise<ChatMessage[]> {
  const path = API_ENDPOINTS.CHAT.MESSAGES.replace(':roomId', encodeURIComponent(roomId));
  const data = await apiClient.get<unknown>(path, {
    params: { limit: params.limit ?? DEFAULT_LIMIT },
  });
  return extractMessages(data)
    .map(toMessage)
    .filter(
      (m) => typeof m.id === 'number' && !(typeof m.roomId === 'string' && m.roomId !== roomId),
    );
}

function extractMessages(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['data', 'messages'] as const) {
      if (Array.isArray(record[key])) return record[key] as Record<string, unknown>[];
    }
  }
  return [];
}

function toMessage(raw: Record<string, unknown>): ChatMessage {
  const body = raw.content ?? raw.body ?? raw.message ?? raw.text ?? '';
  return { ...(raw as ChatMessage), content: String(body) };
}

export function useRoomMessages(roomId: string | undefined) {
  return useQuery({
    queryKey: roomMessagesQueryKey(roomId ?? ''),
    queryFn: () => getRoomMessages(roomId as string),
    enabled: Boolean(roomId),
    staleTime: 1000 * 15,
    // Live updates arrive over MQTT; this slow poll is the graceful REST
    // fallback so messages still surface when the broker is unreachable.
    refetchInterval: 30_000,
  });
}
