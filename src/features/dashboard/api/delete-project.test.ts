import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { deleteProject } from './delete-project';

describe('deleteProject', () => {
  it('DELETEs /projects/:id and resolves on success', async () => {
    let method: string | undefined;
    let path: string | undefined;
    server.use(
      http.delete('*/projects/:id', ({ request, params }) => {
        method = request.method;
        path = String(params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(deleteProject(42)).resolves.toBeUndefined();
    expect(method).toBe('DELETE');
    expect(path).toBe('42');
  });

  it('throws ApiError when the backend rejects the deletion', async () => {
    server.use(
      http.delete('*/projects/:id', () =>
        HttpResponse.json(
          { messageEn: 'Cannot delete a project that already has bids.' },
          { status: 400 },
        ),
      ),
    );
    const err = await deleteProject(42).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).messageEn).toBe('Cannot delete a project that already has bids.');
  });
});
