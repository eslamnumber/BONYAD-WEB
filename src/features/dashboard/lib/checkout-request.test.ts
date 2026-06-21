import { describe, expect, it } from 'vitest';

import { type ProjectPhase } from '../schemas/project-phase';

import { buildCheckoutRequest, buildShopperResultUrl } from './checkout-request';

const phase: ProjectPhase = { id: 12, phaseNumber: 1, remainingAmount: 25000 };

describe('buildShopperResultUrl', () => {
  it('returns the project page with the phase context the widget echoes back', () => {
    const url = buildShopperResultUrl({
      origin: 'https://app.test',
      projectId: 5,
      phaseId: 12,
      paymentType: 'PARTIAL',
      amount: 5000,
    });
    const parsed = new URL(url);
    expect(parsed.pathname).toBe('/dashboard/projects/5');
    expect(parsed.searchParams.get('type')).toBe('phase');
    expect(parsed.searchParams.get('phaseId')).toBe('12');
    expect(parsed.searchParams.get('paymentType')).toBe('PARTIAL');
    expect(parsed.searchParams.get('amount')).toBe('5000');
  });

  it('builds a relative action when origin is empty', () => {
    const url = buildShopperResultUrl({
      origin: '',
      projectId: 5,
      phaseId: 1,
      paymentType: 'FULL',
      amount: 100,
    });
    expect(url.startsWith('/dashboard/projects/5?')).toBe(true);
  });
});

describe('buildCheckoutRequest', () => {
  it('builds a valid request from the signed-in user (name split, defaults)', () => {
    const req = buildCheckoutRequest({
      phase,
      selection: { amount: 25000, paymentType: 'FULL' },
      user: { email: 'sara@example.com', name: 'Sara Al Otaibi' },
      shopperResultUrl: 'https://app.test/dashboard/projects/5',
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

  it('reuses givenName as surname for a single-word name (backend @NotBlank)', () => {
    const req = buildCheckoutRequest({
      phase,
      selection: { amount: 1000, paymentType: 'PARTIAL' },
      user: { email: 'mona@example.com', name: 'Mona' },
      shopperResultUrl: 'x',
      now: 1,
    });
    expect(req.customer.givenName).toBe('Mona');
    expect(req.customer.surname).toBe('Mona');
  });

  it('falls back to a no-reply email + "User" when the user is absent', () => {
    const req = buildCheckoutRequest({
      phase,
      selection: { amount: 1000, paymentType: 'PARTIAL' },
      user: null,
      shopperResultUrl: 'x',
      now: 1,
    });
    expect(req.customer.givenName).toBe('User');
    expect(req.customer.surname).toBe('User');
    expect(req.customer.email).toBe('noreply@bonyad-hub.com');
  });
});
