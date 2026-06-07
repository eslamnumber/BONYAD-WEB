/**
 * MQTT topic builders for realtime chat. The `mqtt-chat` transport is
 * payload-agnostic; the messages feature owns the topic shapes. Mirrors the RN
 * `MqttChatService` topics.
 */
export const chatTopics = {
  /** Per-user fan-out: new messages across all of the user's rooms. */
  user: (userId: number) => `chat/user/${userId}`,
  /** New messages in a specific room. */
  room: (roomId: string) => `chat/room/${roomId}`,
  /** Read receipts for a room. */
  roomRead: (roomId: string) => `chat/room/${roomId}/read`,
} as const;
