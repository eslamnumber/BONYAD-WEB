import { type Locale, LOCALE_TAG } from '@/types/locale';

import type {
  ReferralRecord,
  ReferralStats,
  ReferralUser,
  ReferralWallet,
} from '../types/referral';

/** SAR amount as grouped digits (no fraction), localized — the glyph is rendered separately. */
export function formatSar(value: number | null | undefined, locale: Locale): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(LOCALE_TAG[locale], { maximumFractionDigits: 0 }).format(n);
}

/** A friend's phone from whichever key the backend shipped, trimmed. */
export function referralUserPhone(user: ReferralUser | null | undefined): string {
  return (user?.phone_number ?? user?.phone ?? '').trim();
}

/** A friend's display name, trimmed (empty when the backend hasn't joined one yet). */
export function referralUserName(user: ReferralUser | null | undefined): string {
  return (user?.name ?? '').trim();
}

/** Up-to-two-letter initials from a name (falling back to a phone), for the avatar chip. */
export function initialsFrom(source: string): string {
  const parts = source
    .split(' ')
    .map((p) => p.trim()[0])
    .filter(Boolean);
  return parts.slice(0, 2).join('').toUpperCase();
}

/** A converted referral has earned its reward; anything else is still "joined, waiting". */
export function isConverted(record: ReferralRecord): boolean {
  return (record.status ?? '').toUpperCase() === 'CONVERTED';
}

/** The SAR reward attached to a converted referral, or `null` when none applies. */
export function rewardAmount(record: ReferralRecord): number | null {
  const amount = record.reward_tier?.reward_amount;
  return typeof amount === 'number' && amount > 0 ? amount : null;
}

/** Hero balance: the live wallet, falling back to the stats mirror, then 0. */
export function resolveBalance(
  wallet: ReferralWallet | null | undefined,
  stats: ReferralStats | null | undefined,
): number {
  return wallet?.balance ?? stats?.wallet_balance ?? 0;
}

/** Everything a joined-referral row renders, derived once so the component stays flat. */
export type JoinedRowView = {
  title: string;
  name: string;
  phone: string;
  converted: boolean;
  statusKey: string;
  statusOptions?: Record<string, string>;
};

/** The localized status key + interpolation for a joined row (waiting / rewarded / signed-up). */
function joinedStatus(
  converted: boolean,
  reward: number | null,
  locale: Locale,
): Pick<JoinedRowView, 'statusKey' | 'statusOptions'> {
  if (!converted) return { statusKey: 'referral.list.waitingFirstProject' };
  if (reward) {
    return {
      statusKey: 'referral.list.earnedReward',
      statusOptions: { reward: formatSar(reward, locale) },
    };
  }
  return { statusKey: 'referral.list.status.signedUp' };
}

/** Flatten a referral record into the view model {@link ReferralJoinedRow} renders. */
export function describeJoinedRow(record: ReferralRecord, locale: Locale): JoinedRowView {
  const name = referralUserName(record.referred);
  const phone = referralUserPhone(record.referred) || (record.invitation?.invited_phone ?? '');
  const converted = isConverted(record);
  return {
    title: name || phone || '—',
    name,
    phone,
    converted,
    ...joinedStatus(converted, rewardAmount(record), locale),
  };
}

/** Normalized next-reward-tier progress for the hero meter, or `null` when no tier remains. */
export type TierProgress = {
  converted: number;
  target: number;
  remaining: number;
  reward: number;
  pct: number;
};

export function nextTierProgress(stats: ReferralStats | null | undefined): TierProgress | null {
  const target = stats?.next_tier_at ?? 0;
  const reward = stats?.next_tier_reward ?? 0;
  if (target <= 0 || reward <= 0) return null;
  const converted = Math.max(0, stats?.converted ?? 0);
  const remaining = Math.max(0, target - converted);
  const pct = Math.min(100, Math.round((Math.min(converted, target) / target) * 100));
  return { converted, target, remaining, reward, pct };
}

/** i18n key for an invitation's lifecycle status badge. */
export function invitationStatusKey(status: string | null | undefined): string {
  switch ((status ?? '').toUpperCase()) {
    case 'SIGNED_UP':
      return 'referral.list.status.signedUp';
    case 'EXPIRED':
      return 'referral.list.status.expired';
    case 'REVOKED':
      return 'referral.list.status.revoked';
    default:
      return 'referral.list.status.pending';
  }
}

/** The structured invite-failure codes the backend returns (iOS `ReferralError`). */
export type InviteErrorCode =
  | 'RATE_LIMIT'
  | 'ALREADY_USER'
  | 'SELF_REFERRAL'
  | 'INVALID_PHONE'
  | 'GENERIC';

/** i18n key for the localized invite-error message shown under the form. */
export function inviteErrorMessageKey(code: InviteErrorCode): string {
  switch (code) {
    case 'RATE_LIMIT':
      return 'referral.invite.errors.rateLimit';
    case 'ALREADY_USER':
      return 'referral.invite.errors.alreadyUser';
    case 'SELF_REFERRAL':
      return 'referral.invite.errors.selfReferral';
    case 'INVALID_PHONE':
      return 'referral.invite.errors.invalidPhone';
    default:
      return 'referral.invite.errors.generic';
  }
}
