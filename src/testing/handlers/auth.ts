import { http, HttpResponse } from 'msw';

/**
 * Wildcard suffix patterns so handlers match whether the request goes direct to
 * the backend (server-side) or through the same-origin proxy / internal route
 * (browser). Login hits the internal route handler `/api/auth/login`, which
 * returns an interpreted `LoginResult` (not the raw backend body).
 */
export const authHandlers = [
  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      phoneNumber?: string;
      password?: string;
      role?: string;
    };

    if (!body.phoneNumber || !body.password) {
      return HttpResponse.json(
        { messageEn: 'Missing credentials', errorCode: 'BAD_REQUEST' },
        { status: 400 },
      );
    }

    if (body.password === 'wrong') {
      return HttpResponse.json(
        { messageEn: 'Invalid credentials', errorCode: 'INVALID_CREDENTIALS' },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      kind: 'success',
      userId: 1,
      role: body.role ?? 'USER',
      requiresPasswordChange: false,
    });
  }),

  http.post('*/users/register', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string;
      phoneNumber?: string;
      password?: string;
      role?: string;
    };

    if (!body.name || !body.phoneNumber || !body.password) {
      return HttpResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (body.phoneNumber === '0500000000') {
      return HttpResponse.json({ message: 'Phone number already registered' }, { status: 409 });
    }

    return HttpResponse.json({
      token: 'mock-access-token',
      user: { id: 2, role: body.role ?? 'USER' },
    });
  }),

  http.post('*/auth/forgot-password/resend', async ({ request }) => {
    const body = (await request.json()) as { phoneNumber?: string; role?: string };

    if (!body.phoneNumber || !body.role) {
      return HttpResponse.json({ message: 'Phone number and role required' }, { status: 400 });
    }

    return HttpResponse.json({ message: 'OTP resent successfully' });
  }),

  http.post('*/auth/forgot-password', async ({ request }) => {
    const body = (await request.json()) as { phoneNumber?: string; role?: string };

    if (!body.phoneNumber || !body.role) {
      return HttpResponse.json({ message: 'Phone number and role required' }, { status: 400 });
    }

    return HttpResponse.json({ message: 'OTP sent successfully' });
  }),

  http.post('*/auth/verify-otp', async ({ request }) => {
    const body = (await request.json()) as {
      phoneNumber?: string;
      otpCode?: string;
      role?: string;
    };

    if (!body.phoneNumber || !body.otpCode || !body.role) {
      return HttpResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    if (body.otpCode === '0000') {
      return HttpResponse.json({ message: 'Invalid OTP' }, { status: 401 });
    }

    return HttpResponse.json({ token: 'mock-reset-token', message: 'OTP verified' });
  }),

  http.post('*/auth/resend-otp', async ({ request }) => {
    const body = (await request.json()) as { phoneNumber?: string; role?: string };

    if (!body.phoneNumber || !body.role) {
      return HttpResponse.json({ message: 'Phone number and role required' }, { status: 400 });
    }

    return HttpResponse.json({ message: 'OTP resent successfully' });
  }),
];
