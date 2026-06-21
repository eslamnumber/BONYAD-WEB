import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PaymentWidgetView } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

import './payment-widget.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.payment.widget.title'), robots: { index: false, follow: false } };
}

/**
 * HyperPay COPYandPAY widget page (`/payment/checkout`) — standalone, outside the
 * `(app)` group (no dashboard sidebar). The phase pay flow navigates here with the
 * checkoutId + mode; the embedded {@link PaymentWidgetView} island mounts the card
 * widget then redirects back to the project page. Private surface, so `noindex`.
 */
export default function PaymentCheckoutPage() {
  return (
    <Suspense>
      <PaymentWidgetView />
    </Suspense>
  );
}
