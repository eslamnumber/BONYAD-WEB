import type { ChatRoom } from '../schemas/chat';

/**
 * Deterministic chat room id for a pair of users — mirrors the RN `generateRoomId`
 * (website-bonyad/src/utils/chatUtils.ts): the two ids sorted and joined, so both
 * participants resolve the same id without a round-trip. Lets a conversation open
 * before any message exists — the backend creates the room implicitly on first send.
 */
export function generateRoomId(a: number, b: number): string {
  return [String(a), String(b)].sort().join('_');
}

type ContactArgs = {
  targetUserId: number | null;
  targetName?: string;
  targetProjectId?: number | null;
  currentUserId: number | null | undefined;
  rooms: ChatRoom[] | undefined;
};

/**
 * Resolve the conversation to open for a "contact user X" deep-link
 * (`/dashboard/messages?user=…`). Prefers an existing room with that user (chat is
 * per user-pair, like RN); otherwise synthesizes one from the deterministic
 * {@link generateRoomId} so the thread opens empty and the first message creates
 * it. Returns no room when the target or current user is unknown (e.g. the session
 * hasn't hydrated yet).
 */
export function resolveContactRoom({
  targetUserId,
  targetName,
  targetProjectId,
  currentUserId,
  rooms,
}: ContactArgs): { roomId: string | null; syntheticRoom: ChatRoom | null } {
  if (!targetUserId) return { roomId: null, syntheticRoom: null };
  const existing = rooms?.find((room) => room.otherUserId === targetUserId);
  if (existing) return { roomId: existing.roomId, syntheticRoom: null };
  if (currentUserId === null || currentUserId === undefined) {
    return { roomId: null, syntheticRoom: null };
  }
  const syntheticRoom: ChatRoom = {
    roomId: generateRoomId(currentUserId, targetUserId),
    otherUserId: targetUserId,
    otherUserName: targetName,
    projectId: targetProjectId ?? null,
  };
  return { roomId: syntheticRoom.roomId, syntheticRoom };
}
