'use client';

import { useTranslation } from 'react-i18next';

import { LockIcon, PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { usePrepareCard } from '../api/prepare-card';
import { localizedCardError } from '../lib/card-error';
import {
  buildCardReturnUrl,
  resolveCardRedirectTarget,
  storePendingCheckout,
} from '../lib/card-registration';

/**
 * "Add payment card" CTA. Opens a 1 SAR HyperPay preauth (`prepare`), stashes the
 * checkout id, then sends the browser to the hosted card-entry page — the same
 * redirect pattern the phase-payment flow uses. HyperPay returns to the cards page,
 * where {@link useCardRegistrationReturn} finishes registration. The 1 SAR note +
 * lock glyph reassure the shopper the charge is temporary.
 */
export function AddCardButton({
  locale,
  disabled,
  onError,
}: {
  locale: Locale;
  disabled?: boolean;
  onError: (message: string) => void;
}) {
  const { t } = useTranslation();
  const prepare = usePrepareCard();

  async function start() {
    try {
      const session = await prepare.mutateAsync();
      storePendingCheckout(session.checkoutId);
      const target = resolveCardRedirectTarget(session, buildCardReturnUrl(window.location.origin));
      window.location.assign(target);
    } catch (err) {
      onError(localizedCardError(err, locale, t('cards.feedback.prepareFailed')));
    }
  }

  const busy = prepare.isPending || disabled;

  return (
    <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end">
      <Button
        type="button"
        size="lg"
        onClick={start}
        disabled={busy}
        aria-busy={prepare.isPending}
        className="gap-2"
      >
        <PlusIcon className="size-5" aria-hidden />
        {prepare.isPending ? t('cards.add.preparing') : t('cards.add.button')}
      </Button>
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <LockIcon className="size-3.5 shrink-0" aria-hidden />
        {t('cards.add.secureNote')}
      </p>
    </div>
  );
}
