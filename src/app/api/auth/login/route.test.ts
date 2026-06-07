import { http, HttpResponse } from 'msw';
import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '@/testing/handlers/server';

const { cookieMock } = vi.hoisted(() => ({
  cookieMock: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
}));

vi.mock('next/headers', () => ({ cookies: async () => cookieMock }));

import { POST } from './route';

const CREDS = { phoneNumber: '501234567', password: 'p', role: 'TECHNICIAN', fcmToken: 'no-token' };
const BACKEND = '*/auth/login';

function post(body: unknown): NextRequest {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  }) as unknown as NextRequest;
}

describe('POST /api/auth/login', () => {
  beforeEach(() => cookieMock.set.mockClear());

  it('sets the httpOnly session cookie and returns a token-less success result', async () => {
    server.use(
      http.post(BACKEND, () =>
        HttpResponse.json({ token: 'jwt-xyz', user: { id: 7, role: 'TECHNICIAN' } }),
      ),
    );
    const res = await POST(post(CREDS));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      kind: 'success',
      userId: 7,
      role: 'TECHNICIAN',
      requiresPasswordChange: false,
    });
    expect(json).not.toHaveProperty('token');
    expect(cookieMock.set).toHaveBeenCalledWith(
      'bonyad-token',
      'jwt-xyz',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
    );
  });

  it('returns pending and sets no cookie on USER_ALREADY_EXISTS_PENDING', async () => {
    server.use(
      http.post(BACKEND, () =>
        HttpResponse.json(
          { messageEn: 'pending', errorCode: 'USER_ALREADY_EXISTS_PENDING' },
          { status: 400 },
        ),
      ),
    );
    const res = await POST(post(CREDS));
    expect(await res.json()).toEqual({
      kind: 'pending',
      phoneNumber: '501234567',
      role: 'TECHNICIAN',
    });
    expect(cookieMock.set).not.toHaveBeenCalled();
  });

  it('forwards the backend status + envelope on invalid credentials', async () => {
    server.use(
      http.post(BACKEND, () =>
        HttpResponse.json({ messageEn: 'Bad', errorCode: 'INVALID_CREDENTIALS' }, { status: 401 }),
      ),
    );
    const res = await POST(post(CREDS));
    expect(res.status).toBe(401);
    expect((await res.json()).errorCode).toBe('INVALID_CREDENTIALS');
    expect(cookieMock.set).not.toHaveBeenCalled();
  });

  it('returns 400 on an invalid request body', async () => {
    const res = await POST(post({ phoneNumber: 123 }));
    expect(res.status).toBe(400);
  });
});
