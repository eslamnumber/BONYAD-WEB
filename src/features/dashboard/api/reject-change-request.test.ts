import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { rejectChangeRequest } from './reject-change-request';

describe('rejectChangeRequest', () => {
  it('POSTs an optional reason to the right id and returns REJECTED', async () => {
    let sent: Record<string, unknown> = {};
    server.use(
      http.post('*/change-requests/:id/reject', async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ message: 'ok', changeRequestId: 101, status: 'REJECTED' });
      }),
    );

    const res = await rejectChangeRequest({
      projectId: 183,
      changeRequestId: 101,
      input: { reason: 'Out of budget' },
    });
    expect(res.status).toBe('REJECTED');
    expect(sent.reason).toBe('Out of budget');
  });

  it('allows rejecting without a reason (empty input)', async () => {
    server.use(
      http.post('*/change-requests/:id/reject', () => HttpResponse.json({ status: 'REJECTED' })),
    );
    const res = await rejectChangeRequest({ projectId: 183, changeRequestId: 101 });
    expect(res.status).toBe('REJECTED');
  });

  it('throws ApiError on a 403', async () => {
    server.use(
      http.post('*/change-requests/:id/reject', () =>
        HttpResponse.json({ messageEn: 'Forbidden' }, { status: 403 }),
      ),
    );
    const err = await rejectChangeRequest({ projectId: 183, changeRequestId: 101 }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
