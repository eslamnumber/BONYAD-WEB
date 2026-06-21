import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { type PaymentResult, type PaymentStatusBody } from '../schemas/payment';

/** HyperPay's success regex (the backend over-broadly accepts any `000*`, so the web
 *  re-derives precisely): live `000.000.*`, test `000.100.1*`, 3DS `000.[36]*`,
 *  manual-review `000.400.[12]0`. */
function isSuccessCode(code: string | undefined): boolean {
  return code ? /^(000\.000\.|000\.100\.1|000\.[36]|000\.400\.[12]0)/.test(code) : false;
}

/** `000.200.*` = checkout created / still pending — NOT a completed payment. Guards
 *  the backend's broad `code.startsWith("000")` classification, which would otherwise
 *  mark a freshly-created, unpaid checkout as paid. */
function isPendingCode(code: string | undefined): boolean {
  return code?.startsWith('000.200') ?? false;
}

/**
 * Verify a HyperPay checkout's final result. GET /payments/status/:checkoutId — the
 * backend pre-classifies the verdict in `paymentResult` (and finalizes the phase
 * server-side as a side effect). The web trusts `paymentResult` but treats a pending
 * `000.200.*` code as not-yet-final regardless (defense against the backend's broad
 * 000* success rule). Permissive response; called by the result modal / callback page.
 */
export async function getPaymentStatus(checkoutId: string): Promise<PaymentResult> {
  const path = `${API_ENDPOINTS.PAYMENT.STATUS}/${encodeURIComponent(checkoutId)}`;
  const data = await apiClient.get<PaymentStatusBody>(path);

  const code = data.code;
  const isPending = isPendingCode(code);
  const success = !isPending && (data.paymentResult === true || isSuccessCode(code));

  return {
    success,
    isPending,
    code,
    description: data.description,
    transactionId: data.transactionId,
    amount: data.amount,
    currency: data.currency,
    paymentBrand: data.paymentBrand,
  };
}
