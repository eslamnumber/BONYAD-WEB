import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getBlogs } from './get-blogs';

const POST_OLD = {
  id: 1,
  title: 'Older post',
  summary: 'Older summary',
  images: ['https://example.test/old.png'],
  tags: ['Finishing'],
  publishedAt: '2025-01-15T10:00:00Z',
};

const POST_NEW = {
  id: 2,
  title: 'Newer post',
  summary: 'Newer summary',
  images: ['https://example.test/new.png'],
  tags: ['Legal'],
  publishedAt: '2025-09-15T10:00:00Z',
};

describe('getBlogs', () => {
  it('returns paginated content sorted by publishedAt desc (newest first)', async () => {
    server.use(
      http.get('*/blogs', () =>
        HttpResponse.json({
          content: [POST_OLD, POST_NEW],
          totalElements: 2,
          totalPages: 1,
          currentPage: 0,
          size: 10,
        }),
      ),
    );
    const posts = await getBlogs();
    expect(posts).toHaveLength(2);
    expect(posts.at(0)?.id).toBe(2);
    expect(posts.at(1)?.id).toBe(1);
  });

  it('passes page / size / search / tag as query params', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/blogs', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ content: [] });
      }),
    );
    await getBlogs({ page: 2, size: 5, search: 'permits', tag: 'Legal' });
    const url = new URL(capturedUrl);
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('size')).toBe('5');
    expect(url.searchParams.get('search')).toBe('permits');
    expect(url.searchParams.get('tag')).toBe('Legal');
  });

  it('accepts a bare array body (non-paginated) for backend flexibility', async () => {
    server.use(http.get('*/blogs', () => HttpResponse.json([POST_NEW])));
    const posts = await getBlogs();
    expect(posts).toEqual([POST_NEW]);
  });

  it('returns [] when content is missing / shape is unexpected', async () => {
    server.use(http.get('*/blogs', () => HttpResponse.json({ unexpected: 'shape' })));
    const posts = await getBlogs();
    expect(posts).toEqual([]);
  });

  it('throws ApiError with status / messages on 500', async () => {
    server.use(
      http.get('*/blogs', () =>
        HttpResponse.json(
          { messageEn: 'Server error.', messageAr: 'خطأ في الخادم.', errorCode: 'SERVER_ERROR' },
          { status: 500 },
        ),
      ),
    );
    const err = await getBlogs().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
    expect((err as ApiError).errorCode).toBe('SERVER_ERROR');
    expect((err as ApiError).localizedMessage('en')).toBe('Server error.');
    expect((err as ApiError).localizedMessage('ar')).toBe('خطأ في الخادم.');
  });
});
