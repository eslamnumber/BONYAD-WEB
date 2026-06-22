import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { removeSupervisor } from './remove-supervisor';

describe('removeSupervisor', () => {
  it('DELETEs /projects/:id/supervisor and returns the cleared assignment', async () => {
    let method = '';
    let capturedUrl = '';
    server.use(
      http.delete('*/projects/:id/supervisor', ({ request }) => {
        method = request.method;
        capturedUrl = request.url;
        return HttpResponse.json({
          projectId: 223,
          supervisorId: null,
          status: 'REMOVED',
          active: false,
        });
      }),
    );
    const res = await removeSupervisor(223);
    expect(method).toBe('DELETE');
    expect(new URL(capturedUrl).pathname).toMatch(/\/projects\/223\/supervisor$/);
    expect(res).toMatchObject({ status: 'REMOVED' });
  });

  it('throws ApiError on a 403 (not the owner)', async () => {
    server.use(
      http.delete('*/projects/:id/supervisor', () =>
        HttpResponse.json({ messageEn: 'Forbidden' }, { status: 403 }),
      ),
    );
    const err = await removeSupervisor(223).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
