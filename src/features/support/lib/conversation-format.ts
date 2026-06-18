import { type ConversationMessage } from '../schemas/conversation';

export const conversationQueryKey = (roomId: string) =>
  ['support', 'conversation', roomId] as const;

/** MQTT topic for a support conversation room (mirrors the web chat topic `chat/room/{roomId}`). */
export const supportRoomTopic = (roomId: string) => `chat/room/${roomId}`;

/** Append a (realtime) message, de-duping by id so an echoed publish never doubles. */
export function appendMessage(
  prev: ConversationMessage[] | undefined,
  message: ConversationMessage,
): ConversationMessage[] {
  const list = prev ?? [];
  if (list.some((m) => m.id === message.id)) return list;
  return [...list, message];
}
