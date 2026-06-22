import { describe, expect, it } from 'vitest';

import { supervisorCardState } from './supervisor-card-state';

describe('supervisorCardState', () => {
  it('is active when supervisorStatus is ACTIVE or hasActiveSupervisor is true', () => {
    expect(supervisorCardState({ supervisorStatus: 'ACTIVE' })).toBe('active');
    expect(supervisorCardState({ hasActiveSupervisor: true })).toBe('active');
  });

  it('is pending when the invitation is INVITED', () => {
    expect(supervisorCardState({ supervisorStatus: 'INVITED' })).toBe('pending');
  });

  it('is hireable when canHireSupervisor and no supervisor yet', () => {
    expect(supervisorCardState({ canHireSupervisor: true })).toBe('hireable');
  });

  it('is none otherwise (REMOVED / completed / empty)', () => {
    expect(supervisorCardState({ supervisorStatus: 'REMOVED', canHireSupervisor: false })).toBe(
      'none',
    );
    expect(supervisorCardState({ canHireSupervisor: false })).toBe('none');
    expect(supervisorCardState({})).toBe('none');
  });

  it('prefers active over a stale hireable flag', () => {
    expect(supervisorCardState({ supervisorStatus: 'ACTIVE', canHireSupervisor: true })).toBe(
      'active',
    );
  });
});
