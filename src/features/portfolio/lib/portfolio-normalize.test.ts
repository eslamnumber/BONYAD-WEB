import { describe, expect, it } from 'vitest';

import { normalizeSpecialties } from '../schemas/portfolio';

import {
  extractProjects,
  normalizePortfolio,
  normalizeProject,
  unwrapPortfolioEntity,
} from './portfolio-normalize';

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

  it('parses the /me builder-draft shape: draft JSON string + top-level builder flags', () => {
    // backend-updated's GET /portfolios/me returns 200 with this body once the user
    // has any builder state. The legacy normaliser discarded it → "no portfolio" →
    // create-deadlock. It must be recognised as an existing portfolio.
    const p = normalizePortfolio({
      draft: JSON.stringify({
        businessName: 'Burj Co.',
        specialties: ['Finishing'],
        city: 'Riyadh',
      }),
      isPublic: true,
      publicHtmlUrl: 'https://bonyad.test/p/42',
      lastPublishedAt: '2026-06-01T10:00:00',
    });
    expect(p.businessName).toBe('Burj Co.');
    expect(p.specialties).toEqual(['Finishing']);
    expect(p.city).toBe('Riyadh');
    expect(p.isPublic).toBe(true);
    expect(p.published).toBe(true);
  });

  it('top-level builder flags override whatever is nested inside the draft', () => {
    // The backend is authoritative for isPublic / publicHtmlUrl / lastPublishedAt.
    const p = normalizePortfolio({
      draft: JSON.stringify({ isPublic: false, businessName: 'Draft Co' }),
      isPublic: true,
      lastPublishedAt: '2026-06-01T10:00:00',
    });
    expect(p.businessName).toBe('Draft Co'); // draft-supplied field passes through
    expect(p.isPublic).toBe(true); // top-level wins
    expect(p.published).toBe(true); // derived from lastPublishedAt
  });

  it('survives a malformed draft JSON string without throwing', () => {
    const p = normalizePortfolio({ draft: '{not json', isPublic: false });
    expect(p.isPublic).toBe(false);
    expect(p.businessName).toBeUndefined();
  });
});

describe('unwrapPortfolioEntity — /me builder-draft detection', () => {
  it('recognises a portfolio row by its builder-draft fields (the deadlock root cause)', () => {
    expect(
      unwrapPortfolioEntity({ draft: '{}', isPublic: true, publicHtmlUrl: 'https://x.test/p/1' }),
    ).not.toBeNull();
  });

  it('returns null when /me responds 200 but every builder field is null (new user)', () => {
    // backend-updated returns `{ draft: null, isPublic: null, ... }` when the user
    // genuinely has no row — that must NOT be classified as an existing portfolio
    // or the create panel disappears for first-time users.
    expect(unwrapPortfolioEntity({ draft: null, isPublic: null, publicHtmlUrl: null })).toBeNull();
  });

  it('still recognises the legacy /my shape alongside the builder shape', () => {
    expect(unwrapPortfolioEntity({ id: 7, businessName: 'Legacy Co' })).not.toBeNull();
  });
});
