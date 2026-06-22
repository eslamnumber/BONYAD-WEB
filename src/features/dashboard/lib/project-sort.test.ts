import { describe, expect, it } from 'vitest';

import type { Project } from '../schemas/project';

import { sortProjects } from './project-sort';

const p = (over: Partial<Project> & { id: number }): Project => ({ ...over });

const SAMPLE: Project[] = [
  p({ id: 1, budget: 180000, createdAt: '2026-06-10T00:00:00Z' }),
  p({ id: 2, budget: 250000, createdAt: '2025-10-15T00:00:00Z' }),
  p({ id: 3, budget: 2700, createdAt: '2026-06-03T00:00:00Z' }),
  p({ id: 4, budget: 300000, createdAt: '2025-08-22T00:00:00Z' }),
  p({ id: 5, budget: 300000, createdAt: '2026-06-09T00:00:00Z' }),
];

describe('sortProjects', () => {
  it('orders by price high→low and low→high', () => {
    expect(sortProjects(SAMPLE, 'highPrice').map((x) => x.budget)).toEqual([
      300000, 300000, 250000, 180000, 2700,
    ]);
    expect(sortProjects(SAMPLE, 'lowPrice')[0]?.budget).toBe(2700);
  });

  it('orders by date newest→oldest and oldest→newest', () => {
    expect(sortProjects(SAMPLE, 'newest')[0]?.id).toBe(1);
    expect(sortProjects(SAMPLE, 'oldest')[0]?.id).toBe(4);
  });

  it('treats a missing/null budget or date as zero, never throwing', () => {
    const mixed: Project[] = [p({ id: 6 }), p({ id: 7, budget: null }), p({ id: 8, budget: 50 })];
    expect(sortProjects(mixed, 'lowPrice').at(-1)?.id).toBe(8);
    expect(() => sortProjects(mixed, 'oldest')).not.toThrow();
  });

  it('does not mutate the input array', () => {
    const before = SAMPLE.map((x) => x.id);
    sortProjects(SAMPLE, 'highPrice');
    expect(SAMPLE.map((x) => x.id)).toEqual(before);
  });
});
