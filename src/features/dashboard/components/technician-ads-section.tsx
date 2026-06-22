'use client';

import { useTranslation } from 'react-i18next';

import { useMyAds } from '../api';
import type { Ad, AdStatus } from '../schemas/ad';

/** Soft-pill colour + label key per ad status, reusing the project status-badge tokens. */
const STATUS_BADGE: Record<string, { className: string; key: string }> = {
  ACTIVE: { className: 'bg-status-approved-soft text-status-approved', key: 'active' },
  PENDING_APPROVAL: {
    className: 'bg-status-progress-soft text-status-progress',
    key: 'pendingApproval',
  },
  PAUSED: { className: 'bg-muted text-card-foreground/60', key: 'paused' },
  REJECTED: { className: 'bg-status-rejected-soft text-status-rejected', key: 'rejected' },
  EXPIRED: { className: 'bg-muted text-card-foreground/60', key: 'expired' },
};

/**
 * "إعلاناتي" panel on the SP dashboard — the technician's own ads from GET /ads/mine.
 * RTL-first like every dashboard section (content anchors to the inline-end). A
 * read-only performance view for now (impressions / clicks / CTR + moderation
 * status); create / edit / pause / delete land as a follow-up mutation slice.
 */
export function TechnicianAdsSection() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useMyAds();
  const ads = data ?? [];

  return (
    <section className="bg-card border-border flex w-full flex-col items-end gap-5 rounded-2xl border p-5 shadow-sm">
      <h2 className="text-card-foreground w-full text-end text-lg font-semibold">
        {t('dashboard.home.ads.title')}
      </h2>
      <AdsBody isPending={isPending} isError={isError} ads={ads} />
    </section>
  );
}

function AdsBody({ isPending, isError, ads }: { isPending: boolean; isError: boolean; ads: Ad[] }) {
  const { t } = useTranslation();
  if (isPending) return <AdsSkeleton />;
  if (isError) {
    return (
      <p className="text-card-foreground/60 w-full py-8 text-center text-sm">
        {t('dashboard.home.ads.error')}
      </p>
    );
  }
  if (ads.length === 0) return <AdsEmpty />;
  return (
    <ul className="grid w-full snap-x snap-mandatory [scrollbar-width:none] auto-cols-[15rem] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain pb-1 [&::-webkit-scrollbar]:hidden">
      {ads.map((ad) => (
        <AdRow key={ad.id} ad={ad} />
      ))}
    </ul>
  );
}

function AdRow({ ad }: { ad: Ad }) {
  const { t } = useTranslation();
  return (
    <li className="bg-card border-border hover:border-create-option-purple/40 flex min-h-[164px] w-full snap-start flex-col justify-between gap-4 rounded-2xl border p-4 transition-[border-color,box-shadow] hover:shadow-md">
      <div className="flex w-full flex-col items-end gap-2">
        <AdStatusBadge status={ad.status} />
        <p className="text-card-foreground w-full truncate text-end text-base font-medium">
          {ad.title || t('dashboard.home.ads.untitled')}
        </p>
      </div>
      <div className="flex w-full flex-col gap-1.5 text-sm">
        <Metric label={t('dashboard.home.ads.impressions')} value={count(ad.impressions)} />
        <Metric label={t('dashboard.home.ads.clicks')} value={count(ad.clicks)} />
        <Metric label={t('dashboard.home.ads.ctr')} value={`${(ad.ctr ?? 0).toFixed(2)}%`} />
      </div>
    </li>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      {/* Value at the inline-start, label at the inline-end — same convention as the
          earnings rows + ActiveProjectRow (order-first pulls the value to the start). */}
      <span className="text-card-foreground/60">{label}</span>
      <span className="text-card-foreground order-first font-medium">{value}</span>
    </div>
  );
}

function AdStatusBadge({ status }: { status?: AdStatus | null }) {
  const { t } = useTranslation();
  const badge = STATUS_BADGE[status ?? ''] ?? {
    className: 'bg-muted text-card-foreground/60',
    key: 'unknown',
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${badge.className}`}
    >
      {t(`dashboard.home.ads.status.${badge.key}`)}
    </span>
  );
}

function count(n?: number | null) {
  return Math.round(n ?? 0).toLocaleString();
}

function AdsEmpty() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col items-center gap-2 py-10 text-center">
      <p className="text-card-foreground text-base font-medium">{t('dashboard.home.ads.empty')}</p>
      <p className="text-card-foreground/60 max-w-[360px] text-sm">
        {t('dashboard.home.ads.emptyHint')}
      </p>
    </div>
  );
}

function AdsSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="bg-muted h-24 w-full animate-pulse rounded-xl" />
      ))}
    </div>
  );
}
