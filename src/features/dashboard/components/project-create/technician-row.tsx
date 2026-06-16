'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { ROUTES } from '@/config/routes';

import { technicianAvatar, technicianName, technicianRating } from '../../lib/technician-format';
import { type Technician } from '../../schemas/technician';

import { StarRating } from './star-rating';

const K = 'dashboard.createProject.technicianPicker';

/** One technician row in the picker (Figma 1394:7822): choose / view-profile, name + rating, avatar. */
export function TechnicianRow({
  technician,
  onChoose,
}: {
  technician: Technician;
  onChoose: () => void;
}) {
  const { t } = useTranslation();
  const name = technicianName(technician);

  return (
    <div className="flex w-full items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onChoose}
          className="bg-brand-dark-navy text-on-media rounded-full px-6 py-2 text-[13px] font-semibold"
        >
          {t(`${K}.choose`)}
        </button>
        <Link
          href={ROUTES.TECHNICIAN_DETAIL(String(technician.id))}
          target="_blank"
          prefetch={false}
          className="border-border text-foreground/60 rounded-lg border px-3 py-2 text-[13px] font-semibold"
        >
          {t(`${K}.viewProfile`)}
        </Link>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-foreground text-[15px] font-medium">
          <bdi>{name}</bdi>
        </p>
        <StarRating rating={technicianRating(technician)} />
      </div>
      <Avatar name={name} src={technicianAvatar(technician)} className="size-10 shrink-0" />
    </div>
  );
}
