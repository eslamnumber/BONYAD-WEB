import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { getPortfolioProjects } from './get-portfolio-projects';

describe('getPortfolioProjects', () => {
  it('reads a bare array of projects', async () => {
    server.use(
      http.get('*/portfolios/projects/my', () =>
        HttpResponse.json([{ id: 1, title: 'A', photos: ['x'] }]),
      ),
    );
    const projects = await getPortfolioProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0]?.photos).toEqual(['x']);
  });

  it('reads a { pastProjects } envelope', async () => {
    server.use(
      http.get('*/portfolios/projects/my', () =>
        HttpResponse.json({ pastProjects: [{ id: 2, title: 'B' }] }),
      ),
    );
    expect(await getPortfolioProjects()).toHaveLength(1);
  });

  it('returns [] on 404', async () => {
    server.use(http.get('*/portfolios/projects/my', () => HttpResponse.json({}, { status: 404 })));
    expect(await getPortfolioProjects()).toEqual([]);
  });
});
