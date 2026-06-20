'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DashboardPaymentsIcon, StarIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useDeleteCard } from '../api/delete-card';
import { useSetDefaultCard } from '../api/set-default-card';
import { brandLabel, expiryLabel, maskedNumber } from '../lib/card-display';
import { localizedCardError } from '../lib/card-error';
import { type PaymentCard } from '../schemas/card';

import { DeleteCardModal } from './delete-card-modal';
import { type CardFeedback } from './use-card-registration-return';

const PILL = 'rounded-md px-2 py-0.5 text-xs font-semibold';

type RowProps = { card: PaymentCard; locale: Locale; onFeedback: (feedback: CardFeedback) => void };

/** Default / pending-validation status pills (iOS `default` + `pending_validation`). */
function CardPills({ card }: { card: PaymentCard }) {
  const { t } = useTranslation();
  return (
    <>
      {card.isDefault ? (
        <span className={`${PILL} bg-success/15 text-success`}>{t('cards.row.default')}</span>
      ) : null}
      {!card.isValidated ? (
        <span className={`${PILL} bg-warning/15 text-warning-foreground`}>
          {t('cards.row.pending')}
        </span>
      ) : null}
    </>
  );
}

/** Brand chip + masked PAN + holder/expiry. The PAN stays LTR; the holder is dynamic. */
function CardSummary({ card }: { card: PaymentCard }) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
        <DashboardPaymentsIcon className="size-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-sm font-bold">{brandLabel(card)}</span>
          <CardPills card={card} />
        </div>
        <p dir="ltr" className="text-foreground mt-1 text-lg font-semibold tracking-[0.15em]">
          {maskedNumber(card)}
        </p>
        <p dir="auto" className="text-muted-foreground mt-0.5 text-start text-xs break-words">
          {card.cardHolder} · {expiryLabel(card)}
        </p>
      </div>
    </div>
  );
}

/** "Set as default" — shown only on non-default cards, with its own spinner label. */
function SetDefaultButton({
  pending,
  busy,
  onClick,
}: {
  pending: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={busy}
      aria-busy={pending}
      onClick={onClick}
      className="flex-1 gap-1.5"
    >
      <StarIcon className="size-4" aria-hidden />
      {pending ? t('cards.row.settingDefault') : t('cards.row.setDefault')}
    </Button>
  );
}

/** Set-default + delete mutations with their feedback wiring + confirm-modal state. */
function useCardActions(card: PaymentCard, locale: Locale, onFeedback: (f: CardFeedback) => void) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const setDefault = useSetDefaultCard();
  const del = useDeleteCard();

  const makeDefault = () =>
    setDefault.mutate(card.id, {
      onSuccess: () => onFeedback({ tone: 'success', message: t('cards.feedback.defaultSet') }),
      onError: (err) =>
        onFeedback({
          tone: 'error',
          message: localizedCardError(err, locale, t('cards.feedback.defaultFailed')),
        }),
    });

  const confirmDelete = () =>
    del.mutate(card.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        onFeedback({ tone: 'success', message: t('cards.feedback.deleted') });
      },
      onError: (err) =>
        onFeedback({
          tone: 'error',
          message: localizedCardError(err, locale, t('cards.feedback.deleteFailed')),
        }),
    });

  return {
    confirmOpen,
    setConfirmOpen,
    settingDefault: setDefault.isPending,
    deleting: del.isPending,
    busy: setDefault.isPending || del.isPending,
    makeDefault,
    confirmDelete,
  };
}

/** Set-default (hidden once default) + delete, with their mutations + confirm modal. */
function CardActions({ card, locale, onFeedback }: RowProps) {
  const { t } = useTranslation();
  const a = useCardActions(card, locale, onFeedback);

  return (
    <div className="mt-4 flex gap-2">
      {!card.isDefault ? (
        <SetDefaultButton pending={a.settingDefault} busy={a.busy} onClick={a.makeDefault} />
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={a.busy}
        onClick={() => a.setConfirmOpen(true)}
        className="text-destructive border-destructive/40 hover:bg-destructive/5 flex-1"
      >
        {t('cards.row.delete')}
      </Button>
      <DeleteCardModal
        open={a.confirmOpen}
        cardLabel={`${brandLabel(card)} ${maskedNumber(card)}`}
        isDeleting={a.deleting}
        onClose={() => a.setConfirmOpen(false)}
        onConfirm={a.confirmDelete}
      />
    </div>
  );
}

/**
 * One saved card: summary + actions. Mirrors the iOS `CardRow`. Mutations run inside
 * {@link CardActions} so each button owns its spinner; results bubble up via
 * {@link onFeedback} to the screen's shared banner, and the list refreshes through
 * the mutations' query invalidation.
 */
export function CardRow({ card, locale, onFeedback }: RowProps) {
  return (
    <li
      className={`bg-card rounded-2xl border p-4 shadow-sm ${card.isDefault ? 'border-success/40' : 'border-border'}`}
    >
      <CardSummary card={card} />
      <CardActions card={card} locale={locale} onFeedback={onFeedback} />
    </li>
  );
}
