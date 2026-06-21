import { describe, expect, it } from 'vitest';

import type { ProjectDetail } from '../schemas/project';
import type { ProjectPhase } from '../schemas/project-phase';

import {
  budgetSummary,
  paidSoFar,
  paymentState,
  phasePaymentAction,
  phaseProgress,
  progressPercent,
} from './project-finance';

const phase = (over: Partial<ProjectPhase>): ProjectPhase => ({ id: 1, ...over });

describe('paymentState', () => {
  it('maps backend statuses onto the three pills (permissive fallback)', () => {
    expect(paymentState('PAID')).toBe('paid');
    expect(paymentState('COMPLETED')).toBe('paid');
    expect(paymentState('REQUESTED_PAYMENT')).toBe('awaiting');
    expect(paymentState('PARTIALLY_PAID')).toBe('awaiting');
    expect(paymentState('PENDING')).toBe('upcoming');
    expect(paymentState(undefined)).toBe('upcoming');
    expect(paymentState('SOME_NEW_STATUS')).toBe('upcoming');
  });

  it('is case-insensitive', () => {
    expect(paymentState('paid')).toBe('paid');
  });
});

describe('paidSoFar', () => {
  it('sums moneySpent across settled phases only', () => {
    const phases = [
      phase({ id: 1, paymentStatus: 'PAID', moneySpent: 20000 }),
      phase({ id: 2, paymentStatus: 'REQUESTED_PAYMENT', moneySpent: 25000 }),
      phase({ id: 3, paymentStatus: 'PENDING', moneySpent: 15000 }),
      phase({ id: 4, paymentStatus: 'COMPLETED', moneySpent: 10000 }),
    ];
    expect(paidSoFar(phases)).toBe(30000);
  });

  it('treats a missing amount as 0', () => {
    expect(paidSoFar([phase({ id: 1, paymentStatus: 'PAID' })])).toBe(0);
  });
});

describe('budgetSummary', () => {
  it('computes total / paid / remaining / count', () => {
    const project = { id: 1, budget: 250000 } as ProjectDetail;
    const phases = [
      phase({ id: 1, paymentStatus: 'PAID', moneySpent: 40000 }),
      phase({ id: 2, paymentStatus: 'PENDING', moneySpent: 60000 }),
    ];
    expect(budgetSummary(project, phases)).toEqual({
      total: 250000,
      paid: 40000,
      remaining: 210000,
      phaseCount: 2,
    });
  });

  it('nulls totals without a budget and clamps remaining at 0', () => {
    expect(budgetSummary({ id: 1 } as ProjectDetail, [])).toEqual({
      total: null,
      paid: 0,
      remaining: null,
      phaseCount: 0,
    });
    const over = budgetSummary({ id: 1, budget: 100 } as ProjectDetail, [
      phase({ id: 1, paymentStatus: 'PAID', moneySpent: 500 }),
    ]);
    expect(over.remaining).toBe(0);
  });
});

describe('progressPercent', () => {
  it('rounds the paid-phase share (RN formula)', () => {
    const phases = [
      phase({ id: 1, paymentStatus: 'PAID' }),
      phase({ id: 2, paymentStatus: 'PENDING' }),
      phase({ id: 3, paymentStatus: 'PENDING' }),
    ];
    expect(progressPercent(phases)).toBe(33);
  });

  it('is 0 with no phases', () => {
    expect(progressPercent([])).toBe(0);
  });
});

describe('phaseProgress', () => {
  it('marks completed phases, the first incomplete as active, the rest upcoming', () => {
    const phases = [
      phase({ id: 1, completed: true }),
      phase({ id: 2, completed: false }),
      phase({ id: 3, completed: false }),
    ];
    expect(phaseProgress(phases)).toEqual(['completed', 'active', 'upcoming']);
  });

  it('leaves no active phase when all are completed', () => {
    expect(phaseProgress([phase({ id: 1, completed: true })])).toEqual(['completed']);
  });
});

describe('phasePaymentAction', () => {
  it('offers "request" only when the phase is approved and PENDING', () => {
    expect(phasePaymentAction(phase({ approved: true, paymentStatus: 'PENDING' }))).toBe('request');
    expect(phasePaymentAction(phase({ approved: false, paymentStatus: 'PENDING' }))).toBe('none');
    expect(phasePaymentAction(phase({ paymentStatus: 'PENDING' }))).toBe('none');
  });

  it('reports "requested" once payment has been requested (regardless of approval)', () => {
    expect(phasePaymentAction(phase({ paymentStatus: 'REQUESTED_PAYMENT' }))).toBe('requested');
    expect(phasePaymentAction(phase({ approved: true, paymentStatus: 'requested_payment' }))).toBe(
      'requested',
    );
  });

  it('returns "none" for paid / partially-paid phases', () => {
    expect(phasePaymentAction(phase({ approved: true, paymentStatus: 'PAID' }))).toBe('none');
    expect(phasePaymentAction(phase({ approved: true, paymentStatus: 'PARTIALLY_PAID' }))).toBe(
      'none',
    );
  });
});
