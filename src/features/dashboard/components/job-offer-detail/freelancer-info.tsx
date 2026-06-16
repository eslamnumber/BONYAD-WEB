'use client';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';

import { TechnicianRating } from './technician-rating';

const AVATAR = { sm: 'size-10', lg: 'size-[73px]' } as const;
const NAME = { sm: 'text-sm', lg: 'text-xl' } as const;

type Props = {
  name?: string;
  reviewCount?: number;
  rating?: number;
  avatarUrl?: string;
  /** `sm` for the bid-card header (40px avatar), `lg` for the accept modal (73px). */
  size: 'sm' | 'lg';
};

/**
 * The technician block shown on a bid card and in the accept-bid modal: name,
 * "N completed projects", a star rating, and the avatar — reused at two sizes so
 * the card and modal never duplicate the layout. The avatar falls back to the
 * name initial when there is no profile image; rating + count are hidden when the
 * profile fetch returned nothing (degrades to name-only).
 */
export function FreelancerInfo({ name, reviewCount, rating, avatarUrl, size }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-end gap-3">
      <div className="flex flex-col items-end gap-2">
        <p dir="auto" className={`text-foreground font-medium ${NAME[size]}`}>
          <bdi>{name}</bdi>
        </p>
        {reviewCount !== undefined ? (
          <p dir="auto" className="text-foreground/60 text-sm">
            {t('dashboard.jobOffer.customer.bids.completedProjects', { count: reviewCount })}
          </p>
        ) : null}
        {rating ? <TechnicianRating rating={rating} /> : null}
      </div>
      <Avatar name={name} src={avatarUrl} className={`${AVATAR[size]} shrink-0`} />
    </div>
  );
}
