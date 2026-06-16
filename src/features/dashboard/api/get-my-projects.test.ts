import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getMyProjects } from './get-my-projects';

const MINE = {
  id: 11,
  title: 'فيلا سكنية بالرياض',
  serviceNameEn: 'Construction',
  serviceNameAr: 'البناء',
  budget: 180000,
  status: 'IN_PROGRESS',
  createdAt: '2025-09-10T00:00:00Z',
};

describe('getMyProjects', () => {
  it('returns the bare array body as-is', async () => {
    server.use(http.get('*/projects/my', () => HttpResponse.json([MINE])));
    expect(await getMyProjects()).toEqual([MINE]);
  });

  it('unwraps a paginated page envelope', async () => {
    server.use(
      http.get('*/projects/my', () => HttpResponse.json({ content: [MINE], totalElements: 1 })),
    );
    const projects = await getMyProjects();
    expect(projects.map((p) => p.id)).toEqual([11]);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(http.get('*/projects/my', () => HttpResponse.json({ unexpected: 'shape' })));
    expect(await getMyProjects()).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/projects/my', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getMyProjects().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('en')).toBe('Unauthorized.');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
