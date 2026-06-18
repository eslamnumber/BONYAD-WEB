import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { addProject } from './add-project';

describe('addProject', () => {
  it('POSTs the validated body and returns the normalised project', async () => {
    let sent: Record<string, unknown> = {};
    server.use(
      http.post('*/portfolios/projects/add', async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 21, title: 'Villa', photos: ['https://cdn/x.jpg'] });
      }),
    );
    const project = await addProject({
      title: 'Villa',
      photos: ['https://cdn/x.jpg'],
      isPublic: true,
    });
    expect(project.id).toBe(21);
    expect(sent.title).toBe('Villa');
    expect(sent.photos).toEqual(['https://cdn/x.jpg']);
  });

  it('rejects an empty title before any network call (zod)', async () => {
    await expect(addProject({ title: '' })).rejects.toBeTruthy();
  });

  it('rejects a non-URL photo before any network call (zod)', async () => {
    await expect(addProject({ title: 'T', photos: ['not-a-url'] })).rejects.toBeTruthy();
  });

  it('throws ApiError on 400', async () => {
    server.use(
      http.post('*/portfolios/projects/add', () =>
        HttpResponse.json({ messageEn: 'Bad', errorCode: 'X' }, { status: 400 }),
      ),
    );
    const err = await addProject({ title: 'Villa' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
  });
});
