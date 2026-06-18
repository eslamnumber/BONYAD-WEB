import type { Metadata } from 'next';

import { PaymentCallbackView } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('dashboard.payment.callback.title'),
    robots: { index: false, follow: false },
  };
}

/**
 * HyperPay return URL (`/payment/callback`). A standalone authenticated landing —
 * it sits outside the `(app)` group, so it has no dashboard sidebar, just the root
 * providers. The interactive verify-then-mark-paid flow (GET /payments/status →
 * POST /phases/:id/pay → success / failed) runs client-side in
 * {@link PaymentCallbackView}; the phase context arrives in the querystring.
 */
export default function PaymentCallbackPage() {
  return <PaymentCallbackView />;
}
