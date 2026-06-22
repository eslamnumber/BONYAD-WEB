'use client';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { DetailLocationIcon, EyeIcon, LockIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { buildAssetUrl } from '@/lib/backend';
import { useAuthStore } from '@/stores/auth-store';
import { type AuthUser } from '@/types/auth';

import { type Portfolio } from '../schemas/portfolio';

import { PortfolioStatRecord } from './portfolio-stat-record';

/** Public / private status — an icon + the state word, toned by visibility. */
function VisibilityChip({ isPublic }: { isPublic: boolean }) {
  const { t } = useTranslation();
  const Icon = isPublic ? EyeIcon : LockIcon;
  const tone = isPublic ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {isPublic ? t('portfolio.info.public') : t('portfolio.info.private')}
    </span>
  );
}

/** Dynamic city byline with a location pin. Null when no city is set. */
function LocationLine({ city }: { city?: string }) {
  if (!city) return null;
  return (
    <span
      dir="auto"
      className="text-muted-foreground inline-flex items-center gap-1.5 text-start text-sm"
    >
      <DetailLocationIcon className="size-4 shrink-0" aria-hidden />
      {city}
    </span>
  );
}

/** The technician's specialties as scannable trade tags. Null when empty. */
function TradeTags({ specialties, label }: { specialties: string[]; label: string }) {
  if (specialties.length === 0) return null;
  return (
    <ul aria-label={label} className="mt-5 flex flex-wrap gap-2">
      {specialties.map((s) => (
        <li
          key={s}
          className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
        >
          <span dir="auto">{s}</span>
        </li>
      ))}
    </ul>
  );
}

/** Prominent profile photo + name + tagline + location — the identity block. */
function Identity({
  name,
  tagline,
  city,
  photoSrc,
}: {
  name: string;
  tagline?: string;
  city?: string;
  photoSrc?: string;
}) {
  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <Avatar
        name={name}
        src={photoSrc}
        className="ring-border size-20 shrink-0 text-3xl shadow-md ring-1 sm:size-24"
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1
          dir="auto"
          className="text-foreground text-start text-2xl font-bold tracking-tight break-words sm:text-3xl"
        >
          {name}
        </h1>
        {tagline ? (
          <p
            dir="auto"
            className="text-muted-foreground text-start text-sm break-words sm:text-base"
          >
            {tagline}
          </p>
        ) : null}
        <LocationLine city={city} />
      </div>
    </div>
  );
}

/** Display name — portfolio business/user name, falling back to the signed-in tech. */
function headerName(portfolio: Portfolio, user: AuthUser | null): string {
  return portfolio.businessName ?? portfolio.userName ?? user?.name ?? '';
}

/**
 * Profile photo URL — from the portfolio payload or, failing that, the signed-in
 * technician's avatar (it's their own portfolio). Always through `buildAssetUrl` so a
 * relative backend path loads instead of rendering a blank circle; undefined → the
 * avatar shows the name initial.
 */
function headerPhoto(portfolio: Portfolio, user: AuthUser | null): string | undefined {
  const photo = portfolio.userProfileImage || user?.profileImage;
  return photo ? buildAssetUrl(photo) : undefined;
}

/**
 * Portfolio masthead — one merged header carrying the page identity (a "My portfolio"
 * kicker), the technician's prominent profile photo, business name, tagline, location,
 * trade tags, headline stats, and the edit control, over Bonyad's signature glow.
 * Replaces the old plain title + separate identity card. My own web design.
 */
export function PortfolioHeader({
  portfolio,
  projectCount,
  onEdit,
}: {
  portfolio: Portfolio;
  projectCount: number;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const name = headerName(portfolio, user);
  const photoSrc = headerPhoto(portfolio, user);
  const isPublic = portfolio.published ?? portfolio.isPublic ?? true;
  const years = portfolio.yearsActive ?? portfolio.yearsOfExperience;

  return (
    <section className="bg-card border-border relative isolate overflow-hidden rounded-2xl border p-6 shadow-sm sm:p-8">
      <div
        aria-hidden
        className="bg-deco-blob-blue-light pointer-events-none absolute end-0 -top-20 -z-10 size-64 rounded-full opacity-25 blur-[100px]"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-start text-xs font-semibold tracking-wide uppercase">
          {t('portfolio.title')}
        </span>
        <VisibilityChip isPublic={isPublic} />
      </div>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Identity
          name={name}
          tagline={portfolio.tagline}
          city={portfolio.city}
          photoSrc={photoSrc}
        />
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          className="w-full shrink-0 sm:w-auto"
        >
          {t('portfolio.edit.button')}
        </Button>
      </div>
      <TradeTags specialties={portfolio.specialties} label={t('portfolio.fields.specialties')} />
      <div className="mt-6">
        <PortfolioStatRecord projectCount={projectCount} years={years} />
      </div>
    </section>
  );
}
