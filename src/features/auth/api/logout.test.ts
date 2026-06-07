import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { logoutUser } from './logout';

const ROUTE = '*/api/auth/logout';

describe('logoutUser', () => {
  it('POSTs to the logout route handler and resolves', async () => {
    let called = false;
    server.use(
      http.post(ROUTE, () => {
        called = true;
        return HttpResponse.json({ ok: true });
      }),
    );
    await expect(logoutUser()).resolves.toBeUndefined();
    expect(called).toBe(true);
  });

  it('throws ApiError when the logout route fails', async () => {
    server.use(
      http.post(ROUTE, () => HttpResponse.json({ errorCode: 'SERVER_ERROR' }, { status: 500 })),
    );
    const err = await logoutUser().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
  });
});
