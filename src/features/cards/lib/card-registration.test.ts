import { describe, expect, it } from 'vitest';

import { type CardCheckoutSession } from '../schemas/card';

import {
  buildCardReturnUrl,
  CARD_RETURN_PARAM,
  resolveCardRedirectTarget,
  resolveReturnCheckoutId,
} from './card-registration';

const hosted: CardCheckoutSession = {
  checkoutId: 'CHK_1',
  redirectUrl: 'https://eu-test.oppwa.com/v1/checkouts/CHK_1',
  environment: 'test',
  isMimic: false,
};

describe('buildCardReturnUrl', () => {
  it('points back at the cards page flagged as a registration return', () => {
    const url = buildCardReturnUrl('https://app.test');
    expect(url).toBe(`https://app.test/dashboard/settings/cards?${CARD_RETURN_PARAM}=return`);
  });
});

describe('resolveCardRedirectTarget', () => {
  it('redirects to the hosted page when a real preauth url is returned', () => {
    expect(resolveCardRedirectTarget(hosted, 'https://app.test/x?registration=return')).toBe(
      hosted.redirectUrl,
    );
  });

  it('appends the checkoutId to the return url in mimic mode (no hosted page)', () => {
    const mimic: CardCheckoutSession = { ...hosted, isMimic: true, redirectUrl: null };
    expect(resolveCardRedirectTarget(mimic, 'https://app.test/x?registration=return')).toBe(
      'https://app.test/x?registration=return&id=CHK_1',
    );
  });
});

describe('resolveReturnCheckoutId', () => {
  it('prefers the echoed ?id= param', () => {
    expect(resolveReturnCheckoutId('?id=CHK_42', 'stored')).toBe('CHK_42');
  });

  it('falls back to the stored checkoutId when only the return flag is present', () => {
    expect(resolveReturnCheckoutId(`?${CARD_RETURN_PARAM}=return`, 'CHK_STORED')).toBe(
      'CHK_STORED',
    );
  });

  it('returns null on a plain page visit (no params, no storage)', () => {
    expect(resolveReturnCheckoutId('', null)).toBeNull();
  });

  it('returns null when flagged a return but nothing was stored', () => {
    expect(resolveReturnCheckoutId(`?${CARD_RETURN_PARAM}=return`, null)).toBeNull();
  });
});
