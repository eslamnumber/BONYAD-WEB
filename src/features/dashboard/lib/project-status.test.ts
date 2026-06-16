import { describe, expect, it } from 'vitest';

import { isApprovedPhase, matchesFilter, statusVariant } from './project-status';

describe('statusVariant', () => {
  it('maps known backend statuses to their badge variants', () => {
    expect(statusVariant('APPROVED')).toBe('approved');
    expect(statusVariant('OFFER_SENT')).toBe('offerSent');
    expect(statusVariant('BID_RECEIVED')).toBe('bidReceived');
    expect(statusVariant('IN_PROGRESS')).toBe('inProgress');
    expect(statusVariant('REJECTED')).toBe('rejected');
    expect(statusVariant('COMPLETED')).toBe('completed');
  });

  it('maps CONTRACT_SIGNING to its own variant, not pending', () => {
    expect(statusVariant('CONTRACT_SIGNING')).toBe('contractSigning');
  });

  it('matches on substrings, case-insensitively', () => {
    expect(statusVariant('ProjectCompleted')).toBe('completed');
    expect(statusVariant('bidding')).toBe('bidReceived');
  });

  it('maps APPROVED and PHASE_PLANNING (phase planning has no separate UI state) to approved', () => {
    expect(statusVariant('APPROVED')).toBe('approved');
    expect(statusVariant('PHASE_PLANNING')).toBe('approved');
    expect(statusVariant('PLANNING')).toBe('approved');
  });

  it('falls back to pending for unknown / missing status', () => {
    expect(statusVariant('PENDING')).toBe('pending');
    expect(statusVariant('something-new')).toBe('pending');
    expect(statusVariant(undefined)).toBe('pending');
  });
});

describe('isApprovedPhase', () => {
  it('is true for every approved-phase variant (all render the approved view)', () => {
    expect(isApprovedPhase('APPROVED')).toBe(true);
    expect(isApprovedPhase('PHASE_PLANNING')).toBe(true);
    expect(isApprovedPhase('PHASE_PLANNING_APPROVED')).toBe(true);
    expect(isApprovedPhase('PLANNING')).toBe(true);
    expect(isApprovedPhase('approved')).toBe(true);
  });

  it('is false for other lifecycle phases and missing status', () => {
    expect(isApprovedPhase('PENDING')).toBe(false);
    expect(isApprovedPhase('BID_RECEIVED')).toBe(false);
    expect(isApprovedPhase('CONTRACT_SIGNING')).toBe(false);
    expect(isApprovedPhase('IN_PROGRESS')).toBe(false);
    expect(isApprovedPhase('COMPLETED')).toBe(false);
    expect(isApprovedPhase(undefined)).toBe(false);
  });

  it('agrees with the badge variant — the detail router and the list pill never diverge', () => {
    const statuses = [
      'APPROVED',
      'PHASE_PLANNING_APPROVED',
      'CONTRACT_SIGNING',
      'IN_PROGRESS',
      'COMPLETED',
    ];
    for (const s of statuses) expect(isApprovedPhase(s)).toBe(statusVariant(s) === 'approved');
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
    expect(matchesFilter(project('PHASE_PLANNING'), 'approved')).toBe(true);
    expect(matchesFilter(project('IN_PROGRESS'), 'inProgress')).toBe(true);
    expect(matchesFilter(project('COMPLETED'), 'completed')).toBe(true);
    expect(matchesFilter(project('OFFER_SENT'), 'bidding')).toBe(true);
  });

  it('groups every approved-phase status under the approved filter', () => {
    for (const s of ['APPROVED', 'PHASE_PLANNING', 'PHASE_PLANNING_APPROVED', 'PLANNING']) {
      expect(matchesFilter(project(s), 'approved')).toBe(true);
    }
  });

  it('matches contract-signing under the contract filter (card stays in the list)', () => {
    expect(matchesFilter(project('CONTRACT_SIGNING'), 'contract')).toBe(true);
    expect(matchesFilter(project('CONTRACT_SIGNING'), 'approved')).toBe(false);
  });

  it('matches direct assignment on projectType, not the status string', () => {
    const directAssigned = { id: 1, projectType: 'DIRECT_ASSIGNMENT', status: 'PENDING' };
    expect(matchesFilter(directAssigned, 'directAssignment')).toBe(true);
    expect(
      matchesFilter({ id: 1, projectType: 'BIDDING', status: 'PENDING' }, 'directAssignment'),
    ).toBe(false);
    expect(matchesFilter(project('PENDING'), 'directAssignment')).toBe(false);
  });

  it('excludes directly-assigned projects from the available pool', () => {
    expect(matchesFilter(project('PENDING'), 'available')).toBe(true);
    expect(
      matchesFilter({ id: 1, projectType: 'DIRECT_ASSIGNMENT', status: 'PENDING' }, 'available'),
    ).toBe(false);
  });

  it('excludes a project whose status does not match the filter', () => {
    expect(matchesFilter(project('APPROVED'), 'completed')).toBe(false);
    expect(matchesFilter(project(undefined), 'inProgress')).toBe(false);
  });
});
