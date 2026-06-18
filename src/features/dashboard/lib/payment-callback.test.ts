import { describe, expect, it } from 'vitest';

import { resolvePaymentContext } from './payment-callback';

const NOW = 1_700_000_000_000;

describe('resolvePaymentContext', () => {
  it('reads the phase context from the shopperResultUrl querystring', () => {
    const ctx = resolvePaymentContext(
      '?type=phase&phaseId=12&paymentType=PARTIAL&amount=5000&id=CHK_1',
      null,
      NOW,
    );
    expect(ctx).toEqual({
      checkoutId: 'CHK_1',
      phaseId: 12,
      paymentType: 'PARTIAL',
      amount: 5000,
      type: 'phase',
    });
  });

  it('extracts the checkoutId from a resourcePath when no id param is present', () => {
    const ctx = resolvePaymentContext(
      '?resourcePath=/v1/checkouts/CHK_9/payment&phaseId=3',
      null,
      NOW,
    );
    expect(ctx.checkoutId).toBe('CHK_9');
    expect(ctx.phaseId).toBe(3);
  });

  it('falls back to sessionStorage when the URL lacks the context', () => {
    const stored = JSON.stringify({
      checkoutId: 'CHK_S',
      phaseId: 7,
      amount: 9000,
      paymentType: 'FULL',
      type: 'phase',
      timestamp: NOW - 1000,
    });
    const ctx = resolvePaymentContext('?type=phase', stored, NOW);
    expect(ctx.checkoutId).toBe('CHK_S');
    expect(ctx.phaseId).toBe(7);
    expect(ctx.amount).toBe(9000);
    expect(ctx.paymentType).toBe('FULL');
  });

  it('ignores a stale (>30 min) sessionStorage record', () => {
    const stored = JSON.stringify({ checkoutId: 'CHK_OLD', timestamp: NOW - 31 * 60 * 1000 });
    const ctx = resolvePaymentContext('?type=phase', stored, NOW);
    expect(ctx.checkoutId).toBeNull();
  });

  it('defaults paymentType to FULL and type to phase, with null ids when nothing is present', () => {
    const ctx = resolvePaymentContext('', null, NOW);
    expect(ctx).toEqual({
      checkoutId: null,
      phaseId: null,
      paymentType: 'FULL',
      amount: null,
      type: 'phase',
    });
  });
});
