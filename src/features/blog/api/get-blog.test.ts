import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getBlog } from './get-blog';

const BLOG = {
  id: 42,
  title: 'Test blog title',
  summary: 'Short summary.',
  content: 'Long body content.\n\nSecond paragraph.',
  images: ['https://example.test/img.png'],
  tags: ['Finishing'],
  publishedAt: '2025-08-20T10:00:00Z',
  author: { id: 1, name: 'Aziz' },
};

describe('getBlog', () => {
  it('fetches the blog by numeric id and returns the parsed body', async () => {
    let capturedPath = '';
    server.use(
      http.get('*/blogs/:id', ({ params, request }) => {
        capturedPath = new URL(request.url).pathname;
        if (params.id !== '42') return HttpResponse.json({}, { status: 404 });
        return HttpResponse.json(BLOG);
      }),
    );

    const blog = await getBlog(42);

    expect(capturedPath).toMatch(/\/blogs\/42$/);
    expect(blog.id).toBe(42);
    expect(blog.title).toBe('Test blog title');
    expect(blog.author?.name).toBe('Aziz');
  });

  it('accepts a string id at the call boundary', async () => {
    server.use(http.get('*/blogs/:id', () => HttpResponse.json(BLOG)));
    const blog = await getBlog('42');
    expect(blog.id).toBe(42);
  });

  it('throws ApiError with status / localised messages on a 404', async () => {
    server.use(
      http.get('*/blogs/:id', () =>
        HttpResponse.json(
          { messageEn: 'Not found.', messageAr: 'غير موجود.', errorCode: 'NOT_FOUND' },
          { status: 404 },
        ),
      ),
    );

    const err = await getBlog(999).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).errorCode).toBe('NOT_FOUND');
    expect((err as ApiError).localizedMessage('en')).toBe('Not found.');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير موجود.');
  });
});
