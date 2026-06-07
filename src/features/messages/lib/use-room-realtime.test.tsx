import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/testing/render';

import { roomMessagesQueryKey } from '../api/get-room-messages';
import type { ChatMessage } from '../schemas/chat';

import { useRoomRealtime } from './use-room-realtime';

const { subscribeMock, connectMock, markReadMock } = vi.hoisted(() => ({
  subscribeMock: vi.fn(),
  connectMock: vi.fn(),
  markReadMock: vi.fn(),
}));

vi.mock('@/lib/mqtt-chat', () => ({
  mqttChat: { connect: connectMock, subscribe: subscribeMock },
}));
vi.mock('../api/mark-message-read', () => ({ markMessageRead: markReadMock }));

type Handler = (data: unknown) => void;

function setup(roomId: string, userId: number | undefined, seed: ChatMessage[] = []) {
  const handlers = new Map<string, Handler>();
  vi.clearAllMocks();
  connectMock.mockResolvedValue(true);
  markReadMock.mockResolvedValue(undefined);
  subscribeMock.mockImplementation((topic: string, handler: Handler) => {
    handlers.set(topic, handler);
    return () => handlers.delete(topic);
  });

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(roomMessagesQueryKey(roomId), seed);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  renderHook(() => useRoomRealtime(roomId, userId), { wrapper });
  return { queryClient, handlers };
}

describe('useRoomRealtime', () => {
  it('appends an incoming message to the room cache, deduped by id', () => {
    const { queryClient, handlers } = setup('r1', 7);
    const onMessage = handlers.get('chat/room/r1');
    onMessage?.({ id: 1, senderId: 9, content: 'hi' });
    onMessage?.({ id: 1, senderId: 9, content: 'hi' });
    expect(queryClient.getQueryData(roomMessagesQueryKey('r1'))).toEqual([
      { id: 1, senderId: 9, content: 'hi' },
    ]);
  });

  it('acknowledges an inbound message with markMessageRead', () => {
    const { handlers } = setup('r1', 7);
    handlers.get('chat/room/r1')?.({ id: 2, senderId: 9, content: 'x' });
    expect(markReadMock).toHaveBeenCalledWith(2);
  });

  it('does not acknowledge the user’s own message', () => {
    const { handlers } = setup('r1', 7);
    handlers.get('chat/room/r1')?.({ id: 3, senderId: 7, content: 'mine' });
    expect(markReadMock).not.toHaveBeenCalled();
  });

  it('flips isRead on a read receipt', () => {
    const { queryClient, handlers } = setup('r1', 7, [{ id: 5, isRead: false }]);
    handlers.get('chat/room/r1/read')?.({ messageId: 5, isRead: true });
    expect(queryClient.getQueryData(roomMessagesQueryKey('r1'))).toEqual([{ id: 5, isRead: true }]);
  });
});
