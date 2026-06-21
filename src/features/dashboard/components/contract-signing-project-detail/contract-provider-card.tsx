'use client';

import { useQuery } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
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
 * Contract counterpart card (Figma node 1501:14684): heading + divider, then a
 * message action and the peer's name / role / rating + avatar. Role-aware because
 * the CONTRACT_SIGNING screen renders for both parties: the **customer** sees the
 * selected technician (`assignedTechnicianId`), the **technician** sees the project
 * client (`userId`). The message action + profile fetch both target that peer, so the
 * technician messages the client — never themselves (the prior self-chat bug, when the
 * card was provider-only). Backend-driven via GET /users/:id/profile (name, rating,
 * avatar); values degrade to "—" / hide while the profile loads.
 */
export function ContractProviderCard({
  project,
  isTechnician,
}: {
  project: ProjectDetail;
  isTechnician: boolean;
}) {
  const { t } = useTranslation();
  const peerId = isTechnician ? project.userId : project.assignedTechnicianId;
  const { data: profile } = useQuery({
    queryKey: userProfileQueryKey(peerId ?? 0),
    queryFn: () => getUserProfile(peerId as number),
    enabled: typeof peerId === 'number' && peerId > 0,
    staleTime: 1000 * 60 * 5,
  });

  const peerName = profile?.name ?? (isTechnician ? project.userName : undefined);
  const copy = peerCopy(t, isTechnician);
  const messageHref =
    typeof peerId === 'number'
      ? ROUTES.DASHBOARD_MESSAGE_FOR(peerId, { name: peerName, projectId: project.id })
      : ROUTES.DASHBOARD_MESSAGES;

  return (
    <section className="bg-card border-border flex w-full flex-col gap-6 rounded-xl border p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
      <div className="flex w-full flex-col items-end gap-3">
        <h2 className="text-foreground text-end text-lg font-medium">{copy.heading}</h2>
        <div className="bg-border h-px w-full" />
      </div>

      <div className="flex w-full items-center justify-between gap-4">
        <Link
          href={messageHref}
          aria-label={copy.message}
          className="bg-brand-dark-navy text-on-media focus-visible:outline-ring flex size-11 shrink-0 items-center justify-center rounded-full transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90"
        >
          <MessageCircleIcon className="size-[18px]" aria-hidden />
        </Link>
        <ProviderDetails name={peerName} roleLabel={copy.role} profile={profile} />
      </div>
    </section>
  );
}

/** Heading / role / message-action copy for the card's peer — the technician sees the
 *  project client, the customer the selected provider. Literal keys (no dynamic `t`). */
function peerCopy(t: TFunction, isTechnician: boolean) {
  if (isTechnician) {
    return {
      heading: t('dashboard.contractSigning.client.heading'),
      role: t('dashboard.contractSigning.client.role'),
      message: t('dashboard.contractSigning.client.messageLabel'),
    };
  }
  return {
    heading: t('dashboard.contractSigning.provider.heading'),
    role: t('dashboard.contractSigning.provider.role'),
    message: t('dashboard.contractSigning.provider.messageLabel'),
  };
}

function ProviderDetails({
  name,
  roleLabel,
  profile,
}: {
  name?: string;
  roleLabel: string;
  profile?: UserProfile;
}) {
  const rating = profileRating(profile);

  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex min-w-0 flex-col items-end gap-1">
        <p className="text-foreground text-end text-base font-semibold">
          <bdi>{name ?? '—'}</bdi>
        </p>
        <p className="text-foreground/60 text-end text-[13px]">{roleLabel}</p>
        {typeof rating === 'number' ? (
          <span className="flex items-center gap-1">
            <StarIcon className="text-rating-star size-3.5 shrink-0" aria-hidden />
            <span className="text-foreground/60 text-[13px]">
              <bdi>{rating.toFixed(1)}</bdi>
            </span>
          </span>
        ) : null}
      </div>
      <Avatar name={name} src={profileAvatar(profile)} className="size-16 shrink-0" />
    </div>
  );
}
