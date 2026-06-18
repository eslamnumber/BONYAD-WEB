import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';
import { normalizePhoneForApi } from '@/lib/saudi-phone';

import { type InviteErrorCode } from '../lib/referral-format';
import { type InviteRequest, inviteRequestSchema } from '../schemas/invite';
import type { InviteResponseBody } from '../types/referral';

import { referralStatsQueryKey } from './get-referral-stats';
import { referralsQueryKey } from './get-referrals';
import { referralWalletQueryKey } from './get-wallet';

const KNOWN_CODES = ['RATE_LIMIT', 'ALREADY_USER', 'SELF_REFERRAL', 'INVALID_PHONE'] as const;

/**
 * A typed invite failure carrying the backend's structured `error_code`. The UI maps
 * {@link code} to a localized message via `inviteErrorMessageKey`. Mirrors the iOS
 * `ReferralError` mapping.
 */
export class InviteError extends Error {
  constructor(
    public readonly code: InviteErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'InviteError';
  }
}

/** Read a structured `error_code` off any payload shape (200-body or 4xx-body). */
function codeFrom(raw: unknown): InviteErrorCode {
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).error_code : null;
  return typeof value === 'string' && (KNOWN_CODES as readonly string[]).includes(value)
    ? (value as InviteErrorCode)
    : 'GENERIC';
}

export type InviteResult = { invitedPhone: string | null; smsSent: boolean | null };

/** Turn a 2xx invite body into a result, or throw the typed failure it forwards over 200. */
function toResult(data: InviteResponseBody): InviteResult {
  if (data.success === false) throw new InviteError(codeFrom(data), data.message ?? undefined);
  return { invitedPhone: data.invited_phone ?? null, smsSent: data.sms_sent ?? null };
}

/**
 * Send a refer-a-friend SMS invite. Mirrors the iOS call site
 * bonayd-ios/.../Utils/ReferralAPIService.swift:224 (`invite`) — POST
 * /users/me/referral/invite `{ phoneNumber }`. The body is re-validated + normalised
 * to the national `5XXXXXXXX` form (CLAUDE rule 1). The backend signals failure either
 * with `success: false` over HTTP 200 or a 4xx — both carry an `error_code`, which is
 * surfaced as a typed {@link InviteError} so the form can show the right message.
 */
export async function sendInvite(input: InviteRequest): Promise<InviteResult> {
  const { phoneNumber } = inviteRequestSchema.parse(input);
  const body = { phoneNumber: normalizePhoneForApi(phoneNumber) };
  try {
    const data = await apiClient.post<InviteResponseBody | null>(
      API_ENDPOINTS.USERS.REFERRAL_INVITE,
      { body },
    );
    return toResult(data ?? {});
  } catch (err) {
    if (err instanceof InviteError) throw err;
    if (err instanceof ApiError) throw new InviteError(codeFrom(err.body));
    throw err;
  }
}

export function useSendInvite() {
  const queryClient = useQueryClient();
  return useMutation<InviteResult, Error, InviteRequest>({
    mutationFn: sendInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referralStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: referralsQueryKey() });
      queryClient.invalidateQueries({ queryKey: referralWalletQueryKey() });
    },
  });
}
