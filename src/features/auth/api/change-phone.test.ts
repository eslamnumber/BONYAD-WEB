import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { requestPhoneChange, verifyPhoneChange } from './change-phone';

describe('requestPhoneChange', () => {
  it('POSTs the normalised 9-digit body to change-phone-request', async () => {
    let pathname = '';
    let body: unknown;
    server.use(
      http.post('*/users/:userId/change-phone-request', async ({ request }) => {
        pathname = new URL(request.url).pathname;
        body = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );

    // A "05XXXXXXXX" input normalises to the national "5XXXXXXXX" body.
    await requestPhoneChange(7, '0551234567');

    expect(pathname).toMatch(/\/users\/7\/change-phone-request$/);
    expect(body).toEqual({ newPhoneNumber: '551234567' });
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.post('*/users/:userId/change-phone-request', () =>
        HttpResponse.json(
          { messageEn: 'Number in use.', errorCode: 'PHONE_TAKEN' },
          { status: 409 },
        ),
      ),
    );
    const err = await requestPhoneChange(7, '0551234567').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).errorCode).toBe('PHONE_TAKEN');
  });
});

describe('verifyPhoneChange', () => {
  it('POSTs { userId, otpCode } to the internal verify route and returns the user', async () => {
    let pathname = '';
    let body: unknown;
    server.use(
      http.post('*/api/auth/change-phone-verify', async ({ request }) => {
        pathname = new URL(request.url).pathname;
        body = await request.json();
        return HttpResponse.json({ user: { phoneNumber: '551234567', name: 'Ahmed' } });
      }),
    );

    const res = await verifyPhoneChange(7, '1234');

    expect(pathname).toMatch(/\/api\/auth\/change-phone-verify$/);
    expect(body).toEqual({ userId: 7, otpCode: '1234' });
    expect(res.user?.phoneNumber).toBe('551234567');
  });

  it('rejects a malformed OTP before any request (strict request schema)', async () => {
    let hit = false;
    server.use(
      http.post('*/api/auth/change-phone-verify', () => {
        hit = true;
        return HttpResponse.json({ user: null });
      }),
    );
    await expect(verifyPhoneChange(7, '12')).rejects.toThrow();
    expect(hit).toBe(false);
  });
});
