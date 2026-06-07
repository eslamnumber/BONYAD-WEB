/**
 * Chat entity types — mirror `website-bonyad/src/types/chat.ts`.
 *
 * Permissive on purpose (see `docs/api-and-auth.md` §Schema strategy): the chat
 * backend is shared with the RN app and may add fields. Only `roomId` is
 * required — it's the conversation identity the list keys on; the fetcher drops
 * any row missing it. Everything else is optional so a backend addition never
 * surfaces as a misleading "Something went wrong".
 */

export type ChatRoom = {
  /** Stable conversation id used for routing, topics, and list keys. */
  roomId: string;
  id?: number;
  otherUserId?: number;
  otherUserName?: string;
  otherUserRole?: string;
  otherUserProfileImage?: string | null;
  projectId?: number | null;
  lastMessage?: string | null;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt?: string;
};

/**
 * A single chat message. Used by both the REST history endpoint and the MQTT
 * live payload (which carries `roomId` as a string; the API carries the numeric
 * `chatRoomId`). `isMine` is computed client-side against the session user id.
 */
export type ChatMessage = {
  id: number;
  chatRoomId?: number;
  roomId?: string;
  senderId?: number;
  senderName?: string;
  receiverId?: number;
  receiverName?: string;
  content?: string;
  fileUrl?: string | null;
  fileType?: string | null;
  fileName?: string | null;
  messageType?: string;
  isRead?: boolean;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
