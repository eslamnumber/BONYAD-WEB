import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { changePassword } from './change-password';

describe('changePassword', () => {
  it('PUTs { oldPassword, newPassword } to /users/:userId/change-password', async () => {
    let method = '';
    let pathname = '';
    let body: unknown;
    server.use(
      http.put('*/users/:userId/change-password', async ({ request }) => {
        method = request.method;
        pathname = new URL(request.url).pathname;
        body = await request.json();
        return HttpResponse.json({ message: 'Password updated' });
      }),
    );

    await changePassword(7, { oldPassword: 'OldPass1!', newPassword: 'NewPass9$' });

    expect(method).toBe('PUT');
    expect(pathname).toMatch(/\/users\/7\/change-password$/);
    expect(body).toEqual({ oldPassword: 'OldPass1!', newPassword: 'NewPass9$' });
  });

  it('throws ApiError when the old password is wrong (4xx)', async () => {
    server.use(
      http.put('*/users/:userId/change-password', () =>
        HttpResponse.json(
          { messageEn: 'Old password is incorrect.', errorCode: 'INVALID_OLD_PASSWORD' },
          { status: 400 },
        ),
      ),
    );

    const err = await changePassword(7, {
      oldPassword: 'wrong',
      newPassword: 'NewPass9$',
    }).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).messageEn).toBe('Old password is incorrect.');
    expect((err as ApiError).errorCode).toBe('INVALID_OLD_PASSWORD');
  });
});
