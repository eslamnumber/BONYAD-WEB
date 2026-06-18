'use client';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { SendIcon, StarIcon } from '@/components/icons';
import type { Locale } from '@/types/locale';

import { describeJoinedRow, invitationStatusKey } from '../lib/referral-format';
import type { ReferralInvitation, ReferralRecord } from '../types/referral';

/** A friend who joined — name/phone, joined-vs-rewarded status, and the reward earned. */
export function ReferralJoinedRow({ record, locale }: { record: ReferralRecord; locale: Locale }) {
  const { t } = useTranslation();
  const view = describeJoinedRow(record, locale);
  return (
    <li className="bg-muted/40 flex items-center gap-3 rounded-xl p-3">
      <Avatar name={view.title} className="size-9 text-xs" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-foreground truncate text-sm font-semibold" dir="auto">
          {view.title}
        </span>
        {view.name && view.phone ? (
          <span className="text-muted-foreground truncate text-xs" dir="ltr">
            {view.phone}
          </span>
        ) : null}
        <span
          className={view.converted ? 'text-success text-xs font-medium' : 'text-warning text-xs'}
        >
          {t(view.statusKey, view.statusOptions)}
        </span>
      </div>
      {view.converted ? <StarIcon className="text-success size-4 shrink-0" aria-hidden /> : null}
    </li>
  );
}

/** A still-open or closed SMS invitation — the phone and its lifecycle status. */
export function ReferralInvitationRow({ invitation }: { invitation: ReferralInvitation }) {
  const { t } = useTranslation();
  const status = (invitation.status ?? '').toUpperCase();
  const isExpired = status === 'EXPIRED' || status === 'REVOKED';
  const badge = isExpired ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary';

  return (
    <li className="bg-muted/40 flex items-center gap-3 rounded-xl p-3">
      <span
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full ${badge}`}
      >
        <SendIcon className="size-4" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-foreground truncate text-sm font-semibold" dir="ltr">
          {invitation.invited_phone ?? '—'}
        </span>
        <span className={`text-xs ${isExpired ? 'text-muted-foreground' : 'text-warning'}`}>
          {t(invitationStatusKey(invitation.status))}
        </span>
      </div>
    </li>
  );
}
