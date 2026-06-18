'use client';

import { useTranslation } from 'react-i18next';

import { TrustSupportIcon } from '@/components/icons';
import { Button, Skeleton } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { type SupportRequest } from '../schemas/support';

import { RequestCard } from './request-card';

type Props = {
  requests: SupportRequest[];
  isPending: boolean;
  isError: boolean;
  locale: Locale;
  onRetry: () => void;
  onOpen: (id: number) => void;
};

/** Resolved list with the four data-classification states (pending / error / empty / success). */
export function RequestList({ requests, isPending, isError, locale, onRetry, onOpen }: Props) {
  if (isPending) return <ListSkeleton />;
  if (isError) return <ListError onRetry={onRetry} />;
  if (requests.length === 0) return <ListEmpty />;
  return (
    <ul className="flex flex-col gap-3">
      {requests.map((request) => (
        <li key={request.id}>
          <RequestCard request={request} locale={locale} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
      ))}
    </div>
  );
}

function ListError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border p-8 text-center">
      <p className="text-foreground text-sm font-medium">{t('support.list.errorTitle')}</p>
      <Button type="button" variant="outline" onClick={onRetry} className="h-11 rounded-lg px-5">
        {t('support.list.errorRetry')}
      </Button>
    </div>
  );
}

function ListEmpty() {
  const { t } = useTranslation();
  return (
    <div className="border-border bg-card flex flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center">
      <TrustSupportIcon className="text-primary/60 size-10" aria-hidden />
      <p className="text-foreground text-sm font-medium">{t('support.list.emptyTitle')}</p>
      <p className="text-muted-foreground max-w-xs text-sm">{t('support.list.emptyBody')}</p>
    </div>
  );
}
