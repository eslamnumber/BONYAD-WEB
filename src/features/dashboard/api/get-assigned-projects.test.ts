import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getAssignedProjects } from './get-assigned-projects';

const ASSIGNED = {
  id: 11,
  status: 'IN_PROGRESS',
  userName: 'أحمد العتيبي',
  projectType: 'البناء',
  title: 'فيلا سكنية بالرياض',
  budget: 180000,
};

describe('getAssignedProjects', () => {
  it('returns the bare array body as-is', async () => {
    server.use(http.get('*/projects/my-assigned', () => HttpResponse.json([ASSIGNED])));
    const projects = await getAssignedProjects();
    expect(projects).toEqual([ASSIGNED]);
  });

  it('unwraps a paginated page envelope', async () => {
    server.use(
      http.get('*/projects/my-assigned', () =>
        HttpResponse.json({ content: [ASSIGNED], totalElements: 1 }),
      ),
    );
    const projects = await getAssignedProjects();
    expect(projects.map((p) => p.id)).toEqual([11]);
  });

  it('passes the type filter as a query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/projects/my-assigned', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );
    await getAssignedProjects({ type: 'DIRECT_ASSIGNMENT' });
    expect(new URL(capturedUrl).searchParams.get('type')).toBe('DIRECT_ASSIGNMENT');
  });

  it('omits the type param when not provided', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/projects/my-assigned', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );
    await getAssignedProjects();
    expect(new URL(capturedUrl).searchParams.has('type')).toBe(false);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(
      http.get('*/projects/my-assigned', () => HttpResponse.json({ unexpected: 'shape' })),
    );
    const projects = await getAssignedProjects();
    expect(projects).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/projects/my-assigned', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getAssignedProjects().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('en')).toBe('Unauthorized.');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
