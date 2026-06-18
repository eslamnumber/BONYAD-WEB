'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui';

import { type Portfolio } from '../schemas/portfolio';

/** Public / private visibility chip. */
function VisibilityChip({ isPublic }: { isPublic: boolean }) {
  const { t } = useTranslation();
  const tone = isPublic ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {isPublic ? t('portfolio.info.public') : t('portfolio.info.private')}
    </span>
  );
}

/** One stat tile (value over label). A logical inline-end border divides the pair. */
function StatCell({ value, label, divider }: { value: string; label: string; divider?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-0.5 py-4 ${divider ? 'border-border border-e' : ''}`}
    >
      <span className="text-foreground text-xl font-bold">{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

/** Centred avatar + name + tagline + visibility, over a quiet blue glow (My-info parity). */
function IdentityHeader({ portfolio, name }: { portfolio: Portfolio; name: string }) {
  const isPublic = portfolio.published ?? portfolio.isPublic ?? true;
  return (
    <div className="flex flex-col items-center gap-3 px-5 pt-8 pb-6 text-center">
      <div
        aria-hidden
        className="bg-deco-blob-blue-light pointer-events-none absolute inset-x-0 -top-14 -z-10 mx-auto size-44 rounded-full opacity-25 blur-[60px]"
      />
      <Avatar
        name={name}
        src={portfolio.userProfileImage}
        className="ring-border size-20 text-2xl shadow-sm ring-1"
      />
      <div className="flex flex-col items-center gap-1">
        <h2 dir="auto" className="text-foreground text-lg font-semibold break-words">
          {name}
        </h2>
        {portfolio.tagline ? (
          <p dir="auto" className="text-muted-foreground text-sm break-words">
            {portfolio.tagline}
          </p>
        ) : null}
      </div>
      <VisibilityChip isPublic={isPublic} />
    </div>
  );
}

/** Labelled detail block (Specialties / About) — a static label over its content. */
function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-muted-foreground text-start text-xs font-semibold tracking-wide uppercase">
        {label}
      </h3>
      {children}
    </div>
  );
}

/** Specialties pills + bio + city, under the stats. Null when there's nothing to show. */
function DetailsSection({ portfolio }: { portfolio: Portfolio }) {
  const { t } = useTranslation();
  if (portfolio.specialties.length === 0 && !portfolio.bio && !portfolio.city) return null;
  return (
    <div className="border-border flex flex-col gap-4 border-t p-5">
      {portfolio.specialties.length > 0 ? (
        <DetailBlock label={t('portfolio.fields.specialties')}>
          <ul className="flex flex-wrap gap-2">
            {portfolio.specialties.map((s) => (
              <li
                key={s}
                className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
              >
                <span dir="auto">{s}</span>
              </li>
            ))}
          </ul>
        </DetailBlock>
      ) : null}
      {portfolio.bio ? (
        <DetailBlock label={t('portfolio.fields.bio')}>
          <p dir="auto" className="text-foreground/90 text-start text-sm leading-6 break-words">
            {portfolio.bio}
          </p>
        </DetailBlock>
      ) : null}
      {portfolio.city ? (
        <p dir="auto" className="text-muted-foreground text-start text-xs">
          {portfolio.city}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Portfolio identity card — a rich profile panel (avatar · name · visibility · a
 * projects/years stat pair · specialties · bio · edit). Designed to fill the dashboard
 * sidebar column, not stretch as a full-width bar. My own web design, mirroring the
 * My-info summary's quality (glow-backed avatar, token-only).
 */
export function PortfolioInfoCard({
  portfolio,
  projectCount,
  onEdit,
}: {
  portfolio: Portfolio;
  projectCount: number;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const name = portfolio.businessName ?? portfolio.userName ?? '';
  const years = portfolio.yearsActive ?? portfolio.yearsOfExperience;

  return (
    <div className="bg-card border-border relative isolate flex flex-col overflow-hidden rounded-2xl border shadow-sm">
      <IdentityHeader portfolio={portfolio} name={name} />
      <div className="border-border grid grid-cols-2 border-t">
        <StatCell value={String(projectCount)} label={t('portfolio.info.projectsStat')} divider />
        <StatCell
          value={years !== undefined ? String(years) : '—'}
          label={t('portfolio.info.yearsStat')}
        />
      </div>
      <DetailsSection portfolio={portfolio} />
      <div className="border-border border-t p-5">
        <Button type="button" variant="outline" onClick={onEdit} className="w-full">
          {t('portfolio.edit.button')}
        </Button>
      </div>
    </div>
  );
}
