import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { resendOtp, verifyOtp } from './verify-otp';

const ROUTE = '*/api/auth/verify-otp';
const BASE = { otp: '1234', phoneNumber: '501234567', role: 'USER' as const };

describe('verifyOtp', () => {
  it('posts to the internal route with otpCode, role, phone and the agreed termsId', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post(ROUTE, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ message: 'OTP verified' });
      }),
    );
    const res = await verifyOtp({ ...BASE, termsId: 17 });
    expect(body).toEqual({
      phoneNumber: '501234567',
      otpCode: '1234',
      role: 'USER',
      termsId: 17,
    });
    expect(res).toEqual({ message: 'OTP verified' });
  });

  it('omits termsId from the body when none was agreed', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post(ROUTE, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ message: 'ok' });
      }),
    );
    await verifyOtp(BASE);
    expect(body).not.toHaveProperty('termsId');
  });

  it('throws ApiError with the localised envelope on an invalid OTP', async () => {
    server.use(
      http.post(ROUTE, () =>
        HttpResponse.json(
          { messageEn: 'Invalid OTP.', messageAr: 'رمز غير صحيح.', errorCode: 'INVALID_OTP' },
          { status: 401 },
        ),
      ),
    );
    const err = await verifyOtp(BASE).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).errorCode).toBe('INVALID_OTP');
    expect((err as ApiError).localizedMessage('en')).toBe('Invalid OTP.');
  });
});

describe('resendOtp', () => {
  it('posts the phone + role to the resend endpoint', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post('*/auth/resend-otp', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ message: 'resent' });
      }),
    );
    await resendOtp({ phoneNumber: '501234567', role: 'TECHNICIAN' });
    expect(body).toEqual({ phoneNumber: '501234567', role: 'TECHNICIAN' });
  });
});
