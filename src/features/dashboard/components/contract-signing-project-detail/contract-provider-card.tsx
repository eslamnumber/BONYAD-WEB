'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { MessageCircleIcon, StarIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import {
  getUserProfile,
  profileAvatar,
  profileRating,
  userProfileQueryKey,
} from '../../api/get-user-profile';
import { type ProjectDetail } from '../../schemas/project';
import { type UserProfile } from '../../schemas/user-profile';

/**
 * Selected-provider card (Figma node 1501:14684): heading + divider, then a
 * message action and the accepted technician's name / role / rating + avatar.
 * Backend-driven from the project's `assignedTechnicianId` → GET /users/:id/profile
 * (name, rating, avatar). Values degrade to "—" / hide while the profile loads.
 */
export function ContractProviderCard({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation();
  const technicianId = project.assignedTechnicianId;
  const { data: profile } = useQuery({
    queryKey: userProfileQueryKey(technicianId ?? 0),
    queryFn: () => getUserProfile(technicianId as number),
    enabled: typeof technicianId === 'number' && technicianId > 0,
    staleTime: 1000 * 60 * 5,
  });

  const messageHref =
    typeof technicianId === 'number'
      ? ROUTES.DASHBOARD_MESSAGE_FOR(technicianId, { name: profile?.name, projectId: project.id })
      : ROUTES.DASHBOARD_MESSAGES;

  return (
    <section className="bg-card border-border flex w-full flex-col gap-6 rounded-xl border p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
      <div className="flex w-full flex-col items-end gap-3">
        <h2 className="text-foreground text-end text-lg font-medium">
          {t('dashboard.contractSigning.provider.heading')}
        </h2>
        <div className="bg-border h-px w-full" />
      </div>

      <div className="flex w-full items-center justify-between gap-4">
        <Link
          href={messageHref}
          aria-label={t('dashboard.contractSigning.provider.messageLabel')}
          className="bg-brand-dark-navy text-on-media focus-visible:outline-ring flex size-11 shrink-0 items-center justify-center rounded-full transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90"
        >
          <MessageCircleIcon className="size-[18px]" aria-hidden />
        </Link>
        <ProviderDetails profile={profile} />
      </div>
    </section>
  );
}

function ProviderDetails({ profile }: { profile?: UserProfile }) {
  const { t } = useTranslation();
  const rating = profileRating(profile);

  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex min-w-0 flex-col items-end gap-1">
        <p className="text-foreground text-end text-base font-semibold">
          <bdi>{profile?.name ?? '—'}</bdi>
        </p>
        <p className="text-foreground/60 text-end text-[13px]">
          {t('dashboard.contractSigning.provider.role')}
        </p>
        {typeof rating === 'number' ? (
          <span className="flex items-center gap-1">
            <StarIcon className="text-rating-star size-3.5 shrink-0" aria-hidden />
            <span className="text-foreground/60 text-[13px]">
              <bdi>{rating.toFixed(1)}</bdi>
            </span>
          </span>
        ) : null}
      </div>
      <Avatar name={profile?.name} src={profileAvatar(profile)} className="size-16 shrink-0" />
    </div>
  );
}
