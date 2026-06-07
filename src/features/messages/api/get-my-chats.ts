import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ChatRoom } from '../schemas/chat';

export const myChatsQueryKey = () => ['chat', 'my-chats'] as const;

/**
 * The signed-in user's conversation list. Mirrors the RN call site
 * website-bonyad/src/screens/chat/ChatRoomsListScreen.tsx — GET /chat/my-chats,
 * then unwrap the rooms array (the backend has shipped it bare and wrapped in
 * `data` / `rooms` / `chatRooms`). Browser calls go through `/api/proxy/*`,
 * which attaches the session token. Rooms without a `roomId` are dropped — they
 * can't be opened, keyed, or subscribed to.
 */
export async function getMyChats(): Promise<ChatRoom[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.CHAT.MY_CHATS);
  return extractRooms(data).filter((room) => typeof room.roomId === 'string' && room.roomId !== '');
}

function extractRooms(data: unknown): ChatRoom[] {
  if (Array.isArray(data)) return data as ChatRoom[];
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['data', 'rooms', 'chatRooms'] as const) {
      if (Array.isArray(record[key])) return record[key] as ChatRoom[];
    }
  }
  return [];
}

export function useMyChats() {
  return useQuery({
    queryKey: myChatsQueryKey(),
    queryFn: getMyChats,
    staleTime: 1000 * 30,
  });
}
