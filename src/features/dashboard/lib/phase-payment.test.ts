import { describe, expect, it } from 'vitest';

import { type ProjectPhase } from '../schemas/project-phase';

import {
  apiPaymentType,
  phasePaymentAmount,
  phaseRemaining,
  phasesRemainingAfter,
  totalOutstanding,
  validatePaymentAmount,
} from './phase-payment';

const phase = (over: Partial<ProjectPhase> = {}): ProjectPhase => ({ id: 1, ...over });

describe('phaseRemaining', () => {
  it('uses the backend remainingAmount when present', () => {
    expect(phaseRemaining(phase({ remainingAmount: 15000, moneySpent: 25000 }))).toBe(15000);
  });
  it('falls back to moneySpent − amountPaid', () => {
    expect(phaseRemaining(phase({ moneySpent: 25000, amountPaid: 10000 }))).toBe(15000);
  });
  it('clamps to ≥ 0 and defaults missing fields to 0', () => {
    expect(phaseRemaining(phase({ moneySpent: 100, amountPaid: 300 }))).toBe(0);
    expect(phaseRemaining(phase())).toBe(0);
  });
});

describe('phasePaymentAmount', () => {
  it('full → the whole remaining balance', () => {
    expect(phasePaymentAmount(phase({ remainingAmount: 15000 }), 'full', '')).toBe(15000);
  });
  it('partial → the parsed custom amount', () => {
    expect(phasePaymentAmount(phase({ remainingAmount: 15000 }), 'partial', '5000')).toBe(5000);
  });
  it('partial → 0 for blank / non-numeric input', () => {
    expect(phasePaymentAmount(phase({ remainingAmount: 15000 }), 'partial', '')).toBe(0);
    expect(phasePaymentAmount(phase({ remainingAmount: 15000 }), 'partial', 'abc')).toBe(0);
  });
});

describe('apiPaymentType', () => {
  it('FULL when the amount clears the balance, PARTIAL otherwise', () => {
    expect(apiPaymentType(15000, 15000)).toBe('FULL');
    expect(apiPaymentType(20000, 15000)).toBe('FULL');
    expect(apiPaymentType(5000, 15000)).toBe('PARTIAL');
  });
});

describe('validatePaymentAmount', () => {
  it('passes a valid full payment', () => {
    expect(validatePaymentAmount(15000, 15000, 'full')).toBeNull();
  });
  it('passes a valid partial payment', () => {
    expect(validatePaymentAmount(5000, 15000, 'partial')).toBeNull();
  });
  it('rejects non-positive / non-finite amounts', () => {
    expect(validatePaymentAmount(0, 15000, 'partial')).toBe('invalid');
    expect(validatePaymentAmount(NaN, 15000, 'partial')).toBe('invalid');
  });
  it('rejects an amount over the remaining balance', () => {
    expect(validatePaymentAmount(20000, 15000, 'partial')).toBe('exceeds');
  });
  it('rejects a partial equal to the full balance', () => {
    expect(validatePaymentAmount(15000, 15000, 'partial')).toBe('partialTooHigh');
  });
});

describe('phasesRemainingAfter / totalOutstanding', () => {
  const phases: ProjectPhase[] = [
    phase({ id: 1, phaseNumber: 1, remainingAmount: 25000 }),
    phase({ id: 2, phaseNumber: 2, remainingAmount: 50000 }),
    phase({ id: 3, phaseNumber: 3, remainingAmount: 0, paymentStatus: 'PAID' }),
  ];

  it('drops the current phase after a full payment and keeps the others', () => {
    const out = phasesRemainingAfter(phases, 1, 25000);
    expect(out.map((e) => e.phase.id)).toEqual([2]);
    expect(totalOutstanding(out)).toBe(50000);
  });

  it('keeps the current phase leftover after a partial payment', () => {
    const out = phasesRemainingAfter(phases, 1, 10000);
    expect(out.map((e) => [e.phase.id, e.outstanding])).toEqual([
      [1, 15000],
      [2, 50000],
    ]);
    expect(totalOutstanding(out)).toBe(65000);
  });

  it('drops phases that already owe nothing', () => {
    const out = phasesRemainingAfter(phases, 2, 50000);
    expect(out.map((e) => e.phase.id)).toEqual([1]);
  });
});
