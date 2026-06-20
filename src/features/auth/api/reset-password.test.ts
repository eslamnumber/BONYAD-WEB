import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { resendForgotPasswordOtp, resetPassword } from './reset-password';

const VALID = {
  phoneNumber: '500000000',
  role: 'USER' as const,
  otp: '1234',
  newPassword: 'Str0ng!pass',
  confirmPassword: 'Str0ng!pass',
};

describe('resetPassword', () => {
  it('posts the RN-shaped body (otpCode + both passwords) and returns the message', async () => {
    let captured: unknown = null;
    server.use(
      http.post('*/auth/reset-password', async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ message: 'Password reset successfully' });
      }),
    );

    const res = await resetPassword(VALID);

    expect(captured).toEqual({
      phoneNumber: '500000000',
      role: 'USER',
      otpCode: '1234',
      newPassword: 'Str0ng!pass',
      confirmPassword: 'Str0ng!pass',
    });
    expect(res.message).toBe('Password reset successfully');
  });

  it('surfaces an invalid/expired OTP (4xx) as a localised ApiError', async () => {
    server.use(
      http.post('*/auth/reset-password', () =>
        HttpResponse.json(
          { messageEn: 'Invalid code', messageAr: 'رمز غير صالح', errorCode: 'INVALID_OTP' },
          { status: 400 },
        ),
      ),
    );

    const err = await resetPassword({ ...VALID, otp: '0000' }).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).messageEn).toBe('Invalid code');
    expect((err as ApiError).messageAr).toBe('رمز غير صالح');
    expect((err as ApiError).errorCode).toBe('INVALID_OTP');
  });
});

describe('resendForgotPasswordOtp', () => {
  it('posts phone + role to the forgot-password resend endpoint', async () => {
    let captured: unknown = null;
    server.use(
      http.post('*/auth/forgot-password/resend', async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ message: 'OTP resent successfully' });
      }),
    );

    await resendForgotPasswordOtp({ phoneNumber: '500000000', role: 'TECHNICIAN' });

    expect(captured).toEqual({ phoneNumber: '500000000', role: 'TECHNICIAN' });
  });
});
