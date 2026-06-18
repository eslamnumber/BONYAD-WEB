import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { type PaymentResult, type PaymentStatusBody } from '../schemas/payment';

/** HyperPay success codes: 000.000.000 live · 000.100.1xx test · 000.3xx 3DS final. */
function isSuccessCode(code: string | undefined): boolean {
  if (!code) return false;
  return code === '000.000.000' || code.startsWith('000.100.1') || code.startsWith('000.3');
}

/** HyperPay pending code: 000.200.xxx (transaction still processing). */
function isPendingCode(code: string | undefined): boolean {
  return code?.startsWith('000.200') ?? false;
}

/**
 * Final/pending classification. Trusts the backend `paymentResult` boolean when
 * present, otherwise falls back to the HyperPay result code.
 */
function classify(
  data: PaymentStatusBody,
  code: string | undefined,
): { success: boolean; isPending: boolean } {
  const success = data.paymentResult === true || isSuccessCode(code);
  const isPending = !success && (data.isPending === true || isPendingCode(code));
  return { success, isPending };
}

/**
 * Verify a HyperPay checkout's final result. Mirrors the RN call site
 * website-bonyad/src/services/HyperPayService.ts:211 — GET
 * /payments/status/:checkoutId (the checkoutId is appended to the STATUS path).
 * Permissive response; success trusts the backend `paymentResult` boolean, falling
 * back to the HyperPay result code. Called by the /payment/callback page.
 */
export async function getPaymentStatus(checkoutId: string): Promise<PaymentResult> {
  const path = `${API_ENDPOINTS.PAYMENT.STATUS}/${encodeURIComponent(checkoutId)}`;
  const data = await apiClient.get<PaymentStatusBody>(path);

  const result = data.result ?? {};
  const code = data.code ?? result.code;
  const { success, isPending } = classify(data, code);

  return {
    success,
    isPending,
    code,
    description: data.description ?? result.description,
    transactionId: data.transactionId ?? data.ndc,
    amount: data.amount ?? result.amount,
    currency: data.currency ?? result.currency,
    paymentBrand: data.paymentBrand ?? result.paymentBrand,
  };
}
