import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getProjectSupervisor } from './get-project-supervisor';

describe('getProjectSupervisor', () => {
  it('GETs /projects/:id/supervisor and returns the assignment', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/projects/:id/supervisor', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          projectId: 213,
          supervisorId: 444,
          supervisorName: 'ahmed farahat tech',
          status: 'ACTIVE',
          active: true,
        });
      }),
    );
    const res = await getProjectSupervisor(213);
    expect(new URL(capturedUrl).pathname).toMatch(/\/projects\/213\/supervisor$/);
    expect(res).toMatchObject({ projectId: 213, status: 'ACTIVE', active: true });
  });

  it('throws ApiError on a 404 (no supervisor)', async () => {
    server.use(
      http.get('*/projects/:id/supervisor', () =>
        HttpResponse.json({ messageEn: 'Not found' }, { status: 404 }),
      ),
    );
    const err = await getProjectSupervisor(99).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
  });
});
