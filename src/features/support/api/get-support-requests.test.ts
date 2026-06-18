import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getSupportRequests } from './get-support-requests';

const OLDER = { id: 1, subject: 'Old', status: 'RESOLVED', requestedAt: '2026-05-01T09:00:00Z' };
const NEWER = { id: 2, subject: 'New', status: 'PENDING', requestedAt: '2026-06-01T09:00:00Z' };

describe('getSupportRequests', () => {
  it('returns the requests sorted newest-first from a bare array', async () => {
    server.use(http.get('*/support/my-requests', () => HttpResponse.json([OLDER, NEWER])));
    const list = await getSupportRequests();
    expect(list.map((r) => r.id)).toEqual([2, 1]);
  });

  it('unwraps the { requests } envelope', async () => {
    server.use(http.get('*/support/my-requests', () => HttpResponse.json({ requests: [NEWER] })));
    expect(await getSupportRequests()).toHaveLength(1);
  });

  it('unwraps the { data } envelope', async () => {
    server.use(http.get('*/support/my-requests', () => HttpResponse.json({ data: [OLDER] })));
    expect((await getSupportRequests())[0]?.id).toBe(1);
  });

  it('defaults to an empty list when no array is present', async () => {
    server.use(http.get('*/support/my-requests', () => HttpResponse.json({ success: true })));
    expect(await getSupportRequests()).toEqual([]);
  });

  it('throws ApiError with localized messages on 401', async () => {
    server.use(
      http.get('*/support/my-requests', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'AUTH' },
          { status: 401 },
        ),
      ),
    );
    const err = await getSupportRequests().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
    expect((err as ApiError).errorCode).toBe('AUTH');
  });
});
