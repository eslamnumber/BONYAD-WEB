'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useMyTransactions } from '../../api';
import { type PaymentTransaction, type TransactionStatusFilter } from '../../schemas/transaction';

import { TransactionCard } from './transaction-card';
import { TransactionFilters } from './transaction-filters';
import {
  LoadMoreButton,
  TransactionsPlaceholder,
  TransactionsSkeleton,
} from './transactions-states';

type Props = {
  locale: Locale;
  onRequestRefund: (transaction: PaymentTransaction) => void;
};

/** Transactions tab: status filter row + the paged, filterable transaction list. */
export function TransactionsTab({ locale, onRequestRefund }: Props) {
  const [status, setStatus] = useState<TransactionStatusFilter>('all');
  const query = useMyTransactions(status === 'all' ? undefined : status);
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex flex-col gap-5">
      <TransactionFilters value={status} onChange={setStatus} />
      <TransactionsBody
        query={query}
        items={items}
        locale={locale}
        onRequestRefund={onRequestRefund}
      />
    </div>
  );
}

function TransactionsBody({
  query,
  items,
  locale,
  onRequestRefund,
}: {
  query: ReturnType<typeof useMyTransactions>;
  items: PaymentTransaction[];
} & Props) {
  const { t } = useTranslation();
  const icon = <SaudiRiyalIcon className="h-6 w-auto" aria-hidden />;

  if (query.isPending) return <TransactionsSkeleton />;
  if (query.isError) {
    return (
      <TransactionsPlaceholder
        icon={icon}
        title={t('dashboard.transactions.error.title')}
        subtitle={t('dashboard.transactions.error.subtitle')}
        action={
          <Button type="button" variant="outline" onClick={() => query.refetch()}>
            {t('dashboard.transactions.error.retry')}
          </Button>
        }
      />
    );
  }
  if (items.length === 0) {
    return (
      <TransactionsPlaceholder
        icon={icon}
        title={t('dashboard.transactions.empty.title')}
        subtitle={t('dashboard.transactions.empty.subtitle')}
      />
    );
  }
  return (
    <TransactionsList
      query={query}
      items={items}
      locale={locale}
      onRequestRefund={onRequestRefund}
    />
  );
}

function TransactionsList({
  query,
  items,
  locale,
  onRequestRefund,
}: {
  query: ReturnType<typeof useMyTransactions>;
  items: PaymentTransaction[];
} & Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id}>
            <TransactionCard transaction={item} locale={locale} onRequestRefund={onRequestRefund} />
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
