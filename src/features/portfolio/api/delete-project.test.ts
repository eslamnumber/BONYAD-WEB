import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { deleteProject } from './delete-project';

describe('deleteProject', () => {
  it('DELETEs /portfolios/projects/:id and resolves', async () => {
    let hitUrl = '';
    server.use(
      http.delete('*/portfolios/projects/:id', ({ request }) => {
        hitUrl = request.url;
        return HttpResponse.json({ message: 'deleted' });
      }),
    );
    await expect(deleteProject(15)).resolves.toBeUndefined();
    expect(hitUrl).toContain('/portfolios/projects/15');
  });

  it('throws ApiError on 404', async () => {
    server.use(
      http.delete('*/portfolios/projects/:id', () =>
        HttpResponse.json({ messageEn: 'Gone', errorCode: 'NOT_FOUND' }, { status: 404 }),
      ),
    );
    const err = await deleteProject(404).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).errorCode).toBe('NOT_FOUND');
  });
});
