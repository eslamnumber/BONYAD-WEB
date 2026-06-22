import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getSupervisorActivity } from './get-supervisor-activity';

describe('getSupervisorActivity', () => {
  it('GETs /projects/:id/supervisor/activity and returns the array', async () => {
    server.use(
      http.get('*/projects/:id/supervisor/activity', () =>
        HttpResponse.json([
          {
            id: 1,
            projectId: 213,
            action: '[Supervisor] accepted bid 88',
            timestamp: '2026-06-22T00:00:00Z',
          },
        ]),
      ),
    );
    const rows = await getSupervisorActivity(213);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 1, action: '[Supervisor] accepted bid 88' });
  });

  it('returns [] for a non-array body', async () => {
    server.use(http.get('*/projects/:id/supervisor/activity', () => HttpResponse.json({})));
    await expect(getSupervisorActivity(213)).resolves.toEqual([]);
  });

  it('throws ApiError on the 403 it returns before the supervisor is ACTIVE', async () => {
    server.use(
      http.get('*/projects/:id/supervisor/activity', () =>
        HttpResponse.text('Only the project owner or its supervisor can view the activity log', {
          status: 403,
        }),
      ),
    );
    const err = await getSupervisorActivity(213).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
