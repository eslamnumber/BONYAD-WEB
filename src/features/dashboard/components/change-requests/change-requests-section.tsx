'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PlusIcon } from '@/components/icons';
import { useAuthStore } from '@/stores/auth-store';

import { useActiveChangeRequests } from '../../api/get-active-change-requests';
import type { ChangeRequest } from '../../schemas/change-request';
import type { ProjectPhase } from '../../schemas/project-phase';

import { ChangeRequestCard } from './change-request-card';
import { ChangeRequestForm } from './change-request-form';
import { ChangeRequestThread } from './change-request-thread';
import type { ChangeRequestViews } from './use-change-request-views';

type Props = { projectId: number; phases: ProjectPhase[]; views: ChangeRequestViews };

/**
 * Change-request hub on the IN_PROGRESS project screen (both roles). Lists the
 * active negotiations as cards + a "Request modification" button, and hosts the
 * create form and the thread dialog. Role + the viewer's contact details come from
 * the auth store; modal state is owned by the screen ({@link useChangeRequestViews})
 * so a phase row can open the same create form. Mounted by
 * {@link InProgressProjectDetail} (technician) and {@link CustomerInProgressDetail}.
 */
export function ChangeRequestsSection({ projectId, phases, views }: Props) {
  const user = useAuthStore((s) => s.user);
  const isTechnician = (user?.role ?? '').toUpperCase() === 'TECHNICIAN';
  const { data: active = [], isPending, isError } = useActiveChangeRequests(projectId);

  return (
    <section className="bg-card border-border flex w-full flex-col gap-4 rounded-xl border p-6">
      <Header onRequest={() => views.openCreate()} />
      <ActiveList
        active={active}
        isPending={isPending}
        isError={isError}
        isTechnician={isTechnician}
        onView={views.openThread}
      />
      {views.view.type === 'create' && (
        <ChangeRequestForm
          projectId={projectId}
          isTechnician={isTechnician}
          viewer={{ email: user?.email, phone: user?.phoneNumber }}
          phases={phases}
          seedPhaseId={views.view.seedPhaseId}
          onClose={views.close}
        />
      )}
      {views.view.type === 'thread' && (
        <ChangeRequestThread
          projectId={projectId}
          cr={views.view.cr}
          isTechnician={isTechnician}
          onClose={views.close}
        />
      )}
    </section>
  );
}

function Header({ onRequest }: { onRequest: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap-reverse items-start justify-between gap-3">
        <button
          type="button"
          onClick={onRequest}
          className="bg-brand-dark-navy text-on-media focus-visible:outline-ring inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90"
        >
          <PlusIcon className="size-4 shrink-0" aria-hidden />
          {t('dashboard.changeRequests.section.requestModification')}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="text-foreground text-end text-lg font-medium">
            {t('dashboard.changeRequests.section.title')}
          </h2>
          <p dir="auto" className="text-muted-foreground text-start text-sm">
            {t('dashboard.changeRequests.section.subtitle')}
          </p>
        </div>
      </div>
      <hr className="border-border w-full border-t" />
    </div>
  );
}

type ListProps = {
  active: ChangeRequest[];
  isPending: boolean;
  isError: boolean;
  isTechnician: boolean;
  onView: (cr: ChangeRequest) => void;
};

function ActiveList({ active, isPending, isError, isTechnician, onView }: ListProps) {
  const { t } = useTranslation();
  if (isPending) return <Note>{t('dashboard.changeRequests.section.loading')}</Note>;
  if (isError) return <Note>{t('dashboard.changeRequests.section.error')}</Note>;
  if (active.length === 0) return <Note>{t('dashboard.changeRequests.section.empty')}</Note>;

  return (
    <div className="flex w-full flex-col gap-3">
      {active.map((cr) => (
        <ChangeRequestCard
          key={cr.id}
          cr={cr}
          isTechnician={isTechnician}
          onView={() => onView(cr)}
        />
      ))}
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p dir="auto" className="text-muted-foreground text-start text-sm">
      {children}
    </p>
  );
}
