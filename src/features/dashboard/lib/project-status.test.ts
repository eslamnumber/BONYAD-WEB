import { describe, expect, it } from 'vitest';

import { matchesFilter, statusVariant } from './project-status';

describe('statusVariant', () => {
  it('maps known backend statuses to the six badge variants', () => {
    expect(statusVariant('APPROVED')).toBe('approved');
    expect(statusVariant('OFFER_SENT')).toBe('offerSent');
    expect(statusVariant('IN_PROGRESS')).toBe('inProgress');
    expect(statusVariant('REJECTED')).toBe('rejected');
    expect(statusVariant('COMPLETED')).toBe('completed');
  });

  it('matches on substrings, case-insensitively', () => {
    expect(statusVariant('ProjectCompleted')).toBe('completed');
    expect(statusVariant('bidding')).toBe('offerSent');
  });

  it('falls back to pending for unknown / missing status', () => {
    expect(statusVariant('PENDING')).toBe('pending');
    expect(statusVariant('something-new')).toBe('pending');
    expect(statusVariant(undefined)).toBe('pending');
  });
});

describe('matchesFilter', () => {
  const project = (status?: string) => ({ id: 1, status });

  it('passes everything for the "all" filter', () => {
    expect(matchesFilter(project('REJECTED'), 'all')).toBe(true);
    expect(matchesFilter(project(undefined), 'all')).toBe(true);
  });

  it('matches a project status to its filter key', () => {
    expect(matchesFilter(project('APPROVED'), 'approved')).toBe(true);
    expect(matchesFilter(project('IN_PROGRESS'), 'inProgress')).toBe(true);
    expect(matchesFilter(project('COMPLETED'), 'completed')).toBe(true);
    expect(matchesFilter(project('OFFER_SENT'), 'bidding')).toBe(true);
  });

  it('excludes a project whose status does not match the filter', () => {
    expect(matchesFilter(project('APPROVED'), 'completed')).toBe(false);
    expect(matchesFilter(project(undefined), 'inProgress')).toBe(false);
  });
});
