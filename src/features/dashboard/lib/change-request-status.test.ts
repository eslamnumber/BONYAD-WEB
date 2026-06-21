import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';

import {
  changeRequestStatusVariant,
  hasViewerAgreed,
  isActiveChangeRequestStatus,
  isAlreadyAgreedError,
  isBenignAgreeError,
  isNotTechnicianError,
  isOwnChangeRequest,
} from './change-request-status';

describe('changeRequestStatusVariant', () => {
  it.each([
    ['PENDING', 'pending'],
    ['RESPONDED', 'responded'],
    ['AGREED', 'agreed'],
    ['REJECTED', 'rejected'],
    ['COMPLETED', 'completed'],
  ])('maps %s → %s', (status, variant) => {
    expect(changeRequestStatusVariant(status)).toBe(variant);
  });

  it('falls back to pending for unknown / empty', () => {
    expect(changeRequestStatusVariant('SOMETHING_NEW')).toBe('pending');
    expect(changeRequestStatusVariant(undefined)).toBe('pending');
  });
});

describe('isActiveChangeRequestStatus', () => {
  it('is true only for PENDING / RESPONDED', () => {
    expect(isActiveChangeRequestStatus('PENDING')).toBe(true);
    expect(isActiveChangeRequestStatus('RESPONDED')).toBe(true);
    expect(isActiveChangeRequestStatus('AGREED')).toBe(false);
    expect(isActiveChangeRequestStatus('COMPLETED')).toBe(false);
  });
});

describe('hasViewerAgreed', () => {
  it('reads the technician flag for a technician, the user flag otherwise', () => {
    const cr = { userAgreed: true, technicianAgreed: false };
    expect(hasViewerAgreed(cr, true)).toBe(false);
    expect(hasViewerAgreed(cr, false)).toBe(true);
  });

  it('treats a set …AgreedAt timestamp as agreed even when the boolean is absent', () => {
    expect(hasViewerAgreed({ userAgreedAt: '2026-06-21T10:00:00Z' }, false)).toBe(true);
    expect(hasViewerAgreed({ technicianAgreedAt: '2026-06-21T10:00:00Z' }, true)).toBe(true);
    // the customer's timestamp must not mark the technician as agreed
    expect(hasViewerAgreed({ userAgreedAt: '2026-06-21T10:00:00Z' }, true)).toBe(false);
  });

  it('treats bothAgreed as agreed for either party', () => {
    expect(hasViewerAgreed({ bothAgreed: true }, true)).toBe(true);
    expect(hasViewerAgreed({ bothAgreed: true }, false)).toBe(true);
  });
});

describe('isOwnChangeRequest', () => {
  it('matches by requester id when the object form supplies one (id wins over name)', () => {
    expect(
      isOwnChangeRequest({ requestedBy: 'Someone Else', requestedById: 9 }, { id: 9, name: 'x' }),
    ).toBe(true);
    // same name but a different id → not the requester
    expect(isOwnChangeRequest({ requestedBy: 'x', requestedById: 9 }, { id: 8, name: 'x' })).toBe(
      false,
    );
  });

  it('falls back to a trimmed, case-insensitive name match (dev string form, no id)', () => {
    expect(
      isOwnChangeRequest(
        { requestedBy: 'ahmed farahat user' },
        { id: 1, name: '  Ahmed Farahat User ' },
      ),
    ).toBe(true);
    expect(
      isOwnChangeRequest({ requestedBy: 'ahmed farahat user' }, { id: 1, name: 'someone else' }),
    ).toBe(false);
  });

  it('returns false when the viewer or the requester identity is unknown', () => {
    expect(isOwnChangeRequest({ requestedBy: 'x' }, null)).toBe(false);
    expect(isOwnChangeRequest({ requestedBy: null }, { id: 1, name: 'x' })).toBe(false);
    expect(isOwnChangeRequest({ requestedBy: 'x' }, { id: 1 })).toBe(false);
  });
});

describe('isAlreadyAgreedError', () => {
  it('detects the plain { error } 400 the backend returns', () => {
    const err = new ApiError(400, { error: 'You have already agreed to this change request' });
    expect(isAlreadyAgreedError(err)).toBe(true);
  });

  it('also detects it from a standard messageEn body', () => {
    expect(isAlreadyAgreedError(new ApiError(400, { messageEn: 'You have already agreed.' }))).toBe(
      true,
    );
  });

  it('is false for other errors and non-ApiError values', () => {
    expect(
      isAlreadyAgreedError(
        new ApiError(400, { error: 'You cannot reject your own change request' }),
      ),
    ).toBe(false);
    expect(isAlreadyAgreedError(new Error('network'))).toBe(false);
    expect(isAlreadyAgreedError(null)).toBe(false);
  });
});

describe('isNotTechnicianError', () => {
  it('detects the spurious bothAgreed { error: "User is not a technician" } 400', () => {
    expect(isNotTechnicianError(new ApiError(400, { error: 'User is not a technician' }))).toBe(
      true,
    );
  });

  it('is false for other errors and non-ApiError values', () => {
    expect(isNotTechnicianError(new ApiError(400, { error: 'You have already agreed' }))).toBe(
      false,
    );
    expect(isNotTechnicianError(new Error('network'))).toBe(false);
    expect(isNotTechnicianError(null)).toBe(false);
  });
});

describe('isBenignAgreeError', () => {
  it('covers both already-agreed and not-a-technician', () => {
    expect(
      isBenignAgreeError(
        new ApiError(400, { error: 'You have already agreed to this change request' }),
      ),
    ).toBe(true);
    expect(isBenignAgreeError(new ApiError(400, { error: 'User is not a technician' }))).toBe(true);
  });

  it('is false for a genuine failure (e.g. rejecting your own request)', () => {
    expect(
      isBenignAgreeError(new ApiError(400, { error: 'You cannot reject your own change request' })),
    ).toBe(false);
  });
});
