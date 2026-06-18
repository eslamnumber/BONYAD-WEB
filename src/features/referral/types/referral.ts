/**
 * Refer-a-friend response shapes — permissive TS types (CLAUDE rule 1: never
 * strict-parse a backend response). These mirror the canonical iOS models in
 * `bonayd-ios/bonyad-cr-2/App/Utils/ReferralAPIService.swift`, the single source of
 * truth for every referral payload.
 *
 * The backend ships snake_case keys; every field is optional by design so a partial
 * or evolving payload can never decode into a misleading error state.
 */

/** A friend referenced by an invitation or a materialized referral. */
export type ReferralUser = {
  id?: number;
  name?: string | null;
  /** The backend has shipped this under `phone_number`; `phone` is a legacy alias. */
  phone_number?: string | null;
  phone?: string | null;
};

/** GET /users/me/referrals/stats — the refer-a-friend funnel + reward progress. */
export type ReferralStats = {
  total_invited?: number | null;
  signed_up?: number | null;
  converted?: number | null;
  pending?: number | null;
  /** SAR credit earned so far (mirrors the wallet balance). */
  wallet_balance?: number | null;
  /** Converted-referral count that unlocks the next reward tier. */
  next_tier_at?: number | null;
  /** SAR reward granted at the next tier. */
  next_tier_reward?: number | null;
};

/** A still-open or closed SMS invitation (no signup yet, or expired/revoked). */
export type ReferralInvitation = {
  id: number;
  invited_phone?: string | null;
  /** "PENDING" | "SIGNED_UP" | "EXPIRED" | "REVOKED". */
  status?: string | null;
  sms_sent?: boolean | null;
  signed_up_user?: ReferralUser | null;
  created_at?: string | null;
  signed_up_at?: string | null;
  expires_at?: string | null;
};

/** The SAR reward tier attached to a converted referral. */
export type ReferralRewardTier = {
  id?: number | null;
  threshold?: number | null;
  reward_amount?: number | null;
};

/** A materialized referral — a friend who signed up (and maybe converted to a paid project). */
export type ReferralRecord = {
  id: number;
  referred?: ReferralUser | null;
  invitation?: { id?: number | null; invited_phone?: string | null } | null;
  /** "PENDING" | "CONVERTED" | "EXPIRED" | "REVOKED". */
  status?: string | null;
  reward_tier?: ReferralRewardTier | null;
  reward_applied_at?: string | null;
  created_at?: string | null;
  converted_at?: string | null;
};

/** GET /users/me/referrals — invitations + materialized referrals. */
export type ReferralList = {
  invitations?: ReferralInvitation[] | null;
  referrals?: ReferralRecord[] | null;
};

/** GET /users/me/wallet — the SAR reward balance. */
export type ReferralWallet = {
  user_id?: number | null;
  balance?: number | null;
  currency?: string | null;
};

/** POST /users/me/referral/invite — the invite acknowledgement. */
export type InviteResponseBody = {
  success?: boolean;
  invitation_id?: number | null;
  invited_phone?: string | null;
  sms_sent?: boolean | null;
  error_code?: string | null;
  message?: string | null;
};
