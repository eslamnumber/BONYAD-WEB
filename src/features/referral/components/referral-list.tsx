'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { Locale } from '@/types/locale';

import { groupReferrals } from '../lib/referral-groups';
import type { ReferralList as ReferralListData } from '../types/referral';

import { ReferralInvitationRow, ReferralJoinedRow } from './referral-rows';

/** A titled group — coloured dot + label + count badge over its list of rows. */
function ReferralGroup({
  titleKey,
  count,
  dot,
  children,
}: {
  titleKey: string;
  count: number;
  dot: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
        <span className="text-muted-foreground text-xs font-semibold">{t(titleKey)}</span>
        <span
          className={`inline-flex min-w-5 justify-center rounded-full px-1.5 text-[11px] font-bold text-white ${dot}`}
        >
          {count}
        </span>
      </div>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

/**
 * The user's invitations, bucketed into joined (green) / pending sign-up (amber) /
 * expired (muted) groups — the same lifecycle split the iOS screen renders. Only
 * non-empty groups appear; the all-empty case is handled one level up by the screen
 * (it shows the empty state instead of this list).
 */
export function ReferralList({
  list,
  locale,
}: {
  list: ReferralListData | null | undefined;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const groups = groupReferrals(list);
  return (
    <section className="bg-card border-border flex flex-col gap-5 rounded-2xl border p-5 shadow-sm">
      <h2 className="text-foreground text-base font-semibold">{t('referral.list.title')}</h2>
      {groups.joined.length ? (
        <ReferralGroup
          titleKey="referral.list.joined"
          count={groups.joined.length}
          dot="bg-success"
        >
          {groups.joined.map((rec) => (
            <ReferralJoinedRow key={rec.id} record={rec} locale={locale} />
          ))}
        </ReferralGroup>
      ) : null}
      {groups.pending.length ? (
        <ReferralGroup
          titleKey="referral.list.pending"
          count={groups.pending.length}
          dot="bg-warning"
        >
          {groups.pending.map((inv) => (
            <ReferralInvitationRow key={inv.id} invitation={inv} />
          ))}
        </ReferralGroup>
      ) : null}
      {groups.expired.length ? (
        <ReferralGroup
          titleKey="referral.list.expired"
          count={groups.expired.length}
          dot="bg-muted-foreground"
        >
          {groups.expired.map((inv) => (
            <ReferralInvitationRow key={inv.id} invitation={inv} />
          ))}
        </ReferralGroup>
      ) : null}
    </section>
  );
}
