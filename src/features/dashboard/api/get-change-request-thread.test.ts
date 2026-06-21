import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getChangeRequestThread } from './get-change-request-thread';

describe('getChangeRequestThread', () => {
  it('reads the chain as a bare array (parent + children)', async () => {
    server.use(
      http.get('*/change-requests/:id/thread', () =>
        HttpResponse.json([
          { id: 13, parentRequestId: null, requestedBy: 'ahmed user' },
          { id: 14, parentRequestId: 13, respondedBy: { name: 'ahmed tech' } },
        ]),
      ),
    );
    const rows = await getChangeRequestThread(13);
    expect(rows.map((r) => r.id)).toEqual([13, 14]);
    expect(rows[1]?.respondedBy).toBe('ahmed tech');
  });

  it('tolerates the iOS { thread } envelope', async () => {
    server.use(
      http.get('*/change-requests/:id/thread', () => HttpResponse.json({ thread: [{ id: 13 }] })),
    );
    expect((await getChangeRequestThread(13)).map((r) => r.id)).toEqual([13]);
  });

  it('throws ApiError on a 403', async () => {
    server.use(
      http.get('*/change-requests/:id/thread', () =>
        HttpResponse.json({ messageEn: 'Forbidden' }, { status: 403 }),
      ),
    );
    const err = await getChangeRequestThread(13).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
