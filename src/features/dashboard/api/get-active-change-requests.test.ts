import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getActiveChangeRequests } from './get-active-change-requests';

describe('getActiveChangeRequests', () => {
  it('reads a bare array and normalises person + phaseChanges', async () => {
    server.use(
      http.get('*/change-requests/project/:projectId/active', () =>
        HttpResponse.json([
          {
            id: 101,
            status: 'PENDING',
            requestedBy: { id: 9, name: 'ahmed' },
            phaseChanges: JSON.stringify([{ actionType: 'CREATE', moneySpent: 300 }]),
          },
        ]),
      ),
    );
    const rows = await getActiveChangeRequests(183);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.requestedBy).toBe('ahmed');
    expect(rows[0]?.phaseChanges).toEqual([{ actionType: 'CREATE', moneySpent: 300 }]);
  });

  it('tolerates the iOS { activeNegotiations } envelope', async () => {
    server.use(
      http.get('*/change-requests/project/:projectId/active', () =>
        HttpResponse.json({ activeNegotiations: [{ id: 7, status: 'RESPONDED' }] }),
      ),
    );
    const rows = await getActiveChangeRequests(183);
    expect(rows.map((r) => r.id)).toEqual([7]);
  });

  it('throws ApiError on a 403', async () => {
    server.use(
      http.get('*/change-requests/project/:projectId/active', () =>
        HttpResponse.json({ messageEn: 'Forbidden', errorCode: 'FORBIDDEN' }, { status: 403 }),
      ),
    );
    const err = await getActiveChangeRequests(183).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
    expect((err as ApiError).errorCode).toBe('FORBIDDEN');
  });
});
