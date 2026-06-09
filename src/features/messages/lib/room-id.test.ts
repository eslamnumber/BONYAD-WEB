import { describe, expect, it } from 'vitest';

import type { ChatRoom } from '../schemas/chat';

import { generateRoomId, resolveContactRoom } from './room-id';

describe('generateRoomId', () => {
  it('joins the two ids (string-sorted) so both participants resolve the same id', () => {
    expect(generateRoomId(5, 10)).toBe('10_5');
    expect(generateRoomId(10, 5)).toBe('10_5');
    expect(generateRoomId(7, 42)).toBe('42_7');
  });
});

describe('resolveContactRoom', () => {
  const rooms: ChatRoom[] = [
    { roomId: 'room-9', otherUserId: 9 },
    { roomId: 'room-7', otherUserId: 7 },
  ];

  it('returns the existing conversation for the target user (no synthetic room)', () => {
    const result = resolveContactRoom({ targetUserId: 7, currentUserId: 5, rooms });
    expect(result.roomId).toBe('room-7');
    expect(result.syntheticRoom).toBeNull();
  });

  it('synthesizes a deterministic room when the user has no conversation yet', () => {
    const result = resolveContactRoom({
      targetUserId: 10,
      targetName: 'Sara',
      targetProjectId: 42,
      currentUserId: 5,
      rooms,
    });
    expect(result.roomId).toBe('10_5');
    expect(result.syntheticRoom).toMatchObject({
      roomId: '10_5',
      otherUserId: 10,
      otherUserName: 'Sara',
      projectId: 42,
    });
  });

  it('returns nothing when there is no target user', () => {
    expect(resolveContactRoom({ targetUserId: null, currentUserId: 5, rooms })).toEqual({
      roomId: null,
      syntheticRoom: null,
    });
  });

  it('returns nothing when the current user is unknown (session not hydrated)', () => {
    expect(resolveContactRoom({ targetUserId: 10, currentUserId: undefined, rooms })).toEqual({
      roomId: null,
      syntheticRoom: null,
    });
  });
});
