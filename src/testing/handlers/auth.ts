import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

export const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { phoneNumber?: string; password?: string };

    if (!body.phoneNumber || !body.password) {
      return HttpResponse.json({ message: 'Missing credentials' }, { status: 400 });
    }

    if (body.password === 'wrong') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    return HttpResponse.json({
      token: 'mock-access-token',
      user: { id: 1, role: 'USER' },
    });
  }),

  http.post(`${BASE}/users/register`, async ({ request }) => {
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

  http.post(`${BASE}/auth/forgot-password`, async ({ request }) => {
    const body = (await request.json()) as { phoneNumber?: string; role?: string };

    if (!body.phoneNumber || !body.role) {
      return HttpResponse.json({ message: 'Phone number and role required' }, { status: 400 });
    }

    return HttpResponse.json({ message: 'OTP sent successfully' });
  }),

  http.post(`${BASE}/auth/forgot-password/resend`, async ({ request }) => {
    const body = (await request.json()) as { phoneNumber?: string; role?: string };

    if (!body.phoneNumber || !body.role) {
      return HttpResponse.json({ message: 'Phone number and role required' }, { status: 400 });
    }

    return HttpResponse.json({ message: 'OTP resent successfully' });
  }),

  http.post(`${BASE}/auth/verify-otp`, async ({ request }) => {
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

  http.post(`${BASE}/auth/resend-otp`, async ({ request }) => {
    const body = (await request.json()) as { phoneNumber?: string; role?: string };

    if (!body.phoneNumber || !body.role) {
      return HttpResponse.json({ message: 'Phone number and role required' }, { status: 400 });
    }

    return HttpResponse.json({ message: 'OTP resent successfully' });
  }),
];
