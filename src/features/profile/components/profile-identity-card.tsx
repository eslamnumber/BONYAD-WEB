'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { DetailRateIcon, FeatureVerifiedIcon, PersonIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import type { ProfileIdentity } from '../lib/identity';

/** Frosted trust chip — verification / rating / reviews / profession. */
const PILL =
  'inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium';

/** Technician trust pills — profession, rating, reviews (real profile data only). */
function IdentityTrustPills({ identity }: { identity: ProfileIdentity }) {
  const { t } = useTranslation();
  const hasRating = typeof identity.rating === 'number';
  const hasReviews = typeof identity.reviews === 'number';
  if (!identity.isTechnician || (!identity.profession && !hasRating && !hasReviews)) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-white/90">
      {identity.profession ? (
        <span className={PILL} dir="auto">
          {identity.profession}
        </span>
      ) : null}
      {hasRating ? (
        <span className={PILL}>
          <DetailRateIcon className="size-3.5" aria-hidden />
          {identity.rating!.toFixed(1)}
        </span>
      ) : null}
      {hasReviews ? (
        <span className={PILL}>{t('profile.identity.reviews', { count: identity.reviews })}</span>
      ) : null}
    </div>
  );
}

/**
 * Profile hero — centred brand-blue identity banner. The avatar leads, with the
 * name + Wathq seal and the trust pills (rating / reviews / profession) stacked
 * beneath, so the composition stays balanced on a wide dashboard instead of
 * splitting to the edges. Edit sits as a top-corner action; the Bonyad
 * construction skyline runs faintly along the base. All colours are tokens
 * (`--primary` → `--brand-navy`, white via `--primary-foreground`); the name is
 * user data so it carries `dir="auto"`.
 */
export function ProfileIdentityCard({ identity }: { identity: ProfileIdentity }) {
  const { t } = useTranslation();
  return (
    <div className="from-primary to-brand-navy text-primary-foreground relative isolate flex flex-col items-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-bl px-5 py-8 text-center shadow-sm sm:py-9">
      {/* Bonyad construction-skyline motif — faint white silhouette along the banner base. */}
      <Image
        src="/images/bg/customer-dashboard-skyline.png"
        alt=""
        width={1264}
        height={712}
        sizes="900px"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-32 w-full [mask-image:linear-gradient(to_top,black,transparent)] object-cover object-bottom opacity-[0.13] invert select-none sm:block rtl:-scale-x-100"
      />

      <Link
        href={ROUTES.DASHBOARD_SETTINGS_PROFILE}
        className="focus-visible:outline-ring absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:bg-white/20"
      >
        <PersonIcon className="size-3.5" aria-hidden />
        {t('profile.identity.edit')}
      </Link>

      <Avatar
        name={identity.name}
        src={identity.profileImage}
        className="size-20 border-2 border-white/60 bg-white/15 text-2xl text-white shadow-md sm:size-24"
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xl font-semibold sm:text-2xl" dir="auto">
          {identity.name}
        </span>
        {identity.isCompany ? (
          <span className={PILL}>
            <FeatureVerifiedIcon className="size-3.5" aria-hidden />
            {t('profile.identity.wathqVerified')}
          </span>
        ) : null}
      </div>

      <IdentityTrustPills identity={identity} />
    </div>
  );
}
