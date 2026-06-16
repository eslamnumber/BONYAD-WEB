'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import { useDeleteProject } from '../../api/delete-project';

import { DeleteProjectModal } from './delete-project-modal';

const ACTION = 'h-12 w-full rounded-lg text-[15px] font-semibold';

/**
 * Customer actions on a pending project (RN ProjectDetailScreen, `!isTechnician`):
 * Edit (links to the owner-edit route) + Delete (confirm modal → DELETE, then back
 * to the projects list). Shown only to the project owner via the role gate in
 * {@link JobOfferDetail}.
 */
export function CustomerProjectActions({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const remove = useDeleteProject();

  const confirmDelete = () => {
    setFailed(false);
    remove.mutate(projectId, {
      onSuccess: () => {
        setConfirmOpen(false);
        router.push('/dashboard/projects');
      },
      onError: () => setFailed(true),
    });
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        asChild
        className={`bg-brand-dark-navy text-on-media motion-safe:hover:opacity-90 ${ACTION}`}
      >
        <Link href={`/dashboard/projects/${projectId}/edit`}>
          {t('dashboard.jobOffer.customer.editProject')}
        </Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        className={`border-destructive text-destructive ${ACTION}`}
      >
        {t('dashboard.jobOffer.customer.deleteProject')}
      </Button>
      <DeleteProjectModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={remove.isPending}
        error={failed}
      />
    </div>
  );
}
