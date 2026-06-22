import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getSupervisingProjects } from './get-supervising-projects';

describe('getSupervisingProjects', () => {
  it('GETs /projects/supervising with the status filter and returns the array', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/projects/supervising', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([{ id: 213, supervisorStatus: 'INVITED' }]);
      }),
    );
    const list = await getSupervisingProjects('invited');
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 213, supervisorStatus: 'INVITED' });
    expect(new URL(capturedUrl).searchParams.get('status')).toBe('invited');
  });

  it('tolerates a { content } envelope', async () => {
    server.use(
      http.get('*/projects/supervising', () =>
        HttpResponse.json({ content: [{ id: 1 }, { id: 2 }] }),
      ),
    );
    await expect(getSupervisingProjects('active')).resolves.toHaveLength(2);
  });

  it('returns [] for a non-array / non-enveloped body', async () => {
    server.use(http.get('*/projects/supervising', () => HttpResponse.json({})));
    await expect(getSupervisingProjects('invited')).resolves.toEqual([]);
  });

  it('throws ApiError with the status on a 401', async () => {
    server.use(
      http.get('*/projects/supervising', () =>
        HttpResponse.json({ messageEn: 'Unauthorized' }, { status: 401 }),
      ),
    );
    const err = await getSupervisingProjects('invited').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});
