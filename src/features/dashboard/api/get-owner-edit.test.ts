import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getOwnerEdit } from './get-owner-edit';

describe('getOwnerEdit', () => {
  it('GETs /projects/:id/owner-edit and returns the { project, phases } body', async () => {
    let path: string | undefined;
    server.use(
      http.get('*/projects/:id/owner-edit', ({ params }) => {
        path = String(params.id);
        return HttpResponse.json({
          project: { description: 'Villa\n\nScope', budget: 250000, address: 'Riyadh' },
          phases: [{ id: 1, description: 'Foundations', timeSpentDays: 21 }],
        });
      }),
    );
    const res = await getOwnerEdit(7);
    expect(path).toBe('7');
    expect(res.project?.budget).toBe(250000);
    expect(res.phases?.[0]?.description).toBe('Foundations');
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.get('*/projects/:id/owner-edit', () =>
        HttpResponse.json({ messageEn: 'Not your project.' }, { status: 403 }),
      ),
    );
    const err = await getOwnerEdit(7).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
