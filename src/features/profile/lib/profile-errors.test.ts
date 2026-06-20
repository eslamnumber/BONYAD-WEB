import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';

import { isEmailTakenError } from './profile-errors';

describe('isEmailTakenError', () => {
  it('detects the raw users_email_key unique-constraint violation', () => {
    const err = new ApiError(500, {
      error:
        'could not execute batch ... ERROR: duplicate key value violates unique constraint "users_email_key"  Detail: Key (email)=(a@b.com) already exists.',
    });
    expect(isEmailTakenError(err)).toBe(true);
  });

  it('detects a generic duplicate-key email error', () => {
    expect(
      isEmailTakenError(new ApiError(409, { message: 'Duplicate key for EMAIL column' })),
    ).toBe(true);
  });

  it('is false for an unrelated ApiError (e.g. a bad national ID)', () => {
    expect(isEmailTakenError(new ApiError(400, { errorCode: 'BAD_NID' }))).toBe(false);
  });

  it('is false for a non-ApiError', () => {
    expect(isEmailTakenError(new Error('network'))).toBe(false);
    expect(isEmailTakenError(null)).toBe(false);
  });
});
