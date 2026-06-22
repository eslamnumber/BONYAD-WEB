import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { respondSupervisorInvite } from './respond-supervisor-invite';

describe('respondSupervisorInvite', () => {
  it('POSTs { accept: true } to /projects/:id/supervisor/respond and returns the state', async () => {
    let body: unknown;
    let capturedUrl = '';
    server.use(
      http.post('*/projects/:id/supervisor/respond', async ({ request }) => {
        body = await request.json();
        capturedUrl = request.url;
        return HttpResponse.json({ projectId: 213, status: 'ACTIVE', active: true });
      }),
    );
    const res = await respondSupervisorInvite(213, true);
    expect(body).toEqual({ accept: true });
    expect(new URL(capturedUrl).pathname).toMatch(/\/projects\/213\/supervisor\/respond$/);
    expect(res).toMatchObject({ status: 'ACTIVE', active: true });
  });

  it('sends { accept: false } when declining', async () => {
    let body: unknown;
    server.use(
      http.post('*/projects/:id/supervisor/respond', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ projectId: 213, status: 'DECLINED', active: false });
      }),
    );
    await respondSupervisorInvite(213, false);
    expect(body).toEqual({ accept: false });
  });

  it('throws ApiError with localized messages on a 400', async () => {
    server.use(
      http.post('*/projects/:id/supervisor/respond', () =>
        HttpResponse.json(
          { messageEn: 'Already responded.', messageAr: 'تم الرد بالفعل.', errorCode: 'CONFLICT' },
          { status: 400 },
        ),
      ),
    );
    const err = await respondSupervisorInvite(213, true).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).localizedMessage('ar')).toBe('تم الرد بالفعل.');
  });
});
