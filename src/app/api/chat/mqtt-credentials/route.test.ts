import { describe, expect, it, vi } from 'vitest';

const { cookieMock } = vi.hoisted(() => ({
  cookieMock: { get: vi.fn() },
}));

vi.mock('next/headers', () => ({ cookies: async () => cookieMock }));

import { GET } from './route';

describe('GET /api/chat/mqtt-credentials', () => {
  it('returns the session token for an authenticated request, uncached', async () => {
    cookieMock.get.mockReturnValue({ value: 'jwt-abc' });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ token: 'jwt-abc' });
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('returns 401 NO_SESSION when the session cookie is absent', async () => {
    cookieMock.get.mockReturnValue(undefined);
    const res = await GET();
    expect(res.status).toBe(401);
    expect((await res.json()).errorCode).toBe('NO_SESSION');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});
