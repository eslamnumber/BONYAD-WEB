import type { Metadata } from 'next';

import { TransactionsView } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.transactions.title'), robots: { index: false, follow: false } };
}

/**
 * Transactions screen (`/dashboard/payments`) — the target of the profile hub's
 * "Transactions" row (iOS `TransactionsView`), available to every role. Thin RSC
 * shell; the tabs (payment history + refund requests) and the refund flow live in
 * the {@link TransactionsView} client island (reads the hydrated session via the
 * TanStack Query hooks). Private surface, so `noindex`.
 */
export default function PaymentsPage() {
  return <TransactionsView />;
}
