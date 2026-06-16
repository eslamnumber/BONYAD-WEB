'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import { useOwnerEdit } from '../../api/get-owner-edit';
import { responseToFormValues } from '../../lib/owner-edit-mapping';

import { ProjectEditForm } from './project-edit-form';

/**
 * Customer project-edit screen (route /dashboard/projects/[id]/edit). Loads the
 * owner-editable view (GET /owner-edit), maps it to form defaults, and renders the
 * form. Save/cancel return to the previous screen; the save mutation invalidates
 * the project caches so the detail refetches on return.
 */
export function ProjectEdit({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isPending, isError, refetch } = useOwnerEdit(projectId);
  const defaults = useMemo(() => (data ? responseToFormValues(data) : null), [data]);

  const goBack = () => router.back();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex w-full flex-col gap-2">
        <h1 className="text-foreground text-end text-2xl font-bold">
          {t('dashboard.projectEdit.title')}
        </h1>
        <p className="text-foreground/60 text-end text-sm">{t('dashboard.projectEdit.subtitle')}</p>
      </header>
      {isPending ? (
        <p className="text-foreground/60 text-end text-sm">{t('dashboard.projectEdit.loading')}</p>
      ) : isError || !defaults ? (
        <div className="flex w-full flex-col items-end gap-3">
          <p className="text-destructive text-end text-sm">
            {t('dashboard.projectEdit.loadError')}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="border-border text-foreground h-10 rounded-lg text-sm"
          >
            {t('dashboard.projectEdit.retry')}
          </Button>
        </div>
      ) : (
        <ProjectEditForm
          projectId={projectId}
          defaultValues={defaults}
          onSaved={goBack}
          onCancel={goBack}
        />
      )}
    </div>
  );
}
