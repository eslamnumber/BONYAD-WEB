import { describe, expect, it } from 'vitest';

import { toAuthUser } from './session';

describe('toAuthUser', () => {
  it('returns null when the payload is missing or has no numeric id', () => {
    expect(toAuthUser(undefined)).toBeNull();
    expect(toAuthUser({})).toBeNull();
    expect(toAuthUser({ name: 'no id' })).toBeNull();
  });

  it('maps a full user payload into AuthUser', () => {
    expect(
      toAuthUser({
        id: 7,
        name: 'Eslam',
        role: 'TECHNICIAN',
        profileImage: 'x.png',
        status: 'APPROVED',
        onboarded: true,
        profileComplete: false,
      }),
    ).toEqual({
      id: 7,
      name: 'Eslam',
      role: 'TECHNICIAN',
      phoneNumber: undefined,
      email: undefined,
      profileImage: 'x.png',
      status: 'APPROVED',
      onboarded: true,
      profileComplete: false,
    });
  });

  it('defaults role to empty string when absent so it never crashes', () => {
    expect(toAuthUser({ id: 1 })?.role).toBe('');
  });

  it('preserves an unseen backend role verbatim (e.g. ADMIN)', () => {
    expect(toAuthUser({ id: 1, role: 'ADMIN' })?.role).toBe('ADMIN');
  });
});
