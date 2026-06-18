'use client';

import { useTranslation } from 'react-i18next';

import { Button, Skeleton } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useMyFeedback } from '../api';

import { FeedbackCard } from './feedback-card';
import { FeedbackEmpty } from './feedback-empty';

/** Loading placeholder — three card-height skeletons. */
function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}

/** Error state with a retry — the list fetch failed. */
function ListError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border bg-card/50 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
      <p className="text-foreground text-sm font-medium">{t('feedback.list.errorTitle')}</p>
      <Button type="button" variant="outline" onClick={onRetry} className="h-10 rounded-lg px-4">
        {t('feedback.list.errorRetry')}
      </Button>
    </div>
  );
}

/** My-feedback list — pending / error / empty / success, newest first. */
export function FeedbackList({ locale, onCompose }: { locale: Locale; onCompose: () => void }) {
  const query = useMyFeedback();

  if (query.isPending) return <ListSkeleton />;
  if (query.isError) return <ListError onRetry={() => void query.refetch()} />;

  const items = query.data ?? [];
  if (items.length === 0) return <FeedbackEmpty onCompose={onCompose} />;

  return (
    <ul className="flex flex-col gap-3">
      {items.map((feedback) => (
        <li key={feedback.id}>
          <FeedbackCard feedback={feedback} locale={locale} />
        </li>
      ))}
    </ul>
  );
}
