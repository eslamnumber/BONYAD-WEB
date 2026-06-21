import { describe, expect, it } from 'vitest';

import {
  normalizeChangeRequest,
  normalizePerson,
  normalizePhaseChanges,
  unwrapChangeRequests,
} from './change-request-normalize';

describe('normalizePerson', () => {
  it('passes a plain string through (the shape dev returned)', () => {
    expect(normalizePerson('ahmed farahat user')).toBe('ahmed farahat user');
  });

  it('extracts .name from an object form', () => {
    expect(normalizePerson({ id: 7, name: 'Sara' })).toBe('Sara');
  });

  it('returns null for null / missing / nameless', () => {
    expect(normalizePerson(null)).toBeNull();
    expect(normalizePerson(undefined)).toBeNull();
    expect(normalizePerson({ id: 7 })).toBeNull();
  });
});

describe('normalizePhaseChanges', () => {
  it('returns an array unchanged', () => {
    const arr = [{ actionType: 'CREATE', moneySpent: 300 }];
    expect(normalizePhaseChanges(arr)).toEqual(arr);
  });

  it('parses a JSON-encoded string form', () => {
    const json = JSON.stringify([{ actionType: 'DELETE', phaseId: 274 }]);
    expect(normalizePhaseChanges(json)).toEqual([{ actionType: 'DELETE', phaseId: 274 }]);
  });

  it('collapses unparseable / non-array / empty to []', () => {
    expect(normalizePhaseChanges('not json')).toEqual([]);
    expect(normalizePhaseChanges('{"a":1}')).toEqual([]);
    expect(normalizePhaseChanges(null)).toEqual([]);
  });
});

describe('normalizeChangeRequest', () => {
  it('normalises person + phaseChanges while keeping other fields', () => {
    const cr = normalizeChangeRequest({
      id: 13,
      status: 'COMPLETED',
      requestedBy: { id: 9, name: 'ahmed' },
      respondedBy: null,
      newBudget: 300,
      phaseChanges: JSON.stringify([{ actionType: 'CREATE', moneySpent: 300 }]),
    });
    expect(cr.id).toBe(13);
    expect(cr.status).toBe('COMPLETED');
    expect(cr.requestedBy).toBe('ahmed');
    expect(cr.respondedBy).toBeNull();
    expect(cr.newBudget).toBe(300);
    expect(cr.phaseChanges).toEqual([{ actionType: 'CREATE', moneySpent: 300 }]);
  });
});

describe('unwrapChangeRequests', () => {
  it('reads a bare array (the dev primary shape) and normalises each row', () => {
    const out = unwrapChangeRequests([{ id: 1, requestedBy: { name: 'A' } }], 'activeNegotiations');
    expect(out).toHaveLength(1);
    expect(out[0]?.requestedBy).toBe('A');
  });

  it('reads a named envelope key (iOS fallback)', () => {
    const out = unwrapChangeRequests({ activeNegotiations: [{ id: 2 }] }, 'activeNegotiations');
    expect(out.map((c) => c.id)).toEqual([2]);
  });

  it('returns [] for an unknown shape', () => {
    expect(unwrapChangeRequests({ nope: true }, 'thread')).toEqual([]);
    expect(unwrapChangeRequests(null, 'thread')).toEqual([]);
  });
});
