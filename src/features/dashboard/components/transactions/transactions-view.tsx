'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

import type { PaymentTransaction } from '../../schemas/transaction';

import { RefundRequestsTab } from './refund-requests-tab';
import { RequestRefundModal } from './request-refund-modal';
import { TransactionTabs, type TransactionTab } from './transaction-tabs';
import { TransactionsHeader } from './transactions-header';
import { TransactionsTab } from './transactions-tab';

/**
 * Signature ambient glow — one soft blue color-ellipse behind the header for on-brand
 * depth. Inert, behind content (`-z-10`), desktop-gated (never a source of horizontal
 * scroll on phones), dark-mode-safe (the token has a `.dark` pair); symmetric + centred,
 * so no mirror flip needed.
 */
function AmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden justify-center overflow-hidden lg:flex"
    >
      <div className="bg-deco-blob-blue-light mt-[-160px] h-[420px] w-[560px] rounded-full opacity-20 blur-[120px]" />
    </div>
  );
}

/** Back to the settings hub — mirrors the My-info screen's back link (a back arrow,
 *  so the chevron flips via `ltr:-scale-x-100`). */
function BackLink() {
  const { t } = useTranslation();
  return (
    <nav className="flex w-full items-center justify-end">
      <Link
        href={ROUTES.DASHBOARD_SETTINGS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        {t('dashboard.transactions.back')}
        <ChevronLeftIcon className="size-3 shrink-0 ltr:-scale-x-100" aria-hidden />
      </Link>
    </nav>
  );
}

/**
 * Transactions screen (`/dashboard/payments`) — the iOS `TransactionsView`, available
 * to every role. Two tabs: the paged, status-filterable payment history and the user's
 * refund requests; a card's "Request refund" opens the refund dialog. Client island —
 * the `(app)` layout supplies the sidebar; data comes from the TanStack Query hooks.
 */
export function TransactionsView() {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [tab, setTab] = useState<TransactionTab>('transactions');
  const [refundTarget, setRefundTarget] = useState<PaymentTransaction | null>(null);

  return (
    <div className="relative isolate mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:gap-8 lg:px-8">
      <AmbientGlow />
      <BackLink />
      <TransactionsHeader />
      <TransactionTabs active={tab} onChange={setTab} />
      {tab === 'transactions' ? (
        <TransactionsTab locale={locale} onRequestRefund={setRefundTarget} />
      ) : (
        <RefundRequestsTab locale={locale} />
      )}
      <RequestRefundModal
        transaction={refundTarget}
        locale={locale}
        onClose={() => setRefundTarget(null)}
      />
    </div>
  );
}
