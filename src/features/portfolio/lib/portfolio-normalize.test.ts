import { describe, expect, it } from 'vitest';

import { normalizeSpecialties } from '../schemas/portfolio';

import { extractProjects, normalizePortfolio, normalizeProject } from './portfolio-normalize';

describe('normalizeSpecialties', () => {
  it('passes an array through, trimming + dropping blanks', () => {
    expect(normalizeSpecialties([' Finishing ', '', 'Tiling'])).toEqual(['Finishing', 'Tiling']);
  });
  it('splits a comma-separated string', () => {
    expect(normalizeSpecialties('Finishing, Tiling , ')).toEqual(['Finishing', 'Tiling']);
  });
  it('defaults to [] for nullish', () => {
    expect(normalizeSpecialties(undefined)).toEqual([]);
  });
});

describe('normalizeProject', () => {
  it('coerces id and defaults photos to []', () => {
    const p = normalizeProject({ id: '7', title: 'T', projectValue: '5000' });
    expect(p).toMatchObject({ id: 7, title: 'T', photos: [], projectValue: 5000 });
  });
});

describe('extractProjects', () => {
  it('reads a bare array', () => {
    expect(extractProjects([{ id: 1, title: 'A' }])).toHaveLength(1);
  });
  it('reads a { projects } / { pastProjects } envelope', () => {
    expect(extractProjects({ pastProjects: [{ id: 2, title: 'B' }] })).toHaveLength(1);
  });
  it('drops entries without a finite id', () => {
    expect(extractProjects([{ title: 'no id' }])).toHaveLength(0);
  });
});

describe('normalizePortfolio', () => {
  it('coerces id, normalises specialties from a string, and folds embedded projects', () => {
    const p = normalizePortfolio({
      id: '3',
      businessName: 'Co',
      specialties: 'Finishing, Tiling',
      pastProjects: [{ id: 9, title: 'X' }],
    });
    expect(p.id).toBe(3);
    expect(p.specialties).toEqual(['Finishing', 'Tiling']);
    expect(p.projects).toHaveLength(1);
  });
});
