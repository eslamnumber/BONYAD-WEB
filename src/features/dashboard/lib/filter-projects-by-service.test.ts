import { describe, expect, it } from 'vitest';

import type { Project } from '../schemas/project';

import { filterProjectsByServices } from './filter-projects-by-service';

const project = (id: number, serviceId?: number): Project => ({ id, serviceId });

describe('filterProjectsByServices', () => {
  it('keeps only projects whose serviceId is one the technician offers', () => {
    const projects = [project(1, 10), project(2, 20), project(3, 30)];
    const kept = filterProjectsByServices(projects, [{ id: 10 }, { id: 30 }]);
    expect(kept.map((p) => p.id)).toEqual([1, 3]);
  });

  it('drops projects with no serviceId', () => {
    const kept = filterProjectsByServices([project(1), project(2, 10)], [{ id: 10 }]);
    expect(kept.map((p) => p.id)).toEqual([2]);
  });

  it('returns nothing when the technician offers no services', () => {
    expect(filterProjectsByServices([project(1, 10), project(2, 20)], [])).toEqual([]);
  });
});
