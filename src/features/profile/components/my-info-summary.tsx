'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { FeatureVerifiedIcon } from '@/components/icons';

export type MyInfoSummaryData = {
  name?: string;
  profileImage?: string;
  roleLabel: string;
  isVerified: boolean;
  /** Already-resolved status text — the localised "Verified" or the raw backend status. */
  statusText: string;
  email?: string;
  phone?: string;
};

/**
 * One term/value pair. `flex-row-reverse` (direction-aware) anchors the label to
 * the inline-end — right in Arabic, left in English, matching the card's RTL-first
 * convention — while the value flows toward the inline-start. No `dir`: each cell
 * inherits the document direction and Unicode bidi renders the value correctly.
 */
function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-row-reverse items-center gap-4 px-5 py-3.5">
      <dt className="text-muted-foreground shrink-0 text-sm">{label}</dt>
      <dd className="text-foreground min-w-0 flex-1 text-start text-sm font-medium break-words">
        {children}
      </dd>
    </div>
  );
}

/** Email / phone value — bidi-rendered by the browser; aligned via the cell's logical class. */
function DataValue({ value }: { value?: string }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <span>{value}</span>;
}

/** Verified pill (or a neutral chip for any other backend status). */
function StatusChip({ verified, text }: { verified: boolean; text: string }) {
  if (verified) {
    return (
      <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
        <FeatureVerifiedIcon className="size-3.5" aria-hidden />
        {text}
      </span>
    );
  }
  return (
    <span className="bg-muted text-muted-foreground inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold">
      {text}
    </span>
  );
}

/**
 * Account card — a centred identity (avatar · name · verified seal · role) over a
 * typographic definition list of the account snapshot (status · email · phone). A
 * quiet blue glow behind the avatar gives it on-brand depth. Read-only; the
 * editable fields live behind the Manage cards.
 */
export function MyInfoSummary({ data }: { data: MyInfoSummaryData }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border-border relative isolate overflow-hidden rounded-2xl border shadow-sm">
      <div
        aria-hidden
        className="bg-deco-blob-blue-light pointer-events-none absolute inset-x-0 -top-14 -z-10 mx-auto size-44 rounded-full opacity-25 blur-[60px]"
      />
      <div className="flex flex-col items-center gap-3 px-5 pt-8 pb-6 text-center">
        <Avatar
          name={data.name}
          src={data.profileImage}
          className="ring-border size-20 text-2xl shadow-sm ring-1"
        />
        <div className="flex flex-col items-center gap-1">
          <span className="flex items-center gap-1.5">
            <span className="text-foreground text-lg font-semibold">
              {data.name ?? t('profile.myInfo.fallbackName')}
            </span>
            {data.isVerified ? (
              <FeatureVerifiedIcon className="text-success size-4 shrink-0" aria-hidden />
            ) : null}
          </span>
          <span className="text-muted-foreground text-sm">{data.roleLabel}</span>
        </div>
      </div>

      <dl className="divide-border border-border divide-y border-t">
        <DetailRow label={t('profile.myInfo.summary.status')}>
          <StatusChip verified={data.isVerified} text={data.statusText} />
        </DetailRow>
        <DetailRow label={t('profile.myInfo.summary.email')}>
          <DataValue value={data.email} />
        </DetailRow>
        <DetailRow label={t('profile.myInfo.summary.phone')}>
          <DataValue value={data.phone} />
        </DetailRow>
      </dl>
    </div>
  );
}
