import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { updateProject } from './update-project';

describe('updateProject', () => {
  it('PUTs the combined photos to /portfolios/projects/:id', async () => {
    let hitUrl = '';
    let sent: Record<string, unknown> = {};
    server.use(
      http.put('*/portfolios/projects/:id', async ({ request }) => {
        hitUrl = request.url;
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 30, title: 'Updated' });
      }),
    );
    const project = await updateProject({
      id: 30,
      input: {
        title: 'Updated',
        photos: ['https://cdn/a.jpg', 'https://cdn/b.jpg'],
        isPublic: true,
      },
    });
    expect(project.id).toBe(30);
    expect(hitUrl).toContain('/portfolios/projects/30');
    expect(sent.photos).toEqual(['https://cdn/a.jpg', 'https://cdn/b.jpg']);
  });

  it('throws ApiError on 404', async () => {
    server.use(
      http.put('*/portfolios/projects/:id', () =>
        HttpResponse.json({ messageEn: 'Gone', errorCode: 'NOT_FOUND' }, { status: 404 }),
      ),
    );
    const err = await updateProject({ id: 9, input: { title: 'T' } }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
  });
});
