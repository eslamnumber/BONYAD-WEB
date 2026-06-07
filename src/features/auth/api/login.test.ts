import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { loginUser } from './login';

const CREDS = { phone: '0501234567', password: 'pass1234', role: 'TECHNICIAN' as const };
const ROUTE = '*/api/auth/login';

describe('loginUser', () => {
  it('returns the token-less success result from the login route handler', async () => {
    server.use(
      http.post(ROUTE, () =>
        HttpResponse.json({
          kind: 'success',
          userId: 7,
          role: 'TECHNICIAN',
          requiresPasswordChange: false,
        }),
      ),
    );
    const result = await loginUser(CREDS);
    expect(result).toEqual({
      kind: 'success',
      userId: 7,
      role: 'TECHNICIAN',
      requiresPasswordChange: false,
    });
    expect(result).not.toHaveProperty('token');
  });

  it('sends the normalised Saudi phone (no leading zero) + fcmToken matching the RN call site', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post(ROUTE, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          kind: 'success',
          userId: 1,
          role: 'USER',
          requiresPasswordChange: false,
        });
      }),
    );
    await loginUser(CREDS);
    expect(body).toMatchObject({ role: 'TECHNICIAN', fcmToken: 'no-token', password: 'pass1234' });
    expect(String(body?.phoneNumber)).toMatch(/^5\d{8}$/);
  });

  it('returns the pending result when the route signals pending verification', async () => {
    server.use(
      http.post(ROUTE, () =>
        HttpResponse.json({ kind: 'pending', phoneNumber: '501234567', role: 'TECHNICIAN' }),
      ),
    );
    expect(await loginUser(CREDS)).toEqual({
      kind: 'pending',
      phoneNumber: '501234567',
      role: 'TECHNICIAN',
    });
  });

  it('throws ApiError with the localised envelope on a 401', async () => {
    server.use(
      http.post(ROUTE, () =>
        HttpResponse.json(
          {
            messageEn: 'Invalid credentials.',
            messageAr: 'بيانات غير صحيحة.',
            errorCode: 'INVALID_CREDENTIALS',
          },
          { status: 401 },
        ),
      ),
    );
    const err = await loginUser(CREDS).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('INVALID_CREDENTIALS');
    expect((err as ApiError).localizedMessage('ar')).toBe('بيانات غير صحيحة.');
  });
});
