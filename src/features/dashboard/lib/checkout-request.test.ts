import { describe, expect, it } from 'vitest';

import { type CheckoutSession } from '../schemas/payment';
import { type ProjectPhase } from '../schemas/project-phase';

import {
  buildCheckoutRequest,
  buildShopperResultUrl,
  resolveRedirectTarget,
} from './checkout-request';

const phase: ProjectPhase = { id: 12, phaseNumber: 1, remainingAmount: 25000 };

describe('buildShopperResultUrl', () => {
  it('encodes the phase context the callback reads back', () => {
    const url = buildShopperResultUrl('https://app.test', 12, 'PARTIAL', 5000);
    const parsed = new URL(url);
    expect(parsed.pathname).toBe('/payment/callback');
    expect(parsed.searchParams.get('type')).toBe('phase');
    expect(parsed.searchParams.get('phaseId')).toBe('12');
    expect(parsed.searchParams.get('paymentType')).toBe('PARTIAL');
    expect(parsed.searchParams.get('amount')).toBe('5000');
  });
});

describe('buildCheckoutRequest', () => {
  it('builds a valid request from the signed-in user (name split, defaults)', () => {
    const req = buildCheckoutRequest({
      phase,
      selection: { amount: 25000, paymentType: 'FULL' },
      user: { email: 'sara@example.com', name: 'Sara Al Otaibi' },
      shopperResultUrl: 'https://app.test/payment/callback?type=phase',
      now: 1700000000000,
    });
    expect(req.phaseId).toBe(12);
    expect(req.amount).toBe(25000);
    expect(req.paymentType).toBe('DB');
    expect(req.paymentBrand).toBe('MADA');
    expect(req.merchantTransactionId).toBe('PHASE-12-FULL-1700000000000');
    expect(req.customer).toEqual({
      email: 'sara@example.com',
      givenName: 'Sara',
      surname: 'Al Otaibi',
    });
    expect(req.billing.country).toBe('SA');
  });

  it('falls back to givenName "User" and empty email when the user is absent', () => {
    const req = buildCheckoutRequest({
      phase,
      selection: { amount: 1000, paymentType: 'PARTIAL' },
      user: null,
      shopperResultUrl: 'https://app.test/payment/callback',
      now: 1,
    });
    expect(req.customer.givenName).toBe('User');
    expect(req.customer.surname).toBe('');
    expect(req.customer.email).toBe('');
  });
});

describe('resolveRedirectTarget', () => {
  const base = (over: Partial<CheckoutSession>): CheckoutSession => ({
    checkoutId: 'CHK_1',
    redirectUrl: null,
    environment: null,
    isMimic: false,
    ...over,
  });

  it('uses the gateway redirectUrl for a real charge', () => {
    const target = resolveRedirectTarget(
      base({ redirectUrl: 'https://eu-test.oppwa.com/v1/checkouts/CHK_1' }),
      'https://app.test/payment/callback?type=phase',
    );
    expect(target).toBe('https://eu-test.oppwa.com/v1/checkouts/CHK_1');
  });

  it('routes mimic mode straight to the callback with the checkoutId', () => {
    const target = resolveRedirectTarget(
      base({ checkoutId: 'MIMIC_9', isMimic: true }),
      'https://app.test/payment/callback?type=phase',
    );
    expect(target).toBe('https://app.test/payment/callback?type=phase&id=MIMIC_9');
  });

  it('falls back to the callback when a real charge returns no redirect URL', () => {
    const target = resolveRedirectTarget(
      base({ checkoutId: 'CHK_2', redirectUrl: null }),
      'https://app.test/payment/callback?type=phase',
    );
    expect(target).toBe('https://app.test/payment/callback?type=phase&id=CHK_2');
  });
});
