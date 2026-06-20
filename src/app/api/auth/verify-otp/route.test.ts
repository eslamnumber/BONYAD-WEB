import { http, HttpResponse } from 'msw';
import type { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { server } from '@/testing/handlers/server';

const { cookieMock } = vi.hoisted(() => ({
  cookieMock: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
}));

vi.mock('next/headers', () => ({ cookies: async () => cookieMock }));

import { POST } from './route';

const VERIFY = '*/auth/verify-otp';
const APPROVE = '*/users/terms/approve';
const BODY = { phoneNumber: '501234567', otpCode: '1234', role: 'USER' as const };

function post(body: unknown): NextRequest {
  return new Request('http://localhost/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  }) as unknown as NextRequest;
}

describe('POST /api/auth/verify-otp', () => {
  it('records the agreement with the issued token, then returns a token-less result', async () => {
    const approve: { body?: unknown; auth?: string | null } = {};
    server.use(
      http.post(VERIFY, () => HttpResponse.json({ token: 'jwt-issued', message: 'OTP verified' })),
      http.post(APPROVE, async ({ request }) => {
        approve.body = await request.json();
        approve.auth = request.headers.get('authorization');
        return HttpResponse.json({ success: true });
      }),
    );
    const res = await POST(post({ ...BODY, termsId: 17 }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: 'OTP verified' });
    expect(approve.body).toEqual({ termsId: 17 });
    expect(approve.auth).toBe('Bearer jwt-issued');
  });

  it('still succeeds when recording the agreement fails (non-blocking)', async () => {
    server.use(
      http.post(VERIFY, () => HttpResponse.json({ token: 'jwt', message: 'OTP verified' })),
      http.post(APPROVE, () => HttpResponse.json({ messageEn: 'nope' }, { status: 500 })),
    );
    const res = await POST(post({ ...BODY, termsId: 17 }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: 'OTP verified' });
  });

  it('does not record an agreement when no termsId is supplied', async () => {
    let approveCalled = false;
    server.use(
      http.post(VERIFY, () => HttpResponse.json({ token: 'jwt', message: 'ok' })),
      http.post(APPROVE, () => {
        approveCalled = true;
        return HttpResponse.json({ success: true });
      }),
    );
    await POST(post(BODY));
    expect(approveCalled).toBe(false);
  });

  it('forwards the backend status + envelope on a failed verification', async () => {
    server.use(
      http.post(VERIFY, () =>
        HttpResponse.json({ messageEn: 'Invalid OTP', errorCode: 'INVALID_OTP' }, { status: 401 }),
      ),
    );
    const res = await POST(post({ ...BODY, otpCode: '0000', termsId: 17 }));
    expect(res.status).toBe(401);
    expect((await res.json()).errorCode).toBe('INVALID_OTP');
  });

  it('returns 400 on an invalid request body', async () => {
    const res = await POST(post({ phoneNumber: '', otpCode: 'abcd', role: 'USER' }));
    expect(res.status).toBe(400);
  });
});
