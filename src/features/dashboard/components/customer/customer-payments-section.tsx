'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import type { CustomerPaymentItem, CustomerPaymentState } from '../../lib/customer-dashboard';
import { localizedServiceName } from '../../lib/project-format';
import { MoneyAmount } from '../money-amount';

import { CustomerSection } from './customer-section';

/** Soft-pill colour per payment state, reusing the project status-badge tokens. */
const STATE_PILL: Record<CustomerPaymentState, string> = {
  due: 'bg-status-progress-soft text-status-progress',
  upcoming: 'bg-muted text-card-foreground/60',
  paid: 'bg-status-done-bg text-status-done',
};

const MAX_ROWS = 4;

/**
 * "Payments & installments" (المدفوعات والأقساط) — the due / upcoming / paid phases of the
 * customer's in-progress projects (derived in {@link buildCustomerDashboard}). The "Pay now"
 * CTA on a due phase deep-links to the project detail, where the HyperPay phase-payment
 * widget already lives — the dashboard never duplicates the pay flow.
 */
export function CustomerPaymentsSection({ items }: { items: CustomerPaymentItem[] }) {
  const { t } = useTranslation();
  const rows = items.slice(0, MAX_ROWS);

  return (
    <CustomerSection
      title={t('dashboard.customer.home.payments.title')}
      viewAllHref={ROUTES.DASHBOARD_PAYMENTS}
      viewAllLabel={t('dashboard.customer.home.payments.viewAll')}
      isEmpty={rows.length === 0}
      emptyText={t('dashboard.customer.home.payments.empty')}
    >
      <ul className="flex w-full flex-col gap-3">
        {rows.map((item) => (
          <PaymentRow key={item.phaseId} item={item} />
        ))}
      </ul>
    </CustomerSection>
  );
}

function PaymentRow({ item }: { item: CustomerPaymentItem }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const name = item.title || localizedServiceName(item, locale) || t('dashboard.card.untitled');

  return (
    <li className="border-border flex w-full items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 flex-col items-end gap-1.5">
        <p className="text-card-foreground w-full truncate text-end text-sm font-medium">
          <bdi>{name}</bdi>
        </p>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATE_PILL[item.state]}`}
        >
          {t(`dashboard.customer.home.payments.state.${item.state}`)}
        </span>
      </div>
      <div className="order-first flex shrink-0 flex-col items-start gap-1">
        <span className="text-card-foreground text-sm font-semibold">
          <MoneyAmount value={item.amount} />
        </span>
        {item.state === 'due' ? (
          <Link
            href={ROUTES.DASHBOARD_PROJECT(String(item.projectId))}
            className="text-job-accent text-xs font-medium hover:underline"
          >
            {t('dashboard.customer.home.payments.payNow')}
          </Link>
        ) : null}
      </div>
    </li>
  );
}
