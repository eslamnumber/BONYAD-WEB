import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getExternalProjects } from './get-external-projects';

const PROJECT = {
  id: 4,
  title: 'فيلا الياسمين',
  location: 'الرياض',
  clientName: 'عميل تجريبي',
  status: 'IN_PROGRESS',
  progress: 0,
};

describe('getExternalProjects', () => {
  it('GETs /technicians/external-projects and unwraps the { projects } envelope', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/technicians/external-projects', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ projects: [PROJECT], count: 1, success: true });
      }),
    );

    const projects = await getExternalProjects();

    expect(new URL(capturedUrl).pathname.endsWith('/technicians/external-projects')).toBe(true);
    expect(projects).toHaveLength(1);
    expect(projects[0]).toMatchObject({ id: 4, status: 'IN_PROGRESS', progress: 0 });
  });

  it('returns [] for the empty / non-enveloped body', async () => {
    server.use(
      http.get('*/technicians/external-projects', () =>
        HttpResponse.json({ projects: [], count: 0, success: true }),
      ),
    );
    await expect(getExternalProjects()).resolves.toEqual([]);
  });

  it('tolerates a bare array body', async () => {
    server.use(http.get('*/technicians/external-projects', () => HttpResponse.json([PROJECT])));
    await expect(getExternalProjects()).resolves.toHaveLength(1);
  });

  it('throws ApiError with the status on a 401', async () => {
    server.use(
      http.get('*/technicians/external-projects', () =>
        HttpResponse.json({ messageEn: 'Unauthorized' }, { status: 401 }),
      ),
    );
    const err = await getExternalProjects().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});
