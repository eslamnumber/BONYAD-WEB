'use client';

import { useTranslation } from 'react-i18next';

import { DashboardPaymentsIcon } from '@/components/icons';
import { Button, Skeleton } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { type PaymentCard } from '../schemas/card';

import { CardRow } from './card-row';
import { type CardFeedback } from './use-card-registration-return';

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

function ListSkeleton() {
  return (
    <div className={GRID} aria-hidden>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-[150px] w-full rounded-2xl" />
      ))}
    </div>
  );
}

/** Centred glyph + headline + sub-copy, shared by the empty and error states. */
function CardPlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
        <DashboardPaymentsIcon className="size-7" aria-hidden />
      </span>
      <p className="text-foreground text-base font-medium">{title}</p>
      <p dir="auto" className="text-muted-foreground max-w-xs text-sm">
        {subtitle}
      </p>
    </div>
  );
}

type Props = {
  cards: PaymentCard[];
  isPending: boolean;
  isError: boolean;
  isTechnician: boolean;
  locale: Locale;
  onRetry: () => void;
  onFeedback: (feedback: CardFeedback) => void;
};

/**
 * The saved-cards region: loading skeletons → error (with retry) → empty
 * (role-aware) → the card list. Every branch is rendered (CLAUDE rule 23) — no
 * silent blank state.
 */
export function CardList({
  cards,
  isPending,
  isError,
  isTechnician,
  locale,
  onRetry,
  onFeedback,
}: Props) {
  const { t } = useTranslation();

  if (isPending) return <ListSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <CardPlaceholder title={t('cards.error.title')} subtitle={t('cards.error.subtitle')} />
        <Button type="button" variant="outline" onClick={onRetry}>
          {t('cards.error.retry')}
        </Button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <CardPlaceholder
        title={t('cards.empty.title')}
        subtitle={isTechnician ? t('cards.empty.technician') : t('cards.empty.user')}
      />
    );
  }

  return (
    <ul className={GRID}>
      {cards.map((card) => (
        <CardRow key={card.id} card={card} locale={locale} onFeedback={onFeedback} />
      ))}
    </ul>
  );
}
