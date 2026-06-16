import { describe, expect, it } from 'vitest';

import type { MyProject } from '../schemas/project';

import { computeCustomerStats, matchesCustomerFilter, sortProjects } from './project-customer';

const p = (over: Partial<MyProject> & { id: number }): MyProject => ({ ...over });

const SAMPLE: MyProject[] = [
  p({ id: 1, status: 'IN_PROGRESS', budget: 180000, createdAt: '2026-06-10T00:00:00Z' }),
  p({ id: 2, status: 'CONTRACT_SIGNING', budget: 250000, createdAt: '2025-10-15T00:00:00Z' }),
  p({ id: 3, status: 'PENDING', budget: 2700, createdAt: '2026-06-03T00:00:00Z' }),
  p({ id: 4, status: 'REJECTED', budget: 300000, createdAt: '2025-08-22T00:00:00Z' }),
  p({ id: 5, status: 'COMPLETED', budget: 300000, createdAt: '2026-06-09T00:00:00Z' }),
];

describe('matchesCustomerFilter', () => {
  it('passes everything for "all"', () => {
    expect(SAMPLE.filter((x) => matchesCustomerFilter(x, 'all'))).toHaveLength(5);
  });

  it('narrows by status variant', () => {
    expect(SAMPLE.filter((x) => matchesCustomerFilter(x, 'inProgress')).map((x) => x.id)).toEqual([
      1,
    ]);
    expect(SAMPLE.filter((x) => matchesCustomerFilter(x, 'completed')).map((x) => x.id)).toEqual([
      5,
    ]);
    expect(SAMPLE.filter((x) => matchesCustomerFilter(x, 'contract')).map((x) => x.id)).toEqual([
      2,
    ]);
    expect(SAMPLE.filter((x) => matchesCustomerFilter(x, 'pending')).map((x) => x.id)).toEqual([3]);
  });
});

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

  it('does not mutate the input array', () => {
    const before = SAMPLE.map((x) => x.id);
    sortProjects(SAMPLE, 'highPrice');
    expect(SAMPLE.map((x) => x.id)).toEqual(before);
  });
});

describe('computeCustomerStats', () => {
  const now = new Date('2026-06-16T00:00:00Z');

  it('counts each category from the list', () => {
    const stats = computeCustomerStats(SAMPLE, now);
    expect(stats.total.value).toBe(5);
    expect(stats.active.value).toBe(1);
    expect(stats.completed.value).toBe(1);
  });

  it('deltas count only this-month creations per category', () => {
    const stats = computeCustomerStats(SAMPLE, now);
    expect(stats.total.delta).toBe(3); // ids 1, 3, 5 created in June 2026
    expect(stats.active.delta).toBe(1); // id 1
    expect(stats.completed.delta).toBe(1); // id 5
  });

  it('is empty-safe', () => {
    expect(computeCustomerStats([], now)).toEqual({
      total: { value: 0, delta: 0 },
      active: { value: 0, delta: 0 },
      completed: { value: 0, delta: 0 },
    });
  });
});
