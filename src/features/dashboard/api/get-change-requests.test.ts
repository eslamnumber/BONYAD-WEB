import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getChangeRequests } from './get-change-requests';

describe('getChangeRequests', () => {
  it('reads the full history as a bare array', async () => {
    server.use(
      http.get('*/change-requests/project/:projectId', () =>
        HttpResponse.json([
          { id: 13, status: 'COMPLETED', requestedBy: 'ahmed user' },
          { id: 12, status: 'REJECTED', requestedBy: 'ahmed user' },
        ]),
      ),
    );
    const rows = await getChangeRequests(183);
    expect(rows.map((r) => r.id)).toEqual([13, 12]);
    expect(rows[0]?.requestedBy).toBe('ahmed user');
  });

  it('returns [] for an unexpected (non-array, non-envelope) body', async () => {
    server.use(
      http.get('*/change-requests/project/:projectId', () => HttpResponse.json({ nope: true })),
    );
    expect(await getChangeRequests(183)).toEqual([]);
  });

  it('throws ApiError on a 404', async () => {
    server.use(
      http.get('*/change-requests/project/:projectId', () =>
        HttpResponse.json({ messageEn: 'Not found' }, { status: 404 }),
      ),
    );
    const err = await getChangeRequests(183).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
  });
});
