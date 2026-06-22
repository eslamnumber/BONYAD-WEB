import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { hireSupervisor } from './hire-supervisor';

describe('hireSupervisor', () => {
  it('POSTs { technicianId } to /projects/:id/supervisor and returns the assignment', async () => {
    let body: unknown;
    let capturedUrl = '';
    server.use(
      http.post('*/projects/:id/supervisor', async ({ request }) => {
        body = await request.json();
        capturedUrl = request.url;
        return HttpResponse.json({
          projectId: 223,
          supervisorId: 444,
          status: 'INVITED',
          active: false,
        });
      }),
    );
    const res = await hireSupervisor(223, 444);
    expect(body).toEqual({ technicianId: 444 });
    expect(new URL(capturedUrl).pathname).toMatch(/\/projects\/223\/supervisor$/);
    expect(res).toMatchObject({ status: 'INVITED' });
  });

  it('throws ApiError on a 400 (already has a supervisor)', async () => {
    server.use(
      http.post('*/projects/:id/supervisor', () =>
        HttpResponse.json(
          { messageEn: 'Already has a supervisor', errorCode: 'CONFLICT' },
          { status: 400 },
        ),
      ),
    );
    const err = await hireSupervisor(223, 444).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
  });
});
