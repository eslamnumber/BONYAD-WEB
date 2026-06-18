import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getMyFeedback } from './get-my-feedback';

const OLDER = { id: 1, message: 'older', status: 'RESOLVED', createdAt: '2026-06-01T10:00:00.000' };
const NEWER = { id: 2, message: 'newer', status: 'NEW', createdAt: '2026-06-18T13:08:45.000' };

describe('getMyFeedback', () => {
  it('parses the wrapped envelope and sorts newest first', async () => {
    server.use(
      http.get('*/app-feedback/mine', () =>
        HttpResponse.json({ success: true, count: 2, feedback: [OLDER, NEWER] }),
      ),
    );

    const res = await getMyFeedback();
    expect(res.map((f) => f.id)).toEqual([2, 1]);
  });

  it('parses a bare array response', async () => {
    server.use(http.get('*/app-feedback/mine', () => HttpResponse.json([NEWER, OLDER])));

    const res = await getMyFeedback();
    expect(res.map((f) => f.id)).toEqual([2, 1]);
  });

  it('returns an empty list when neither shape has items', async () => {
    server.use(http.get('*/app-feedback/mine', () => HttpResponse.json({ success: true })));

    await expect(getMyFeedback()).resolves.toEqual([]);
  });

  it('throws ApiError on 401', async () => {
    server.use(
      http.get('*/app-feedback/mine', () =>
        HttpResponse.json({ messageEn: 'Unauthorized', errorCode: 'AUTH' }, { status: 401 }),
      ),
    );

    const err = await getMyFeedback().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});
