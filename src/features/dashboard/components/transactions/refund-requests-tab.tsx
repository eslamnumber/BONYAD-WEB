'use client';

import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useMyRefundRequests } from '../../api';

import { RefundRequestCard } from './refund-request-card';
import {
  LoadMoreButton,
  TransactionsPlaceholder,
  TransactionsSkeleton,
} from './transactions-states';

/** Refund Requests tab: the paged, read-only list of the user's refund requests. */
export function RefundRequestsTab({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const query = useMyRefundRequests();
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const icon = <RotateCcw className="size-6" aria-hidden />;

  if (query.isPending) return <TransactionsSkeleton />;
  if (query.isError) {
    return (
      <TransactionsPlaceholder
        icon={icon}
        title={t('dashboard.transactions.refunds.error.title')}
        subtitle={t('dashboard.transactions.refunds.error.subtitle')}
        action={
          <Button type="button" variant="outline" onClick={() => query.refetch()}>
            {t('dashboard.transactions.refunds.error.retry')}
          </Button>
        }
      />
    );
  }
  if (items.length === 0) {
    return (
      <TransactionsPlaceholder
        icon={icon}
        title={t('dashboard.transactions.refunds.empty.title')}
        subtitle={t('dashboard.transactions.refunds.empty.subtitle')}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {items.map((request) => (
          <li key={request.id}>
            <RefundRequestCard request={request} locale={locale} />
          </li>
        ))}
      </ul>
      {query.hasNextPage ? (
        <LoadMoreButton
          loading={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
          label={t('dashboard.transactions.loadMore')}
        />
      ) : null}
    </div>
  );
}
