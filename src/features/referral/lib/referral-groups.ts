import type { ReferralInvitation, ReferralList, ReferralRecord } from '../types/referral';

export type ReferralGroups = {
  /** Friends who joined (and possibly converted) — materialized + synthesized rows. */
  joined: ReferralRecord[];
  /** Open SMS invitations still waiting for the friend to sign up. */
  pending: ReferralInvitation[];
  /** Invitations that expired or were revoked before signup. */
  expired: ReferralInvitation[];
};

/**
 * Bucket the referral list into the three lifecycle groups the UI renders. Mirrors
 * the iOS `ReferralView` derivation: the "joined" group is the materialized
 * referrals PLUS any `SIGNED_UP` invitation whose friend doesn't yet have a referral
 * row — synthesized as a `PENDING` record (negative id) so a freshly-joined friend
 * shows up immediately in the brief window before the referral is created.
 */
export function groupReferrals(list: ReferralList | null | undefined): ReferralGroups {
  const referrals = list?.referrals ?? [];
  const invitations = list?.invitations ?? [];

  const referredIds = new Set(
    referrals.map((r) => r.referred?.id).filter((id): id is number => typeof id === 'number'),
  );

  const synthesized: ReferralRecord[] = invitations.flatMap((inv) => {
    const user = inv.signed_up_user;
    if ((inv.status ?? '').toUpperCase() !== 'SIGNED_UP' || !user?.id || referredIds.has(user.id)) {
      return [];
    }
    return [
      {
        id: -inv.id,
        referred: user,
        invitation: { id: inv.id, invited_phone: inv.invited_phone },
        status: 'PENDING',
        created_at: inv.signed_up_at ?? inv.created_at,
      },
    ];
  });

  return {
    joined: [...referrals, ...synthesized],
    pending: invitations.filter((inv) => (inv.status ?? '').toUpperCase() === 'PENDING'),
    expired: invitations.filter((inv) =>
      ['EXPIRED', 'REVOKED'].includes((inv.status ?? '').toUpperCase()),
    ),
  };
}

/** Whether the list has any invitation or referral — drives the list-vs-empty-state choice. */
export function hasReferralActivity(list: ReferralList | null | undefined): boolean {
  return Boolean(list?.referrals?.length || list?.invitations?.length);
}
