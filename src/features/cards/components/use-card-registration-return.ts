'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useCompleteCard } from '../api/complete-card';
import { localizedCardError } from '../lib/card-error';
import {
  CARD_RETURN_PARAM,
  clearPendingCheckout,
  PENDING_CARD_CHECKOUT_KEY,
  resolveReturnCheckoutId,
} from '../lib/card-registration';

export type CardFeedback = { tone: 'success' | 'error'; message: string };

function readStored(): string | null {
  try {
    return sessionStorage.getItem(PENDING_CARD_CHECKOUT_KEY);
  } catch {
    return null;
  }
}

/** Drop the HyperPay return params so a refresh can't re-run completion. */
function stripReturnParams(): void {
  try {
    const url = new URL(window.location.href);
    ['id', 'checkoutId', CARD_RETURN_PARAM].forEach((k) => url.searchParams.delete(k));
    window.history.replaceState(null, '', url.toString());
  } catch {
    /* history unavailable — harmless. */
  }
}

/**
 * Completes card registration when the cards page is reached as a HyperPay return
 * (`?registration=return` / `?id=`). Runs once on mount (guarded against React's
 * double-invoke), POSTs /user/cards/complete, then surfaces a success/error banner
 * and refreshes the list via the mutation's query invalidation. A plain visit to the
 * page is a no-op.
 */
export function useCardRegistrationReturn(locale: Locale) {
  const { t } = useTranslation();
  const complete = useCompleteCard();
  const [feedback, setFeedback] = useState<CardFeedback | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const checkoutId = resolveReturnCheckoutId(window.location.search, readStored());
    if (!checkoutId) return;

    // setState only fires inside the async callbacks below — never synchronously in
    // the effect body — and `isCompleting` is derived from the mutation's own state.
    stripReturnParams();
    complete
      .mutateAsync({ checkoutId })
      .then(() => setFeedback({ tone: 'success', message: t('cards.feedback.added') }))
      .catch((err: unknown) =>
        setFeedback({
          tone: 'error',
          message: localizedCardError(err, locale, t('cards.feedback.addFailed')),
        }),
      )
      .finally(() => clearPendingCheckout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isCompleting: complete.isPending, feedback, dismiss: () => setFeedback(null) };
}
